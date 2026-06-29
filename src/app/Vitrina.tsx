import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAccesibilidad } from '../context/AccesibilidadContext';
import { auth } from '../service/firebaseConfig';
import { InsigniaGanada, obtenerInsigniasGanadas } from '../service/insigniaService';
import { obtenerProgresoUsuario } from '../service/perfilService';

const formatearFecha = (timestamp: any): string => {
  if (!timestamp) return '';
  const fecha = timestamp.toDate();
  const dia = fecha.getDate().toString().padStart(2, '0');
  const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
  const anio = fecha.getFullYear();
  return `${dia}/${mes}/${anio}`;
};

export default function Vitrina() {
  const router = useRouter();
  const { colores, escalaFuente, modoOscuro } = useAccesibilidad();
  const uid = auth.currentUser?.uid;

  const [nivel, setNivel] = useState(1);
  const [insignias, setInsignias] = useState<InsigniaGanada[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarVitrina();
  }, []);

  const cargarVitrina = async () => {
    if (!uid) return;
    try {
      setCargando(true);
      setError('');

      const [progreso, insigniasData] = await Promise.all([
        obtenerProgresoUsuario(uid),
        obtenerInsigniasGanadas(uid),
      ]);

      setNivel(progreso.nivel);
      setInsignias(insigniasData);
    } catch (e) {
      console.error('Error cargando vitrina:', e);
      setError('No se pudo cargar la vitrina. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <View style={[styles.wrapper, { backgroundColor: colores.fondo }]}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.botonVolver}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitulo}>Nivel {nivel} de conocimiento</Text>
        <View style={{ width: 32 }} />
      </View>

      {cargando ? (
        <ActivityIndicator size="large" color={colores.primario} style={styles.cargando} />
      ) : error ? (
        <View style={[styles.errorContainer, { backgroundColor: colores.fondo }]}>
          <Text style={styles.errorTexto}>{error}</Text>
          <TouchableOpacity style={styles.botonReintentar} onPress={cargarVitrina}>
            <Text style={styles.textoReintentar}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.contenido, { backgroundColor: colores.fondo }]}
          showsVerticalScrollIndicator={true}
        >
          <Text style={[styles.tituloSeccion, { color: colores.texto, fontSize: 22 * escalaFuente }]}>
            Tus Insignias
          </Text>

          {insignias.length === 0 ? (
            <View style={styles.vacioContainer}>
              <Ionicons name="ribbon-outline" size={60} color={colores.textoSecundario} />
              <Text style={[styles.vacioTexto, { color: colores.textoSecundario }]}>
                Aún no has ganado insignias
              </Text>
            </View>
          ) : (
            insignias.map((insignia) => (
              <View key={insignia.id} style={styles.insigniaRow}>
                <View style={[styles.insigniaCuadro, { backgroundColor: modoOscuro ? '#2A2A2A' : '#FFFFFF' }]}>
                  <Image
                    source={{ uri: insignia.imagen }}
                    style={styles.insigniaImagen}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.insigniaInfo}>
                  <Text style={[styles.moduloTexto, { color: colores.texto, fontSize: 15 * escalaFuente }]}>
                    Módulo: {insignia.nombreModulo}
                  </Text>
                  <Text style={[styles.fechaTexto, { color: colores.texto, fontSize: 15 * escalaFuente }]}>
                    Fecha: {formatearFecha(insignia.fechaObtenida)}
                  </Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* NAVBAR */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/inicio')}>
          <Ionicons name="home" size={22} color="#FFFFFF" />
          <Text style={styles.navTexto}>Inicio</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/Historial')}>
          <Ionicons name="time" size={22} color="#FFFFFF" />
          <Text style={styles.navTexto}>Historial</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/Perfil')}>
          <Ionicons name="person" size={22} color="#FFFFFF" />
          <Text style={styles.navTexto}>Perfil</Text>
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
    paddingBottom: 16,
    backgroundColor: '#0F2A52',
  },
  botonVolver: { width: 32 },
  headerTitulo: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
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
  contenido: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 90,
    flexGrow: 1,
  },
  tituloSeccion: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  insigniaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    gap: 20,
  },
  insigniaCuadro: {
    width: 110,
    height: 110,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  insigniaImagen: {
    width: 80,
    height: 80,
  },
  insigniaInfo: {
    flex: 1,
    gap: 12,
  },
  moduloTexto: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  fechaTexto: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  vacioContainer: {
    alignItems: 'center',
    marginTop: 60,
    gap: 16,
  },
  vacioTexto: {
    fontSize: 14,
    textAlign: 'center',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    paddingBottom: 24,
    backgroundColor: '#3B7FC4',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: { alignItems: 'center', gap: 2 },
  navTexto: { fontSize: 11, color: '#FFFFFF' },
});