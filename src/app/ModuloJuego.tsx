import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useAccesibilidad } from '../context/AccesibilidadContext';
import {
  obtenerFasesPorModulo,
  obtenerJuegosCompletadosPorModulo,
  obtenerJuegosPorFase,
} from '../service/faseService';
import { auth } from '../service/firebaseConfig';
import { Fase } from '../types/Fase';
import { Juego } from '../types/Juego';

const COLORES_NIVEL_FINAL = ['#E53935', '#1B3A6B', '#F5C518'];

const iconoMap: { [key: string]: string } = {
  libro: 'book',
  pelota: 'basketball',
  sobre: 'mail',
  estrella: 'star',
  brujula: 'compass',
  quiz: 'help-circle',
  memoria: 'grid',
};

export default function ModuloJuego() {
  const router = useRouter();
  const { colores, escalaFuente, modoOscuro } = useAccesibilidad();
  const { id: moduloId, titulo } = useLocalSearchParams<{ id: string; titulo: string }>();

  const [fases, setFases] = useState<Fase[]>([]);
  const [juegosPorFase, setJuegosPorFase] = useState<{ [faseId: string]: Juego[] }>({});
  const [juegosCompletados, setJuegosCompletados] = useState<Set<string>>(new Set());
  const [ordenGlobal, setOrdenGlobal] = useState<string[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [juegoSeleccionado, setJuegoSeleccionado] = useState<Juego | null>(null);
  const [alertaBloqueo, setAlertaBloqueo] = useState(false);

  const uid = auth.currentUser?.uid;

  const colorIndex = useRef(0);
  const [colorActual, setColorActual] = useState(COLORES_NIVEL_FINAL[0]);

  useEffect(() => {
    const intervalo = setInterval(() => {
      colorIndex.current = (colorIndex.current + 1) % COLORES_NIVEL_FINAL.length;
      setColorActual(COLORES_NIVEL_FINAL[colorIndex.current]);
    }, 500);
    return () => clearInterval(intervalo);
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (moduloId) cargarDatos();
    }, [moduloId])
  );

  const cargarDatos = async () => {
    if (!uid || !moduloId) return;
    try {
      setCargando(true);
      setError('');

      const fasesData = await obtenerFasesPorModulo(moduloId);

      const juegosMap: { [faseId: string]: Juego[] } = {};
      await Promise.all(
        fasesData.map(async (fase) => {
          juegosMap[fase.id] = await obtenerJuegosPorFase(fase.id);
        })
      );

      // Construir el orden global de juegos (fase por fase, en orden)
      const orden: string[] = [];
      fasesData.forEach((fase) => {
        const juegos = juegosMap[fase.id] || [];
        juegos.forEach((juego) => orden.push(juego.id));
      });

      const completados = await obtenerJuegosCompletadosPorModulo(uid, moduloId);

      setFases(fasesData);
      setJuegosPorFase(juegosMap);
      setJuegosCompletados(completados);
      setOrdenGlobal(orden);
    } catch (e) {
      console.error('Error cargando módulo:', e);
      setError('No se pudo cargar el módulo. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  // Un juego está desbloqueado si es el primero, o si el anterior está completado
  const estaDesbloqueado = (juegoId: string): boolean => {
    const indice = ordenGlobal.indexOf(juegoId);
    if (indice <= 0) return true; // el primero siempre desbloqueado
    const anteriorId = ordenGlobal[indice - 1];
    return juegosCompletados.has(anteriorId);
  };

  const OctagonoJuego = ({
    juego,
    posicion,
    esNivelFinal,
  }: {
    juego: Juego;
    posicion: 'izquierda' | 'derecha' | 'centro';
    esNivelFinal: boolean;
  }) => {
    const completado = juegosCompletados.has(juego.id);
    const desbloqueado = estaDesbloqueado(juego.id);
    const iconoNombre = iconoMap[juego.icono] || 'help-circle';

    const colorIcono = !desbloqueado
      ? '#999'
      : esNivelFinal
        ? colorActual
        : completado
          ? '#2E7D32'
          : '#F5C518';

    const alineacion =
      posicion === 'izquierda'
        ? { alignSelf: 'flex-start' as const, marginLeft: 40 }
        : posicion === 'derecha'
          ? { alignSelf: 'flex-end' as const, marginRight: 40 }
          : { alignSelf: 'center' as const };

    const handlePress = () => {
      if (!desbloqueado) {
        setAlertaBloqueo(true);
        return;
      }
      setJuegoSeleccionado(juego);
    };

    return (
      <TouchableOpacity
        style={[styles.octagonoWrapper, alineacion]}
        onPress={handlePress}
      >
        <View style={[
          styles.octagono,
          { backgroundColor: colores.fondoTarjeta },
          !desbloqueado && styles.octagonoBloqueado,
        ]}>
          <Ionicons
            name={!desbloqueado ? 'lock-closed' : (iconoNombre as any)}
            size={32}
            color={colorIcono}
          />
        </View>
        <Text style={[styles.octagonoTitulo, { color: colores.texto, fontSize: 11 * escalaFuente }]} numberOfLines={2}>
          {juego.titulo}
        </Text>
      </TouchableOpacity>
    );
  };

  const posicionesZigzag = ['izquierda', 'derecha'] as const;

  return (
    <View style={[styles.wrapper, { backgroundColor: colores.fondo }]}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.botonVolver}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitulo} numberOfLines={2}>
          Módulo: {titulo || 'Cargando...'}
        </Text>
        <View style={{ width: 32 }} />
      </View>

      {cargando ? (
        <ActivityIndicator size="large" color={colores.primario} style={styles.cargando} />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTexto}>{error}</Text>
          <TouchableOpacity style={styles.botonReintentar} onPress={cargarDatos}>
            <Text style={styles.textoReintentar}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.contenido}
          showsVerticalScrollIndicator={false}
        >
          {fases.map((fase) => {
            const juegos = juegosPorFase[fase.id] || [];
            return (
              <View key={fase.id}>

                {/* Banner de fase */}
                <View style={[
                  styles.bannerFase,
                  fase.esNivelFinal && styles.bannerNivelFinal,
                ]}>
                  <Text style={[
                    styles.bannerTexto,
                    fase.esNivelFinal && { color: '#FFFFFF' },
                  ]}>
                    {fase.titulo}
                  </Text>
                </View>

                {/* Juegos en zigzag */}
                <View style={styles.zigzagContainer}>
                  {juegos.map((juego, index) => {
                    const esUltimoJuego = index === juegos.length - 1;
                    const esNivelFinalReal = fase.esNivelFinal && esUltimoJuego;

                    return (
                      <OctagonoJuego
                        key={juego.id}
                        juego={juego}
                        posicion={posicionesZigzag[index % 2]}
                        esNivelFinal={esNivelFinalReal}
                      />
                    );
                  })}
                </View>

              </View>
            );
          })}
        </ScrollView>
      )}

      {/* MODAL DE JUEGO */}
      {juegoSeleccionado && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContenido}>
            <Text style={styles.modalTitulo}>
              Modalidad: {juegoSeleccionado.titulo}
            </Text>

            <Text style={styles.modalDescripcion}>
              {juegoSeleccionado.descripcion}
            </Text>

            <Text style={styles.modalDetalle}>Tiempo: 5 minutos</Text>

            <Text style={styles.modalDetalle}>
              Estado: {juegosCompletados.has(juegoSeleccionado.id) ? 'Completado' : 'No completado'}
            </Text>

            <TouchableOpacity
              style={styles.botonEmpezar}
              onPress={() => {
                const id = juegoSeleccionado.id;
                const tipo = juegoSeleccionado.tipo;
                setJuegoSeleccionado(null);
                router.push({ pathname: '../Juego', params: { id, tipo } });
              }}
            >
              <Text style={styles.textoBotonEmpezar}>Empezar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.botonCerrarModal}
              onPress={() => setJuegoSeleccionado(null)}
            >
              <Text style={styles.textoBotonCerrar}>Atrás</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ALERTA DE BLOQUEO */}
      {alertaBloqueo && (
        <View style={styles.modalOverlay}>
          <View style={styles.alertaContenido}>
            <Ionicons name="lock-closed" size={48} color="#F5C518" />
            <Text style={styles.alertaTitulo}>Nivel bloqueado</Text>
            <Text style={styles.alertaTexto}>
              Completa el nivel anterior para desbloquear este.
            </Text>
            <TouchableOpacity
              style={styles.botonEmpezar}
              onPress={() => setAlertaBloqueo(false)}
            >
              <Text style={styles.textoBotonEmpezar}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* NAVBAR */}
      <View style={[styles.navbar, { backgroundColor: colores.fondoTarjeta, borderTopColor: modoOscuro ? '#333' : '#e0e0e0' }]}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/inicio')}>
          <Ionicons name="home" size={22} color={colores.textoSecundario} />
          <Text style={[styles.navTexto, { color: colores.textoSecundario }]}>Inicio</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/Historial')}>
          <Ionicons name="time" size={22} color={colores.textoSecundario} />
          <Text style={[styles.navTexto, { color: colores.textoSecundario }]}>Historial</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/Perfil')}>
          <Ionicons name="person" size={22} color={colores.textoSecundario} />
          <Text style={[styles.navTexto, { color: colores.textoSecundario }]}>Perfil</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 12,
    backgroundColor: '#1B3A6B',
  },
  botonVolver: { width: 32 },
  headerTitulo: {
    flex: 1,
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  cargando: { flex: 1 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  errorTexto: { fontSize: 14, color: '#E53935', textAlign: 'center', marginBottom: 16 },
  botonReintentar: {
    backgroundColor: '#1B3A6B',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  textoReintentar: { color: '#fff', fontWeight: 'bold' },
  contenido: { paddingVertical: 16, paddingBottom: 80 },
  bannerFase: {
    backgroundColor: '#F5C518',
    marginHorizontal: 16,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
    marginTop: 8,
  },
  bannerNivelFinal: {
    backgroundColor: '#1B3A6B',
  },
  bannerTexto: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1B3A6B',
    textAlign: 'center',
  },
  zigzagContainer: {
    paddingVertical: 8,
    gap: 24,
    marginBottom: 16,
  },
  octagonoWrapper: {
    alignItems: 'center',
    width: 90,
  },
  octagono: {
    width: 72,
    height: 72,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#1B3A6B',
    borderRadius: 8,
    transform: [{ rotate: '45deg' }],
    justifyContent: 'center',
    alignItems: 'center',
  },
  octagonoBloqueado: {
    borderColor: '#999',
    opacity: 0.6,
  },
  octagonoTitulo: {
    fontSize: 11,
    color: '#1a1a1a',
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 90,
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
    zIndex: 200,
  },
  modalContenido: {
    backgroundColor: '#1B3A6B',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    gap: 12,
  },
  modalTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalDescripcion: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
  },
  modalDetalle: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  botonEmpezar: {
    backgroundColor: '#F5C518',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
    alignSelf: 'center',
    paddingHorizontal: 50,
  },
  textoBotonEmpezar: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: 'bold',
  },
  botonCerrarModal: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  textoBotonCerrar: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  alertaContenido: {
    backgroundColor: '#1B3A6B',
    borderRadius: 16,
    padding: 28,
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  alertaTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  alertaTexto: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    paddingBottom: 24,
    borderTopWidth: 1,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: { alignItems: 'center', gap: 2 },
  navTexto: { fontSize: 11, color: '#888' },
});