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
import { Actividad, obtenerHistorial } from '../service/historialService';


const iconoPorTipo: { [key: string]: string } = {
  modulo_agregado: 'add-circle',
  modulo_completado: 'checkmark-circle',
  nivel_completado: 'flag',
  insignia: 'star',
};

const colorPorTipo: { [key: string]: string } = {
  modulo_agregado: '#F5C518',
  modulo_completado: '#F5C518',
  nivel_completado: '#F5C518',
  insignia: '#F5C518',
};

const formatearFecha = (timestamp: any): string => {
  const fecha = timestamp.toDate();
  const dia = fecha.getDate().toString().padStart(2, '0');
  const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
  const anio = fecha.getFullYear();
  const horas = fecha.getHours().toString().padStart(2, '0');
  const minutos = fecha.getMinutes().toString().padStart(2, '0');
  return `${dia} ${obtenerNombreMes(fecha.getMonth())} ${anio} — ${horas}:${minutos} PM`;
};

const obtenerNombreMes = (mes: number): string => {
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return meses[mes];
};

export default function Historial() {
  const router = useRouter();
  const { colores, escalaFuente } = useAccesibilidad();

  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const uid = auth.currentUser?.uid;

  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    if (!uid) return;
    try {
      setCargando(true);
      setError('');
      const data = await obtenerHistorial(uid);
      setActividades(data);
    } catch (e) {
      console.error('Error cargando historial:', e);
      setError('No se pudo cargar el historial. Intenta de nuevo.');
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
        <Text style={styles.headerTitulo}>Historial</Text>
        <View style={{ width: 32 }} />
      </View>

      {cargando ? (
        <ActivityIndicator size="large" color={colores.primario} style={styles.cargando} />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTexto}>{error}</Text>
          <TouchableOpacity style={styles.botonReintentar} onPress={cargarHistorial}>
            <Text style={styles.textoReintentar}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.contenido}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.seccionTitulo, { fontSize: 18 * escalaFuente }]}>
            Actividades realizadas
          </Text>

          {actividades.length === 0 ? (
            <View style={styles.vacioCotainer}>
              <Ionicons name="time-outline" size={60} color={colores.textoSecundario} />
              <Text style={[styles.vacioTexto, { color: colores.textoSecundario }]}>
                Aún no tienes actividades registradas
              </Text>
            </View>
          ) : (
            actividades.map((actividad) => (
              <View key={actividad.id} style={[styles.tarjeta, { backgroundColor: colores.fondoTarjeta }]}>
                <View style={styles.tarjetaHeader}>
                  <Ionicons
                    name={iconoPorTipo[actividad.tipo] as any || 'ellipse'}
                    size={18}
                    color={colorPorTipo[actividad.tipo] || '#F5C518'}
                  />
                  <Text style={[styles.tarjetaTitulo, { fontSize: 15 * escalaFuente }]}>
                    {actividad.titulo}
                  </Text>
                </View>
                <Text style={[styles.tarjetaDescripcion, { color: colores.textoSecundario, fontSize: 13 * escalaFuente }]}>
                  {actividad.descripcion}
                </Text>
                <Text style={[styles.tarjetaFecha, { color: colores.textoSecundario }]}>
                  {formatearFecha(actividad.fecha)}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* NAVBAR */}
      <View style={[styles.navbar, { backgroundColor: colores.fondoTarjeta, borderTopColor: colores.textoSecundario }]}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/inicio')}>
          <Ionicons name="home" size={22} color={colores.textoSecundario} />
          <Text style={[styles.navTexto, { color: colores.textoSecundario }]}>Inicio</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="time" size={22} color={colores.primario} />
          <Text style={[styles.navTexto, { color: colores.primario, fontWeight: 'bold' }]}>Historial</Text>
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
    marginBottom: 16,
    marginTop: 8,
  },
  vacioCotainer: {
    alignItems: 'center',
    marginTop: 60,
    gap: 16,
  },
  vacioTexto: {
    fontSize: 14,
    textAlign: 'center',
  },
  tarjeta: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    gap: 6,
  },
  tarjetaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tarjetaTitulo: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#F5C518',
  },
  tarjetaDescripcion: {
    fontSize: 13,
    lineHeight: 18,
  },
  tarjetaFecha: {
    fontSize: 11,
    marginTop: 4,
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
  navActivo: { color: '#1B3A6B', fontWeight: 'bold' },
});