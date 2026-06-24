import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { auth } from '../service/firebaseConfig';
import {
  agregarModuloUsuario,
  obtenerModulosUsuario,
  obtenerTodosModulos,
} from '../service/moduloService';
import { Modulo } from '../types/Modulo';

export default function Inicio() {
  const router = useRouter();
  const [misModulos, setMisModulos] = useState<Modulo[]>([]);
  const [descubrirModulos, setDescubrirModulos] = useState<Modulo[]>([]);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [moduloSeleccionado, setModuloSeleccionado] = useState<Modulo | null>(null);
  const [agregando, setAgregando] = useState(false);
  const [error, setError] = useState('');

  const uid = auth.currentUser?.uid;

  useEffect(() => {
    cargarModulos();
  }, []);

  const cargarModulos = async () => {
    if (!uid) return;
    try {
      setCargando(true);
      setError('');

      const [todosModulos, idsUsuario] = await Promise.all([
        obtenerTodosModulos(),
        obtenerModulosUsuario(uid),
      ]);

      const misMods = todosModulos
        .filter((m) => idsUsuario.has(m.id))
        .sort((a, b) => a.orden - b.orden);

      const descubrir = todosModulos
        .filter((m) => !idsUsuario.has(m.id))
        .sort((a, b) => a.orden - b.orden);

      setMisModulos(misMods);
      setDescubrirModulos(descubrir);
    } catch (e) {
      console.error('Error cargando módulos:', e);
      setError('No se pudieron cargar los módulos. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  const handleAgregarModulo = async () => {
    if (!moduloSeleccionado || !uid) return;
    try {
      setAgregando(true);
      await agregarModuloUsuario(uid, moduloSeleccionado.id);
      setModuloSeleccionado(null);
      await cargarModulos();
    } catch (e) {
      console.error('Error agregando módulo:', e);
    } finally {
      setAgregando(false);
    }
  };

  const esMiModulo = misModulos.some((m) => m.id === moduloSeleccionado?.id);

  const TarjetaModulo = ({ modulo }: { modulo: Modulo }) => (
    <TouchableOpacity
      style={styles.tarjeta}
      onPress={() => setModuloSeleccionado(modulo)}
    >
      <Image
        source={{ uri: modulo.imagen }}
        style={styles.tarjetaImagen}
        resizeMode="cover"
      />
      <Text style={styles.tarjetaTitulo} numberOfLines={2}>
        {modulo.titulo}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.wrapper}>

      {/* HEADER */}
      <View style={styles.header}>
        <Image
          source={require('../../assets/images/LogoFondoLimpio.png')}
          style={styles.logoHeader}
          resizeMode="contain"
        />
        <Text style={styles.headerTitulo}>INICIO</Text>
        <TouchableOpacity onPress={() => setMenuAbierto(!menuAbierto)}>
          <Text style={styles.menuIcono}>☰</Text>
        </TouchableOpacity>
      </View>

      {/* MENÚ HAMBURGUESA */}
      {menuAbierto && (
        <View style={styles.menuDropdown}>
          {['Notificaciones', 'Ajustes', 'Insignias', 'Accesibilidad'].map((item) => (
            <TouchableOpacity
              key={item}
              style={styles.menuItem}
              onPress={() => setMenuAbierto(false)}
            >
              <Text style={styles.menuItemTexto}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* CONTENIDO */}
      {cargando ? (
        <ActivityIndicator size="large" color="#1B3A6B" style={styles.cargando} />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTexto}>{error}</Text>
          <TouchableOpacity style={styles.botonReintentar} onPress={cargarModulos}>
            <Text style={styles.textoReintentar}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.contenido}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.seccionTitulo}>Tus módulos del saber</Text>
          {misModulos.length === 0 ? (
            <Text style={styles.vacio}>Aún no tienes módulos agregados</Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filaModulos}
            >
              {misModulos.map((modulo) => (
                <TarjetaModulo key={modulo.id} modulo={modulo} />
              ))}
            </ScrollView>
          )}

          <Text style={styles.seccionTitulo}>Descubrir nuevos módulos</Text>
          {descubrirModulos.length === 0 ? (
            <Text style={styles.vacio}>No hay módulos nuevos por descubrir</Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filaModulos}
            >
              {descubrirModulos.map((modulo) => (
                <TarjetaModulo key={modulo.id} modulo={modulo} />
              ))}
            </ScrollView>
          )}
        </ScrollView>
      )}

      {/* NAVBAR */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcono}>🏠</Text>
          <Text style={[styles.navTexto, styles.navActivo]}>Inicio</Text>
        </TouchableOpacity>
        {/* Arreglar Rutas */}
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/Historial')}>
          <Text style={styles.navIcono}>🕐</Text>
          <Text style={styles.navTexto}>Historial</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/inicio')}>
          <Text style={styles.navIcono}>👤</Text>
          <Text style={styles.navTexto}>Perfil</Text>
        </TouchableOpacity>
      </View>

      {/* MODAL */}
      <Modal
        visible={moduloSeleccionado !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setModuloSeleccionado(null)}
      >
        <TouchableWithoutFeedback onPress={() => setModuloSeleccionado(null)}>
          <View style={styles.modalFondo}>
            <TouchableWithoutFeedback>
              <View style={styles.modalCuadro}>
                <Image
                  source={{ uri: moduloSeleccionado?.imagen }}
                  style={styles.modalImagen}
                  resizeMode="cover"
                />
                <View style={styles.modalContenido}>
                  <Text style={styles.modalTitulo}>{moduloSeleccionado?.titulo}</Text>
                  <View style={styles.modalTipoBadge}>
                    <Text style={styles.modalTipoTexto}>{moduloSeleccionado?.tipo}</Text>
                  </View>
                  <Text style={styles.modalDescripcion}>{moduloSeleccionado?.descripcion}</Text>
                </View>
                {/* Botones */}
                <View style={styles.modalBotones}>
                  {esMiModulo ? (
                    <TouchableOpacity
                      style={styles.botonIniciar}
                      onPress={() => {
                        setModuloSeleccionado(null);
                        router.push(`/ModuloJuego?id=${moduloSeleccionado?.id}&titulo=${encodeURIComponent(moduloSeleccionado?.titulo || '')}`);
                      }}
                    >
                      <Text style={styles.textoBotonIniciar}>▶  Iniciar</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.botonAgregar}
                      onPress={handleAgregarModulo}
                      disabled={agregando}
                    >
                      <Text style={styles.textoBotonAgregar}>
                        {agregando ? 'Agregando...' : 'Agregar módulo'}
                      </Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.botonCerrar}
                    onPress={() => setModuloSeleccionado(null)}
                  >
                    <Text style={styles.textoBotonCerrar}>Cerrar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  botonIniciar: {
    backgroundColor: '#2E7D32',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
  },
  textoBotonIniciar: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
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
  logoHeader: { width: 40, height: 40 },
  headerTitulo: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  menuIcono: { fontSize: 24, color: '#FFFFFF' },
  menuDropdown: {
    position: 'absolute',
    top: 100,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 100,
    minWidth: 180,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemTexto: { fontSize: 14, color: '#1B3A6B' },
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
  contenido: { paddingVertical: 20, paddingHorizontal: 16, paddingBottom: 80 },
  seccionTitulo: { fontSize: 16, fontWeight: 'bold', color: '#1B3A6B', marginBottom: 12, marginTop: 8 },
  filaModulos: { gap: 12, paddingBottom: 8 },
  tarjeta: {
    width: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tarjetaImagen: { width: '100%', height: 100 },
  tarjetaTitulo: { fontSize: 12, fontWeight: '600', color: '#1a1a1a', padding: 8 },
  vacio: { fontSize: 13, color: '#888', marginBottom: 16, fontStyle: 'italic' },
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
  navIcono: { fontSize: 22 },
  navTexto: { fontSize: 11, color: '#888' },
  navActivo: { color: '#1B3A6B', fontWeight: 'bold' },
  modalFondo: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCuadro: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
  },
  modalImagen: { width: '100%', height: 180 },
  modalContenido: { padding: 16 },
  modalTitulo: { fontSize: 18, fontWeight: 'bold', color: '#1B3A6B', marginBottom: 8 },
  modalTipoBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FDF8EC',
    borderWidth: 1,
    borderColor: '#F5C518',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 10,
  },
  modalTipoTexto: { fontSize: 12, color: '#1B3A6B', fontWeight: '600', textTransform: 'capitalize' },
  modalDescripcion: { fontSize: 13, color: '#444', lineHeight: 20 },
  modalBotones: { padding: 16, paddingTop: 0, gap: 10 },
  botonAgregar: { backgroundColor: '#1B3A6B', paddingVertical: 13, borderRadius: 10, alignItems: 'center' },
  textoBotonAgregar: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
  botonCerrar: { backgroundColor: '#F5C518', paddingVertical: 13, borderRadius: 10, alignItems: 'center' },
  textoBotonCerrar: { color: '#1a1a1a', fontSize: 15, fontWeight: 'bold' },
});