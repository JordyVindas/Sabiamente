import { useEffect } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function PaginaCarga() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/Login');
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/LogoFondoBlanco.jpg')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.tagline}>Tu mejor opción, para aprender jugando</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    width: 220,
    height: 220,
  },
  tagline: {
    marginTop: 16,
    fontSize: 16,
    color: '#1a1a1a',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});