import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAccesibilidad } from '../context/AccesibilidadContext';
import { auth } from '../service/firebaseConfig';
import { Notificacion, obtenerNotificaciones } from '../service/notificacionService';

const iconoPorTipo: { [key: string]: string } = {
  logro: 'flag',
  recordatorio: 'notifications',
};

export default function Notificaciones() {
  const router = useRouter();
  const { colores, escalaFuente, modoOscuro } = useAccesibilidad();
  const uid = auth.currentUser?.uid;

  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarNotificaciones();
  }, []);

  const cargarNotificaciones = async () => {
    if (!uid) return;
    try {
      setCargando(true);
      setError('');
      const data = await obtenerNotificaciones(uid);
      setNotificaciones(data);
    } catch (e) {
      console.error('Error cargando notificaciones:', e);
      setError('No se pudieron cargar las notificaciones.');
    } finally {
      setCargando(false);
    }
  };

  // Separar en "Hoy" y "Pasadas"
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const notifHoy = notificaciones.filter((n) => {
    const fecha = n.fecha.toDate();
    return fecha >= hoy;
  });

  const notifPasadas = notificaciones.filter((n) => {
    const fecha = n.fecha.toDate();
    return fecha < hoy;
  });

  const TarjetaNotificacion = ({ notif }: { notif: Notificacion }) => (
    <View style={[styles.tarjeta, { backgroundColor: colores.fondoTarjeta }]}>
      <View style={styles.tarjetaHeader}>
        <View style={styles.iconoContainer}>
          <Ionicons
            name={(iconoPorTipo[notif.tipo] || 'notifications') as any}
            size={20}
            color="#1B3A6B"
          />
        </View>
        <View style={styles.tarjetaTextos}>
          <Text style={[styles.tarjetaTitulo, { fontSize: 14 * escalaFuente }]}>
            {notif.titulo}
          </Text>
          <Text style={[styles.tarjetaDescripcion, { color: colores.textoSecundario, fontSize: 12 * escalaFuente }]}>
            {notif.descripcion}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.wrapper, { backgroundColor: colores.fondo }]}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.botonVolver}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitulo}>Notificaciones</Text>
        <View style={{ width: 32 }} />
      </View>

      {cargando ? (
        <ActivityIndicator size="large" color={colores.primario} style={styles.cargando} />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTexto}>{error}</Text>
          <TouchableOpacity style={styles.botonReintentar} onPress={cargarNotificaciones}>
            <Text style={styles.textoReintentar}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.contenido}
          showsVerticalScrollIndicator={false}
        >
          {notificaciones.length === 0 ? (
            <View style={styles.vacioContainer}>
              <Ionicons name="notifications-off-outline" size={60} color={colores.textoSecundario} />
              <Text style={[styles.vacioTexto, { color: colores.textoSecundario }]}>
                No tienes notificaciones
              </Text>
            </View>
          ) : (
            <>
              {/* HOY */}
              {notifHoy.length > 0 && (
                <>
                  <Text style={[styles.seccionTitulo, { fontSize: 18 * escalaFuente }]}>Hoy</Text>
                  {notifHoy.map((notif) => (
                    <TarjetaNotificacion key={notif.id} notif={notif} />
                  ))}
                </>
              )}

              {/* PASADAS */}
              {notifPasadas.length > 0 && (
                <>
                  <Text style={[styles.seccionTitulo, { fontSize: 18 * escalaFuente }]}>Pasadas</Text>
                  {notifPasadas.map((notif) => (
                    <TarjetaNotificacion key={notif.id} notif={notif} />
                  ))}
                </>
              )}
            </>
          )}
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
    padding: 16,
    paddingBottom: 90,
  },
  seccionTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F5C518',
    marginBottom: 12,
    marginTop: 16,
  },
  tarjeta: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    elevation: 2,
  },
  tarjetaHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconoContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#E8EEF4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tarjetaTextos: {
    flex: 1,
    gap: 4,
  },
  tarjetaTitulo: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F5C518',
  },
  tarjetaDescripcion: {
    fontSize: 12,
    lineHeight: 18,
  },
  vacioContainer: {
    alignItems: 'center',
    marginTop: 80,
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
    borderTopWidth: 1,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: { alignItems: 'center', gap: 2 },
  navTexto: { fontSize: 11 },
});