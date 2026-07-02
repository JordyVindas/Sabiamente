import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import LluviaConfeti from '../components/Lluviaconfeti';
import { Insignia, obtenerInsigniaPorModulo } from '../service/insigniaService';

function AnilloPulsante() {
    const escala = useSharedValue(1);

    useEffect(() => {
        escala.value = withRepeat(
            withSequence(
                withTiming(1.15, { duration: 1100, easing: Easing.out(Easing.ease) }),
                withTiming(1, { duration: 1100, easing: Easing.in(Easing.ease) }),
            ),
            -1,
        );
    }, []);

    const estiloAnimado = useAnimatedStyle(() => ({
        transform: [{ scale: escala.value }],
    }));

    return <Animated.View style={[styles.anilloPulsante, estiloAnimado]} />;
}

function InsigniaRevelada({ imagen, nombre }: { imagen: string; nombre: string }) {
    const escala = useSharedValue(0.3);
    const opacidad = useSharedValue(0);

    useEffect(() => {
        opacidad.value = withTiming(1, { duration: 300 });
        escala.value = withSequence(
            withTiming(1.12, { duration: 420, easing: Easing.out(Easing.cubic) }),
            withTiming(1, { duration: 220, easing: Easing.inOut(Easing.ease) }),
        );
    }, []);

    const estiloAnimado = useAnimatedStyle(() => ({
        opacity: opacidad.value,
        transform: [{ scale: escala.value }],
    }));

    return (
        <Animated.View style={[styles.insigniaContainer, estiloAnimado]}>
            <View style={styles.insigniaAnillo}>
                <View style={styles.insigniaAnilloInterno}>
                    <Image
                        source={{ uri: imagen }}
                        style={styles.insigniaImagen}
                        resizeMode="cover"
                    />
                </View>
            </View>
            <View style={styles.insigniaEtiqueta}>
                <Ionicons name="ribbon" size={16} color="#1B3A6B" />
                <Text style={styles.insigniaEtiquetaTexto}>INSIGNIA DESBLOQUEADA</Text>
            </View>
            <Text style={styles.insigniaNombre}>{nombre}</Text>
        </Animated.View>
    );
}

export default function EntregaInsignia() {
    const router = useRouter();
    const { nombreInsignia, moduloId } = useLocalSearchParams<{ nombreInsignia: string; moduloId: string }>();

    const [insignia, setInsignia] = useState<Insignia | null>(null);
    const [reclamado, setReclamado] = useState(false);
    const [rondaConfeti, setRondaConfeti] = useState(0);

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
        // Dispara una segunda lluvia de confeti, más intensa, al reclamar
        setRondaConfeti((r) => r + 1);
    };

    const handleVolver = () => {
        router.back();
    };

    return (
        <View style={styles.wrapper}>

            {/* Decoración de fondo */}
            <View style={styles.circuloDecorativoGrande} />
            <View style={styles.circuloDecorativoChico} />

            {/* Capa de confeti, no bloquea toques */}
            <View style={styles.capaConfeti} pointerEvents="none">
                <LluviaConfeti key="confeti-inicial" cantidad={70} />
                {rondaConfeti > 0 && (
                    <LluviaConfeti key={`confeti-reclamo-${rondaConfeti}`} cantidad={100} />
                )}
            </View>

            <View style={styles.contenido}>

                {!reclamado ? (
                    <>
                        <View style={styles.logoContainer}>
                            <AnilloPulsante />
                        </View>
                        <Text style={styles.etiquetaSuperior}>MÓDULO COMPLETADO</Text>
                        <Text style={styles.titulo}>
                            ¡Felicidades!
                        </Text>
                        <Text style={styles.subtitulo}>
                            Has demostrado tu sabiduría.{'\n'}Tu insignia te está esperando.
                        </Text>
                    </>
                ) : (
                    insignia && (
                        <InsigniaRevelada imagen={insignia.imagen} nombre={insignia.nombre} />
                    )
                )}

            </View>

            {/* BOTÓN */}
            <View style={styles.footer}>
                {!reclamado ? (
                    <TouchableOpacity style={styles.boton} onPress={handleReclamar} activeOpacity={0.85}>
                        <Ionicons name="gift" size={20} color="#1a1a1a" style={{ marginRight: 8 }} />
                        <Text style={styles.textoBoton}>Reclamar insignia</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.boton} onPress={handleVolver} activeOpacity={0.85}>
                        <Text style={styles.textoBoton}>Continuar</Text>
                        <Ionicons name="arrow-forward" size={20} color="#1a1a1a" style={{ marginLeft: 8 }} />
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
        overflow: 'hidden',
    },
    circuloDecorativoGrande: {
        position: 'absolute',
        width: 340,
        height: 340,
        borderRadius: 170,
        backgroundColor: 'rgba(245, 197, 24, 0.08)',
        top: -100,
        right: -90,
    },
    circuloDecorativoChico: {
        position: 'absolute',
        width: 220,
        height: 220,
        borderRadius: 110,
        backgroundColor: 'rgba(59, 127, 196, 0.18)',
        bottom: -70,
        left: -70,
    },
    capaConfeti: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 10,
    },
    contenido: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    logoContainer: {
        width: 140,
        height: 140,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 28,
    },
    anilloPulsante: {
        position: 'absolute',
        width: 140,
        height: 140,
        borderRadius: 70,
        borderWidth: 2,
        borderColor: 'rgba(245, 197, 24, 0.5)',
    },
    logo: {
        width: 90,
        height: 90,
    },
    etiquetaSuperior: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#F5C518',
        letterSpacing: 2,
        marginBottom: 10,
    },
    titulo: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 12,
    },
    subtitulo: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.75)',
        textAlign: 'center',
        lineHeight: 22,
    },
    insigniaContainer: {
        alignItems: 'center',
    },
    insigniaAnillo: {
        width: 210,
        height: 210,
        borderRadius: 105,
        backgroundColor: 'rgba(245, 197, 24, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#F5C518',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 24,
        elevation: 12,
    },
    insigniaAnilloInterno: {
        width: 180,
        height: 180,
        borderRadius: 90,
        borderWidth: 4,
        borderColor: '#F5C518',
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
    },
    insigniaImagen: {
        width: '100%',
        height: '100%',
    },
    insigniaEtiqueta: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5C518',
        borderRadius: 20,
        paddingVertical: 6,
        paddingHorizontal: 14,
        gap: 6,
        marginBottom: 12,
    },
    insigniaEtiquetaTexto: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#1B3A6B',
        letterSpacing: 0.5,
    },
    insigniaNombre: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        paddingHorizontal: 12,
    },
    footer: {
        paddingHorizontal: 60,
        paddingBottom: 60,
    },
    boton: {
        flexDirection: 'row',
        backgroundColor: '#F5C518',
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    textoBoton: {
        color: '#1a1a1a',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
