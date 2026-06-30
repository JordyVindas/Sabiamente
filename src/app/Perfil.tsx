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
import { Insignia, obtenerInsigniasCompletas } from '../service/insigniaService';
import { obtenerModulosEnProgreso } from '../service/moduloService';
import { obtenerDatosUsuario, obtenerProgresoUsuario } from '../service/perfilService';


export default function Perfil() {
  const { colores, escalaFuente, modoOscuro } = useAccesibilidad();

  const router = useRouter();
  const uid = auth.currentUser?.uid;

  const [nombre, setNombre] = useState('');
  const [fotoPerfil, setFotoPerfil] = useState('https://i.pravatar.cc/150');
  const [nivel, setNivel] = useState(1);
  const [rango, setRango] = useState('Novato');
  const [insignias, setInsignias] = useState<Insignia[]>([]);
  const [modulosEnProgreso, setModulosEnProgreso] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    if (!uid) return;
    try {
      setCargando(true);
      setError('');

      const [datosUsuario, progreso, insigniasData, enProgreso] = await Promise.all([
        obtenerDatosUsuario(uid),
        obtenerProgresoUsuario(uid),
        obtenerInsigniasCompletas(uid),
        obtenerModulosEnProgreso(uid),
      ]);

      setNombre(datosUsuario.nombre);
      if (datosUsuario.fotoPerfil) {
        setFotoPerfil(datosUsuario.fotoPerfil);
      }
      setNivel(progreso.nivel);
      setRango(progreso.rango);
      setInsignias(insigniasData);
      setModulosEnProgreso(enProgreso);
    } catch (e) {
      console.error('Error cargando perfil:', e);
      setError('No se pudo cargar el perfil. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <View style={[styles.wrapper, { backgroundColor: colores.fondo }]}>

      {/* HEADER */}
      <View style={styles.header}>
        <View style={{ width: 32 }} />
        <Text style={styles.headerTitulo}>Mi Perfil</Text>
        <View style={{ width: 32 }} />
      </View>

      {cargando ? (
        <ActivityIndicator size="large" color={colores.primario} style={styles.cargando} />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorTexto, { color: colores.texto }]}>{error}</Text>
          <TouchableOpacity style={styles.botonReintentar} onPress={cargarPerfil}>
            <Text style={styles.textoReintentar}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContenido}
          showsVerticalScrollIndicator={false}
        >
          {/* FOTO sobresaliendo */}
          <View style={styles.fotoContainer}>
            <Image source={{ uri: fotoPerfil }} style={styles.fotoPerfil} />
          </View>

          {/* TARJETA */}
          <View style={[styles.tarjeta, { backgroundColor: colores.fondoTarjeta }]}>
            <View style={styles.nombreContainer}>
              <Text style={[styles.nombre, { color: colores.texto, fontSize: 22 * escalaFuente }]}>
                {nombre}
              </Text>
              <Ionicons name="chevron-up" size={22} color={colores.texto} />
            </View>

            <View style={styles.nivelGradoContainer}>
              <Text style={[styles.rangoTexto, { color: colores.textoSecundario, fontSize: 14 * escalaFuente }]}>
                Grado: {rango}
              </Text>
              <Text style={[styles.separador, { color: colores.textoSecundario }]}>|</Text>
              <Text style={[styles.nivelTexto, { color: colores.textoSecundario, fontSize: 14 * escalaFuente }]}>
                Nivel {nivel}
              </Text>
            </View>

            {/* VITRINA */}
            <Text style={[styles.seccionTitulo, { color: colores.texto, fontSize: 17 * escalaFuente }]}>
              Vitrina
            </Text>

            <View style={styles.vitrinaGrid}>
              {insignias.map((insignia) => (
                <View key={insignia.id} style={styles.vitrinaItem}>
                  <View style={[
                    styles.insigniaCuadro,
                    { backgroundColor: modoOscuro ? '#333' : '#F0EDE4' },
                  ]}>
                    <Image
                      source={{ uri: insignia.imagen }}
                      style={styles.insigniaImagen}
                      resizeMode="cover"
                    />
                  </View>
                  <View style={[styles.circuloVacio, { borderColor: colores.texto }]} />
                </View>
              ))}

              {Array.from({ length: modulosEnProgreso }).map((_, index) => (
                <View key={`progreso-${index}`} style={styles.vitrinaItem}>
                  <View style={styles.insigniaCuadroVacio} />
                  <View style={[styles.circuloVacio, { borderColor: colores.texto }]} />
                </View>
              ))}
            </View>

            {insignias.length === 0 && modulosEnProgreso === 0 && (
              <Text style={[styles.vacioTexto, { color: colores.textoSecundario }]}>
                Aún no tienes insignias ni módulos en progreso
              </Text>
            )}
          </View>
        </ScrollView>
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
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person" size={22} color={colores.primario} />
          <Text style={[styles.navTexto, { color: colores.primario, fontWeight: 'bold' }]}>Perfil</Text>
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
    backgroundColor: '#1B3A6B',
  },
  headerTitulo: {
    flex: 1,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  cargando: { flex: 1 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  errorTexto: { fontSize: 14, textAlign: 'center', marginBottom: 16 },
  botonReintentar: {
    backgroundColor: '#F5C518',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  textoReintentar: { color: '#1a1a1a', fontWeight: 'bold' },
  scrollContenido: {
    paddingBottom: 90,
    paddingHorizontal: 16,
  },
  fotoContainer: {
    alignItems: 'center',
    zIndex: 10,
    marginBottom: -50,
  },
  fotoPerfil: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#FDF8EC',
    backgroundColor: '#ccc',
  },
  tarjeta: {
    borderRadius: 24,
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  nombreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  nombre: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  nivelGradoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  nivelTexto: {
    fontSize: 14,
  },
  separador: {
    fontSize: 14,
  },
  rangoTexto: {
    fontSize: 14,
  },
  seccionTitulo: {
    fontSize: 17,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginTop: 20,
    marginBottom: 14,
  },
  vitrinaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    rowGap: 24,
  },
  vitrinaItem: {
    width: '45%',
    alignItems: 'center',
    gap: 12,
  },
  insigniaCuadro: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    elevation: 2,
  },
  insigniaCuadroVacio: {
    width: 90,
    height: 90,
  },
  insigniaImagen: {
    width: 85,
    height: 85,
    borderRadius: 42,
  },
  circuloVacio: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  vacioTexto: {
    fontSize: 13,
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 20,
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
  navTexto: { fontSize: 11 },
});