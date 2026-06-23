import { View, Image, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function Login() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/LogoFondoBlanco.jpg')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.titulo}>SabiaMente</Text>

      <View style={styles.botonesContainer}>
        <TouchableOpacity
          style={styles.botonCrear}
          onPress={() => router.push('/CrearCuenta')}
        >
          <Text style={styles.textoBotonCrear}>Crear cuenta</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botonIniciar}
          onPress={() => router.push('/VincularCuenta')}
        >
          <Text style={styles.textoBotonIniciar}>Iniciar sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF8EC',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logo: {
    width: 180,
    height: 180,
    backgroundColor: '#F0EDE4',
    borderRadius: 12,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1B3A6B',
    marginTop: 8,
    marginBottom: 40,
  },
  botonesContainer: {
    width: '100%',
    gap: 16,
  },
  botonCrear: {
    backgroundColor: '#1B3A6B',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  textoBotonCrear: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  botonIniciar: {
    backgroundColor: '#F5C518',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  textoBotonIniciar: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: 'bold',
  },
});