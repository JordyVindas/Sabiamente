import { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../service/firebaseConfig';
import {
  obtenerFasesPorModulo,
  obtenerJuegosPorFase,
  obtenerJuegosCompletadosPorModulo,
} from '../service/faseService';
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
  const { id: moduloId, titulo } = useLocalSearchParams<{ id: string; titulo: string }>();

  const [fases, setFases] = useState<Fase[]>([]);
  const [juegosPorFase, setJuegosPorFase] = useState<{ [faseId: string]: Juego[] }>({});
  const [juegosCompletados, setJuegosCompletados] = useState<Set<string>>(new Set());
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const uid = auth.currentUser?.uid;

  // Animación nivel final
  const colorIndex = useRef(0);
  const colorAnim = useRef(new Animated.Value(0)).current;
  const [colorActual, setColorActual] = useState(COLORES_NIVEL_FINAL[0]);

  useEffect(() => {
    const intervalo = setInterval(() => {
      colorIndex.current = (colorIndex.current + 1) % COLORES_NIVEL_FINAL.length;
      setColorActual(COLORES_NIVEL_FINAL[colorIndex.current]);
    }, 500);
    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    if (moduloId) cargarDatos();
  }, [moduloId]);

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

      const completados = await obtenerJuegosCompletadosPorModulo(uid, moduloId);

      setFases(fasesData);
      setJuegosPorFase(juegosMap);
      setJuegosCompletados(completados);
    } catch (e) {
      console.error('Error cargando módulo:', e);
      setError('No se pudo cargar el módulo. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
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
    const iconoNombre = iconoMap[juego.icono] || 'help-circle';

    const colorIcono = esNivelFinal
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

    return (
      <TouchableOpacity
        style={[styles.octagonoWrapper, alineacion]}
       /* onPress={() => router.push(`/Juego?id=${juego.id}&tipo=${juego.tipo}`)}*/
      >
        <View style={[
          styles.octagono,
          esNivelFinal && styles.octagonoNivelFinal,
        ]}>
          <Ionicons
            name={iconoNombre as any}
            size={32}
            color={colorIcono}
          />
        </View>
        <Text style={styles.octagonoTitulo} numberOfLines={2}>
          {juego.titulo}
        </Text>
      </TouchableOpacity>
    );
  };

  const posicionesZigzag = ['izquierda', 'derecha'] as const;

  return (
    <View style={styles.wrapper}>

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
        <ActivityIndicator size="large" color="#1B3A6B" style={styles.cargando} />
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
                  <Text style={styles.bannerTexto}>{fase.titulo}</Text>
                </View>

                {/* Juegos en zigzag */}
                <View style={styles.zigzagContainer}>
                  {juegos.map((juego, index) => (
                    <OctagonoJuego
                      key={juego.id}
                      juego={juego}
                      posicion={posicionesZigzag[index % 2]}
                      esNivelFinal={fase.esNivelFinal}
                    />
                  ))}
                </View>

              </View>
            );
          })}
        </ScrollView>
      )}

      {/* NAVBAR */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/inicio')}>
          <Ionicons name="home" size={22} color="#888" />
          <Text style={styles.navTexto}>Inicio</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/inicio')}>    {/* Arreglar Rutas */}
          <Ionicons name="time" size={22} color="#888" />
          <Text style={styles.navTexto}>Historial</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/inicio')}>
          <Ionicons name="person" size={22} color="#888" />
          <Text style={styles.navTexto}>Perfil</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#FDF8EC' },
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
  octagonoNivelFinal: {
    borderColor: '#1B3A6B',
  },
  octagonoTitulo: {
    fontSize: 11,
    color: '#1a1a1a',
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 90,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: { alignItems: 'center', gap: 2 },
  navTexto: { fontSize: 11, color: '#888' },
});