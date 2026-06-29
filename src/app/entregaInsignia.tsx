import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { Insignia, obtenerInsigniaPorModulo } from '../service/insigniaService';

const { width, height } = Dimensions.get('window');

export default function EntregaInsignia() {
  const router = useRouter();
  const { nombreInsignia, moduloId } = useLocalSearchParams<{ nombreInsignia: string; moduloId: string }>();

  const [insignia, setInsignia] = useState<Insignia | null>(null);
  const [reclamado, setReclamado] = useState(false);
  const confettiRef = useRef<any>(null);

  useEffect(() => {
    cargarInsignia();
  }, []);

  const cargarInsignia = async () => {
    if (!moduloId) return;
    try {
      const data = await obtenerInsigniaPorModulo(moduloId);
      setInsignia(data);
    } catch (e) {
      console.error('Error cargando insignia:', e);
    }
  };

  const handleReclamar = () => {
    setReclamado(true);
    // Dispara más confeti al reclamar
    confettiRef.current?.start();
  };

  const handleVolver = () => {
    router.back();
  };

  return (
    <View style={styles.wrapper}>

      {/* Confeti de fondo continuo */}
      <ConfettiCannon
        count={120}
        origin={{ x: width / 2, y: 0 }}
        autoStart
        fadeOut
        fallSpeed={3000}
        explosionSpeed={400}
        colors={['#F5C518', '#E53935', '#3B7FC4', '#2E7D32', '#FFFFFF']}
      />

      {/* Confeti extra al reclamar */}
      <ConfettiCannon
        ref={confettiRef}
        count={150}
        origin={{ x: width / 2, y: height / 2 }}
        autoStart={false}
        fadeOut
        colors={['#F5C518', '#E53935', '#3B7FC4', '#2E7D32', '#FFFFFF']}
      />

      <View style={styles.contenido}>

        {!reclamado ? (
          <>
            <Image
              source={require('../../assets/images/LogoFondoLimpio.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.titulo}>
              ¡Felicidades! Has completado el módulo
            </Text>
            <Text style={styles.subtitulo}>
              Reclama tu insignia ahora
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.tituloReclamado}>¡Insignia obtenida!</Text>
            {insignia && (
              <View style={styles.insigniaContainer}>
                <Image
                  source={{ uri: insignia.imagen }}
                  style={styles.insigniaImagen}
                  resizeMode="contain"
                />
                <Text style={styles.insigniaNombre}>{insignia.nombre}</Text>
              </View>
            )}
          </>
        )}

      </View>

      {/* BOTÓN */}
      <View style={styles.footer}>
        {!reclamado ? (
          <TouchableOpacity style={styles.boton} onPress={handleReclamar}>
            <Text style={styles.textoBoton}>Reclamar</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.boton} onPress={handleVolver}>
            <Text style={styles.textoBoton}>Continuar</Text>
          </TouchableOpacity>
        )}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#1B3A6B',
  },
  contenido: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logo: {
    width: 90,
    height: 90,
    marginBottom: 24,
  },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
  },
  subtitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  tituloReclamado: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F5C518',
    textAlign: 'center',
    marginBottom: 30,
  },
  insigniaContainer: {
    alignItems: 'center',
    gap: 16,
  },
  insigniaImagen: {
    width: 180,
    height: 180,
  },
  insigniaNombre: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 60,
    paddingBottom: 60,
  },
  boton: {
    backgroundColor: '#F5C518',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  textoBoton: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: 'bold',
  },
});