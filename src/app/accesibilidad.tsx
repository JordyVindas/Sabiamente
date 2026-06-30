import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAccesibilidad } from '../context/AccesibilidadContext';

export default function Accesibilidad() {
  const router = useRouter();
  const {
    modoOscuro,
    tamanoFuente,
    toggleModoOscuro,
    cambiarTamanoFuente,
    colores,
    escalaFuente,
  } = useAccesibilidad();

  const opcionesTamano: { valor: 'normal' | 'grande' | 'extragrande'; etiqueta: string }[] = [
    { valor: 'normal', etiqueta: 'Normal' },
    { valor: 'grande', etiqueta: 'Grande' },
    { valor: 'extragrande', etiqueta: 'Extra grande' },
  ];

  return (
    <View style={[styles.wrapper, { backgroundColor: colores.primario }]}>

      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: colores.primario }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.botonVolver}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitulo}>Accesibilidad</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContenido}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.tarjeta, { backgroundColor: colores.fondoTarjeta }]}>

          {/* MODO OSCURO */}
          <Text style={[styles.seccionTitulo, { color: colores.texto, fontSize: 17 * escalaFuente }]}>
            Apariencia
          </Text>

          <View style={styles.filaOpcion}>
            <View style={styles.filaIzquierda}>
              <Ionicons name="moon" size={22} color={colores.primario} />
              <Text style={[styles.opcionTexto, { color: colores.texto, fontSize: 15 * escalaFuente }]}>
                Modo oscuro
              </Text>
            </View>
            <Switch
              value={modoOscuro}
              onValueChange={toggleModoOscuro}
              trackColor={{ false: '#ccc', true: '#3B7FC4' }}
              thumbColor={modoOscuro ? '#1B3A6B' : '#f4f3f4'}
            />
          </View>

          {/* TAMAÑO DE FUENTE */}
          <Text style={[styles.seccionTitulo, { color: colores.texto, fontSize: 17 * escalaFuente, marginTop: 28 }]}>
            Tamaño de letra
          </Text>

          <View style={styles.opcionesTamano}>
            {opcionesTamano.map((opcion) => (
              <TouchableOpacity
                key={opcion.valor}
                style={[
                  styles.botonTamano,
                  {
                    backgroundColor: tamanoFuente === opcion.valor ? colores.primario : 'transparent',
                    borderColor: colores.primario,
                  },
                ]}
                onPress={() => cambiarTamanoFuente(opcion.valor)}
              >
                <Text
                  style={[
                    styles.botonTamanoTexto,
                    {
                      color: tamanoFuente === opcion.valor ? '#FFFFFF' : colores.primario,
                    },
                  ]}
                >
                  {opcion.etiqueta}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* VISTA PREVIA */}
          <Text style={[styles.seccionTitulo, { color: colores.texto, fontSize: 17 * escalaFuente, marginTop: 28 }]}>
            Vista previa
          </Text>

          <View style={[styles.previewCard, { borderColor: colores.primario }]}>
            <Text style={[styles.previewTexto, { color: colores.texto, fontSize: 16 * escalaFuente }]}>
              Así se verá el texto en la aplicación con tu configuración actual.
            </Text>
          </View>

        </View>
      </ScrollView>

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
  },
  botonVolver: { width: 32 },
  headerTitulo: {
    flex: 1,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  scrollContenido: {
    paddingBottom: 40,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  tarjeta: {
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  seccionTitulo: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  filaOpcion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  filaIzquierda: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  opcionTexto: {
    fontWeight: '600',
  },
  opcionesTamano: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  botonTamano: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    borderWidth: 2,
  },
  botonTamanoTexto: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  previewCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  previewTexto: {
    lineHeight: 24,
  },
});