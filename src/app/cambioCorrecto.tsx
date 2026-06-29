import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import {
    Image,
    StyleSheet,
    Text,
    View
} from 'react-native';

export default function CambioCorrecto() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/ajustes');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.wrapper}>
      <View style={styles.contenido}>
        <Image
          source={require('../../assets/images/LogoFondoLimpio.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.mensaje}>Contraseña cambiada{'\n'}correctamente</Text>
      </View>

      <View style={styles.footer}>
 
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#1B3A6B',
    justifyContent: 'space-between',
  },
  contenido: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logo: {
    width: 240,
    height: 240,
    marginBottom: 24,
  },
  mensaje: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 34,
  },
  footer: {
    paddingHorizontal: 60,
    paddingBottom: 60,
  },
  textoBotonConfirmar: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: 'bold',
  },
});