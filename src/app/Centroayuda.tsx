import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAccesibilidad } from '../context/AccesibilidadContext';

interface Pregunta {
  id: string;
  pregunta: string;
  respuesta: string;
}

const PREGUNTAS: Pregunta[] = [
  {
    id: '1',
    pregunta: '¿Cómo agrego un nuevo módulo?',
    respuesta:
      'En la pantalla de Inicio, en la sección "Descubrir nuevos módulos", toca la tarjeta del módulo que te interese y presiona "Agregar módulo". Desde ahí pasará a tu lista de "Tus módulos del saber".',
  },
  {
    id: '2',
    pregunta: '¿Cómo funciona la sopa de letras?',
    respuesta:
      'Dentro de cada fase de un módulo encontrarás niveles de sopa de letras. Busca las palabras ocultas en la grilla y selecciónalas arrastrando el dedo sobre las letras. Al encontrar todas las palabras, el nivel se marca como completado.',
  },
  {
    id: '3',
    pregunta: '¿Cómo gano experiencia (XP) y subo de nivel?',
    respuesta:
      'Cada vez que completas un nivel por primera vez ganas XP. Al acumular suficiente XP subes de nivel automáticamente. También puedes ganar XP extra al completar todos los niveles de un módulo y recibir su insignia.',
  },
  {
    id: '4',
    pregunta: '¿Dónde veo mis insignias?',
    respuesta:
      'Abre el menú desde Inicio (ícono de las tres líneas) y selecciona "Insignias" para ver tu vitrina completa con todo lo que has desbloqueado.',
  },
  {
    id: '5',
    pregunta: '¿Cómo actualizo mi contraseña?',
    respuesta:
      'Ve a Ajustes y toca "Actualizar contraseña". Deberás confirmar tu correo y tu contraseña actual antes de poder establecer una nueva.',
  },
  {
    id: '6',
    pregunta: '¿Cómo cambio el tamaño de letra o activo el modo oscuro?',
    respuesta:
      'Ve a Ajustes y toca "Accesibilidad". Ahí puedes activar el modo oscuro y elegir entre tamaño de letra normal, grande o extra grande.',
  },
  {
    id: '7',
    pregunta: '¿Por qué no veo mi progreso actualizado?',
    respuesta:
      'Si acabas de completar un nivel y no ves el cambio reflejado, intenta salir y volver a entrar al módulo, o revisa tu conexión a internet. Todo tu progreso se guarda automáticamente en la nube.',
  },
];

export default function CentroAyuda() {
  const router = useRouter();
  const { colores, escalaFuente, modoOscuro } = useAccesibilidad();

  const [abierta, setAbierta] = useState<string | null>(null);

  const alternar = (id: string) => {
    setAbierta((actual) => (actual === id ? null : id));
  };

  const handleContacto = () => {
    Linking.openURL('mailto:soporte@sabiamente.app?subject=Ayuda%20con%20la%20app');
  };

  return (
    <View style={[styles.wrapper, { backgroundColor: colores.primario }]}>

      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: colores.primario }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.botonVolver}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitulo}>Centro de ayuda</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContenido}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.tarjeta, { backgroundColor: colores.fondoTarjeta }]}>
          <Text style={[styles.seccionTitulo, { color: colores.texto, fontSize: 17 * escalaFuente }]}>
            Preguntas frecuentes
          </Text>

          {PREGUNTAS.map((item) => {
            const abiertaActual = abierta === item.id;
            return (
              <View key={item.id} style={[styles.itemPregunta, { borderColor: modoOscuro ? '#333' : '#e0e0e0' }]}>
                <TouchableOpacity
                  style={styles.filaPregunta}
                  onPress={() => alternar(item.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.textoPregunta,
                      { color: colores.texto, fontSize: 15 * escalaFuente },
                    ]}
                  >
                    {item.pregunta}
                  </Text>
                  <Ionicons
                    name={abiertaActual ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={colores.primario}
                  />
                </TouchableOpacity>

                {abiertaActual && (
                  <Text
                    style={[
                      styles.textoRespuesta,
                      { color: colores.textoSecundario, fontSize: 14 * escalaFuente },
                    ]}
                  >
                    {item.respuesta}
                  </Text>
                )}
              </View>
            );
          })}

          <Text style={[styles.seccionTitulo, { color: colores.texto, fontSize: 17 * escalaFuente, marginTop: 28 }]}>
            ¿No encontraste lo que buscabas?
          </Text>

          <TouchableOpacity
            style={[styles.botonContacto, { backgroundColor: colores.primario }]}
            onPress={handleContacto}
          >
            <Ionicons name="mail" size={20} color="#FFFFFF" />
            <Text style={styles.textoBotonContacto}>Escribir a soporte</Text>
          </TouchableOpacity>
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
  itemPregunta: {
    borderBottomWidth: 1,
    paddingVertical: 12,
  },
  filaPregunta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  textoPregunta: {
    flex: 1,
    fontWeight: '600',
  },
  textoRespuesta: {
    marginTop: 10,
    lineHeight: 20,
  },
  botonContacto: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 10,
  },
  textoBotonContacto: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});