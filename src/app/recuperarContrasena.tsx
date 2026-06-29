import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { updatePassword } from 'firebase/auth';
import { useState } from 'react';
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAccesibilidad } from '../context/AccesibilidadContext';
import { auth } from '../service/firebaseConfig';

export default function RecuperarContrasena() {
    const router = useRouter();
    const { colores, escalaFuente, modoOscuro } = useAccesibilidad();

    const [contrasena, setContrasena] = useState('');
    const [confirmarContrasena, setConfirmarContrasena] = useState('');
    const [mostrarContrasena, setMostrarContrasena] = useState(false);
    const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [errores, setErrores] = useState<{ [key: string]: string }>({});

    const validarContrasena = (valor: string) => {
        return valor.length >= 8 && /\d/.test(valor);
    };

    const handleConfirmar = async () => {
        const nuevosErrores: { [key: string]: string } = {};

        if (!validarContrasena(contrasena)) {
            nuevosErrores.contrasena =
                'La contraseña debe tener mínimo 8 caracteres y al menos un número';
        }

        if (contrasena !== confirmarContrasena) {
            nuevosErrores.confirmarContrasena =
                'Las contraseñas no coinciden, ingrésala nuevamente';
        }

        setErrores(nuevosErrores);

        if (Object.keys(nuevosErrores).length === 0) {
            try {
                setGuardando(true);
                const user = auth.currentUser;
                if (!user) throw new Error('No hay usuario autenticado');

                await updatePassword(user, contrasena);
                router.replace('/cambioCorrecto');
            } catch (e: any) {
                if (e.code === 'auth/requires-recent-login') {
                    setErrores({ general: 'Por seguridad, vuelve a iniciar sesión e intenta de nuevo' });
                } else {
                    setErrores({ general: 'No se pudo cambiar la contraseña. Intenta de nuevo.' });
                }
            } finally {
                setGuardando(false);
            }
        }
    };

    return (
        <KeyboardAvoidingView
            style={[styles.wrapper, { backgroundColor: colores.fondo }]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.botonVolver}>
                    <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Image
                    source={require('../../assets/images/LogoFondoLimpio.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </View>

            <ScrollView
                contentContainerStyle={styles.contenido}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <Text style={[styles.titulo, { color: colores.texto, fontSize: 22 * escalaFuente }]}>
                    Cambiar contraseña
                </Text>

                {/* Contraseña nueva */}
                <Text style={[styles.label, { color: colores.texto, fontSize: 16 * escalaFuente }]}>
                    Contraseña nueva
                </Text>
                <View style={[
                    styles.inputContainer,
                    { backgroundColor: colores.fondoTarjeta, borderColor: colores.primario },
                    errores.contrasena && styles.inputError,
                ]}>
                    <Ionicons name="lock-closed" size={18} color={colores.textoSecundario} style={styles.iconoIzq} />
                    <TextInput
                        style={[styles.input, { color: colores.texto }]}
                        placeholder="Contraseña"
                        placeholderTextColor={colores.textoSecundario}
                        secureTextEntry={!mostrarContrasena}
                        value={contrasena}
                        onChangeText={(t) => {
                            setContrasena(t);
                            setErrores((e) => ({ ...e, contrasena: '' }));
                        }}
                    />
                    <TouchableOpacity onPress={() => setMostrarContrasena(!mostrarContrasena)}>
                        <Ionicons
                            name={mostrarContrasena ? 'eye-off' : 'eye'}
                            size={20}
                            color={colores.textoSecundario}
                        />
                    </TouchableOpacity>
                </View>
                {errores.contrasena ? (
                    <Text style={styles.textoError}>{errores.contrasena}</Text>
                ) : (
                    <Text style={[styles.hint, { color: colores.textoSecundario }]}>
                        La contraseña debe ser mínimo de 8 caracteres
                    </Text>
                )}

                {/* Confirmar contraseña */}
                <Text style={[styles.label, { color: colores.texto, fontSize: 16 * escalaFuente }]}>
                    Confirmar contraseña
                </Text>
                <View style={[
                    styles.inputContainer,
                    { backgroundColor: colores.fondoTarjeta, borderColor: colores.primario },
                    errores.confirmarContrasena && styles.inputError,
                ]}>
                    <Ionicons name="lock-closed" size={18} color={colores.textoSecundario} style={styles.iconoIzq} />
                    <TextInput
                        style={[styles.input, { color: colores.texto }]}
                        placeholder="Contraseña nuevamente"
                        placeholderTextColor={colores.textoSecundario}
                        secureTextEntry={!mostrarConfirmar}
                        value={confirmarContrasena}
                        onChangeText={(t) => {
                            setConfirmarContrasena(t);
                            setErrores((e) => ({ ...e, confirmarContrasena: '' }));
                        }}
                    />
                    <TouchableOpacity onPress={() => setMostrarConfirmar(!mostrarConfirmar)}>
                        <Ionicons
                            name={mostrarConfirmar ? 'eye-off' : 'eye'}
                            size={20}
                            color={colores.textoSecundario}
                        />
                    </TouchableOpacity>
                </View>
                {errores.confirmarContrasena ? (
                    <Text style={styles.textoError}>{errores.confirmarContrasena}</Text>
                ) : null}

                {errores.general ? (
                    <Text style={styles.textoError}>{errores.general}</Text>
                ) : null}
            </ScrollView>

            {/* FOOTER */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.botonConfirmar}
                    onPress={handleConfirmar}
                    disabled={guardando}
                >
                    <Text style={styles.textoBotonConfirmar}>
                        {guardando ? 'Guardando...' : 'Confirmar'}
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    wrapper: { flex: 1 },
    header: {
        backgroundColor: '#1B3A6B',
        paddingTop: 52,
        paddingBottom: 20,
        alignItems: 'center',
        position: 'relative',
    },
    botonVolver: {
        position: 'absolute',
        left: 16,
        top: 52,
        backgroundColor: '#3B7FC4',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: 110,
        height: 110,
    },
    contenido: {
        paddingHorizontal: 32,
        paddingTop: 24,
    },
    titulo: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1B3A6B',
        textAlign: 'center',
        marginBottom: 30,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1B3A6B',
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#1B3A6B',
        borderRadius: 8,
        paddingHorizontal: 12,
        backgroundColor: '#FFFFFF',
    },
    inputError: {
        borderColor: '#E53935',
        borderWidth: 2,
    },
    iconoIzq: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 14,
        color: '#1a1a1a',
    },
    hint: {
        fontSize: 11,
        color: '#888',
        marginTop: 6,
        textAlign: 'center',
    },
    textoError: {
        fontSize: 12,
        color: '#E53935',
        marginTop: 6,
        textAlign: 'center',
    },
    footer: {
        paddingHorizontal: 32,
        paddingBottom: 40,
        paddingTop: 12,
    },
    botonConfirmar: {
        backgroundColor: '#1B3A6B',
        paddingVertical: 16,
        borderRadius: 10,
        alignItems: 'center',
    },
    textoBotonConfirmar: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});