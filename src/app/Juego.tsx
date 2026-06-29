import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAccesibilidad } from '../context/AccesibilidadContext';
import { auth } from '../service/firebaseConfig';
import { guardarResultado, obtenerDatosJuego, registrarIntento, verificarModuloCompleto } from '../service/sopaService';
import { calcularTamano, Celda, generarGrilla, PalabraEnGrilla } from '../utils/generadorsopa';

const PADDING = 12;

const COLORES_PALABRAS = [
  'rgba(255, 183, 77, 0.5)',
  'rgba(129, 199, 132, 0.5)',
  'rgba(100, 181, 246, 0.5)',
  'rgba(240, 98, 146, 0.5)',
  'rgba(186, 104, 200, 0.5)',
  'rgba(77, 208, 225, 0.5)',
];

export default function Juego() {
  const router = useRouter();
  const { colores, escalaFuente, modoOscuro } = useAccesibilidad();
  const { id: juegoId } = useLocalSearchParams<{ id: string }>();
  const uid = auth.currentUser?.uid;
  const { width: ANCHO_PANTALLA } = Dimensions.get('window');

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [titulo, setTitulo] = useState('');
  const [moduloId, setModuloId] = useState('');
  const [grilla, setGrilla] = useState<Celda[][]>([]);
  const [palabras, setPalabras] = useState<PalabraEnGrilla[]>([]);
  const [colorPalabra, setColorPalabra] = useState<{ [palabra: string]: string }>({});
  const [colorCelda, setColorCelda] = useState<{ [key: string]: string }>({});
  const [seleccionActual, setSeleccionActual] = useState<{ fila: number; columna: number }[]>([]);
  const [tiempoRestante, setTiempoRestante] = useState(300);
  const [tiempoInicio, setTiempoInicio] = useState(300);
  const [juegoTerminado, setJuegoTerminado] = useState(false);
  const [juegoGanado, setJuegoGanado] = useState(false);
  const [puntaje, setPuntaje] = useState(0);
  const [guardando, setGuardando] = useState(false);

  const TAMANO_CELDA = grilla.length > 0
    ? Math.floor((ANCHO_PANTALLA - PADDING * 2) / grilla.length)
    : Math.floor((ANCHO_PANTALLA - PADDING * 2) / 9);

  const grillaRef = useRef<View>(null);
  const grillaLayout = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const palabrasRef = useRef<PalabraEnGrilla[]>([]);
  const grillaStateRef = useRef<Celda[][]>([]);
  const colorCeldaRef = useRef<{ [key: string]: string }>({});
  const colorIndexRef = useRef(0);

  useEffect(() => {
    if (juegoId) cargarJuego();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [juegoId]);

  useEffect(() => { palabrasRef.current = palabras; }, [palabras]);
  useEffect(() => { grillaStateRef.current = grilla; }, [grilla]);
  useEffect(() => { colorCeldaRef.current = colorCelda; }, [colorCelda]);

  const cargarJuego = async () => {
    try {
      setCargando(true);
      setError('');
      const datos = await obtenerDatosJuego(juegoId!);
      await registrarIntento(uid!, juegoId!, datos.moduloId);
      const tamano = calcularTamano(datos.Palabras);
      const { grilla: nuevaGrilla, palabrasEnGrilla } = generarGrilla(datos.Palabras, tamano);
      setTitulo(datos.titulo);
      setModuloId(datos.moduloId);
      setGrilla(nuevaGrilla);
      setPalabras(palabrasEnGrilla);
      iniciarTimer();
    } catch (e) {
      console.error('Error:', e);
      setError('No se pudo cargar el juego. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  const iniciarTimer = () => {
    setTiempoInicio(300);
    timerRef.current = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setJuegoTerminado(true);
          setJuegoGanado(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatearTiempo = (segundos: number) => {
    const m = Math.floor(segundos / 60).toString().padStart(2, '0');
    const s = (segundos % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const obtenerCeldaDesdePos = useCallback((px: number, py: number) => {
    const { x, y } = grillaLayout.current;
    const relX = px - x;
    const relY = py - y;
    const columna = Math.floor(relX / TAMANO_CELDA);
    const fila = Math.floor(relY / TAMANO_CELDA);
    const tamano = grillaStateRef.current.length;
    if (fila >= 0 && fila < tamano && columna >= 0 && columna < tamano) {
      return { fila, columna };
    }
    return null;
  }, [TAMANO_CELDA]);

  const verificarPalabra = useCallback((seleccion: { fila: number; columna: number }[]) => {
    if (seleccion.length < 2) return;

    const letrasSeleccionadas = seleccion
      .map(({ fila, columna }) => grillaStateRef.current[fila]?.[columna]?.letra || '')
      .join('');

    const palabrasActuales = palabrasRef.current;
    const encontrada = palabrasActuales.find(
      (p) => !p.encontrada && p.palabra === letrasSeleccionadas
    );

    if (encontrada) {
      const color = COLORES_PALABRAS[colorIndexRef.current % COLORES_PALABRAS.length];
      colorIndexRef.current += 1;

      const nuevosColores = { ...colorCeldaRef.current };
      encontrada.celdas.forEach(({ fila, columna }) => {
        nuevosColores[`${fila}-${columna}`] = color;
      });

      const nuevasPalabras = palabrasActuales.map((p) =>
        p.palabra === encontrada.palabra ? { ...p, encontrada: true } : p
      );

      const nuevaGrilla = grillaStateRef.current.map((fila) => fila.map((c) => ({ ...c })));
      encontrada.celdas.forEach(({ fila, columna }) => {
        nuevaGrilla[fila][columna].encontrada = true;
      });

      setColorPalabra((prev) => ({ ...prev, [encontrada.palabra]: color }));
      setColorCelda(nuevosColores);
      setPuntaje((prev) => prev + 100);
      setPalabras(nuevasPalabras);
      setGrilla(nuevaGrilla);

      if (nuevasPalabras.every((p) => p.encontrada)) {
        clearInterval(timerRef.current!);
        setJuegoGanado(true);
        setJuegoTerminado(true);
      }
    }
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        const celda = obtenerCeldaDesdePos(e.nativeEvent.pageX, e.nativeEvent.pageY);
        if (celda) setSeleccionActual([celda]);
      },
      onPanResponderMove: (e) => {
        const celda = obtenerCeldaDesdePos(e.nativeEvent.pageX, e.nativeEvent.pageY);
        if (!celda) return;
        setSeleccionActual((prev) => {
          const ultima = prev[prev.length - 1];
          if (!ultima || (ultima.fila === celda.fila && ultima.columna === celda.columna)) return prev;
          return [...prev, celda];
        });
      },
      onPanResponderRelease: () => {
        setSeleccionActual((prev) => {
          verificarPalabra(prev);
          return [];
        });
      },
    })
  ).current;

  const estaSeleccionada = (fila: number, columna: number) =>
    seleccionActual.some((c) => c.fila === fila && c.columna === columna);

const handleGuardarYSalir = async () => {
  if (!uid || !juegoId || !moduloId) return;
  try {
    setGuardando(true);
    await guardarResultado(uid, juegoId, moduloId, puntaje);
    const resultado = await verificarModuloCompleto(uid, moduloId);

    if (resultado.insigniaOtorgada) {
      // Navega a la pantalla de entrega de insignia
      router.replace({
        pathname: '/entregaInsignia',
        params: {
          nombreInsignia: resultado.nombreInsignia || '',
          moduloId: moduloId,
        },
      });
    } else {
      router.back();
    }
  } catch (e) {
    console.error('Error guardando resultado:', e);
  } finally {
    setGuardando(false);
  }
};

  if (cargando) return (
    <View style={[styles.centrado, { backgroundColor: colores.fondo }]}>
      <ActivityIndicator size="large" color={colores.primario} />
    </View>
  );

  if (error) return (
    <View style={[styles.centrado, { backgroundColor: colores.fondo }]}>
      <Text style={styles.errorTexto}>{error}</Text>
      <TouchableOpacity style={styles.botonReintentar} onPress={cargarJuego}>
        <Text style={styles.textoReintentar}>Reintentar</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.wrapper, { backgroundColor: colores.fondo }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitulo} numberOfLines={1}>{titulo}</Text>
        <View style={styles.timerContainer}>
          <Ionicons
            name="time"
            size={16}
            color={tiempoRestante < 60 ? '#E53935' : '#FFFFFF'}
          />
          <Text style={[styles.timerTexto, tiempoRestante < 60 && styles.timerUrgente]}>
            {formatearTiempo(tiempoRestante)}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.contenido}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.listaPalabras, { backgroundColor: colores.fondoTarjeta }]}>
          <Text style={[styles.listaTitulo, { color: colores.texto, fontSize: 13 * escalaFuente }]}>
            Palabras a encontrar:
          </Text>
          <View style={styles.palabrasGrid}>
            {palabras.map(({ palabra, encontrada }) => (
              <View
                key={palabra}
                style={[
                  styles.palabraBadge,
                  { backgroundColor: modoOscuro ? '#2A2A2A' : '#FDF8EC' },
                  encontrada && {
                    backgroundColor: colorPalabra[palabra] || 'rgba(46,125,50,0.2)',
                    borderColor: '#2E7D32',
                  },
                ]}
              >
                <Text style={[
                  styles.palabraTexto,
                  { color: modoOscuro ? '#FFFFFF' : '#1B3A6B' },
                  encontrada && styles.palabraEncontradaTexto,
                ]}>
                  {encontrada ? `✓ ${palabra}` : palabra}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View
          ref={grillaRef}
          onLayout={() => {
            grillaRef.current?.measure((_x, _y, _w, _h, pageX, pageY) => {
              grillaLayout.current = { x: pageX, y: pageY, width: _w, height: _h };
            });
          }}
          style={[styles.grillaContainer, { backgroundColor: modoOscuro ? '#2A2A2A' : '#FFFFFF' }]}
          {...panResponder.panHandlers}
        >
          {grilla.map((fila, f) => (
            <View key={f} style={styles.fila}>
              {fila.map((celda, c) => {
                const clave = `${f}-${c}`;
                const seleccionada = estaSeleccionada(f, c);
                const colorFondo = colorCelda[clave];
                return (
                  <View
                    key={c}
                    style={[
                      styles.celda,
                      { width: TAMANO_CELDA, height: TAMANO_CELDA, borderColor: modoOscuro ? '#444' : '#e0e0e0' },
                      colorFondo ? { backgroundColor: colorFondo } : null,
                      seleccionada ? styles.celdaSeleccionada : null,
                    ]}
                  >
                    <Text style={[
                      styles.letraCelda,
                      { fontSize: TAMANO_CELDA * 0.45, color: modoOscuro ? '#FFFFFF' : '#1a1a1a' },
                      celda.encontrada && styles.letraEncontrada,
                      seleccionada && styles.letraSeleccionada,
                    ]}>
                      {celda.letra}
                    </Text>
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* MODAL DE RESULTADO */}
      {juegoTerminado && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalResultado}>
            <Text style={styles.modalModalidad}>
              Modalidad: Sopa de letras
            </Text>
            <Text style={styles.modalMensaje}>
              {juegoGanado
                ? 'Excelente trabajo, sigue así.'
                : 'No te rindas, inténtalo de nuevo.'}
            </Text>
            <Text style={styles.modalDetalle}>
              {juegoGanado
                ? `Resuelta en: ${formatearTiempo(300 - tiempoRestante)}`
                : 'Tiempo agotado'}
            </Text>
            <Text style={styles.modalDetalle}>
              {`Estado: ${juegoGanado ? 'Completada' : 'No completada'}`}
            </Text>
            <Text style={styles.modalFrase}>
              Recuerda la clave del éxito es la constancia
            </Text>
            <TouchableOpacity
              style={styles.botonContinuar}
              onPress={handleGuardarYSalir}
              disabled={guardando}
            >
              <Text style={styles.textoBotonContinuar}>
                {guardando ? 'Guardando...' : 'Continuar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  centrado: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  errorTexto: { fontSize: 14, color: '#E53935', textAlign: 'center', marginBottom: 16 },
  botonReintentar: {
    backgroundColor: '#1B3A6B',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  textoReintentar: { color: '#fff', fontWeight: 'bold' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 12,
    backgroundColor: '#1B3A6B',
  },
  headerTitulo: {
    flex: 1,
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginHorizontal: 8,
  },
  timerContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timerTexto: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
  timerUrgente: { color: '#E53935' },
  contenido: { padding: PADDING, paddingBottom: 40 },
  listaPalabras: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
  },
  listaTitulo: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1B3A6B',
    marginBottom: 8,
  },
  palabrasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  palabraBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#1B3A6B',
    backgroundColor: '#FDF8EC',
  },
  palabraTexto: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1B3A6B',
  },
  palabraEncontradaTexto: {
    color: '#2E7D32',
    textDecorationLine: 'line-through',
  },
  grillaContainer: {
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 6,
    elevation: 3,
  },
  fila: { flexDirection: 'row' },
  celda: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
    borderRadius: 4,
  },
  celdaSeleccionada: {
    backgroundColor: 'rgba(27, 58, 107, 0.2)',
  },
  letraCelda: {
    fontWeight: '600',
    color: '#1a1a1a',
  },
  letraEncontrada: {
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  letraSeleccionada: {
    color: '#1B3A6B',
    fontWeight: 'bold',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalResultado: {
    backgroundColor: '#1B3A6B',
    borderRadius: 16,
    padding: 28,
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  modalModalidad: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  modalMensaje: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  modalDetalle: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  modalFrase: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
  },
  botonContinuar: {
    backgroundColor: '#F5C518',
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 10,
    marginTop: 8,
    alignItems: 'center',
  },
  textoBotonContinuar: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: 'bold',
  },
});