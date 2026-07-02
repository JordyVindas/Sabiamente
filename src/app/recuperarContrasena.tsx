import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { updatePassword } from 'firebase/auth';
import { useState } from 'react';
import {
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
    const { colores, escalaFuente } = useAccesibilidad();

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
            style={[styles.wrapper, { backgroundColor: colores.primario }]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            {/* HEADER */}
            <View style={[styles.header, { backgroundColor: colores.primario }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.botonVolver}>
                    <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitulo}>Contraseña</Text>
                <View style={{ width: 32 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContenido}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={[styles.tarjeta, { backgroundColor: colores.fondoTarjeta }]}>

                    <View style={[styles.iconoCirculo, { backgroundColor: colores.primario }]}>
                        <Ionicons name="lock-closed" size={30} color="#FFFFFF" />
                    </View>

                    <Text style={[styles.titulo, { color: colores.texto, fontSize: 20 * escalaFuente }]}>
                        Establece tu nueva contraseña
                    </Text>
                    <Text style={[styles.subtitulo, { color: colores.textoSecundario, fontSize: 13 * escalaFuente }]}>
                        Elige una contraseña segura que no hayas usado antes.
                    </Text>

                    {/* Contraseña nueva */}
                    <Text style={[styles.label, { color: colores.texto, fontSize: 14 * escalaFuente }]}>
                        Contraseña nueva
                    </Text>
                    <View style={[
                        styles.inputContainer,
                        { backgroundColor: colores.fondo, borderColor: errores.contrasena ? '#E53935' : colores.primario },
                    ]}>
                        <Ionicons name="lock-closed-outline" size={18} color={colores.textoSecundario} style={styles.iconoIzq} />
                        <TextInput
                            style={[styles.input, { color: colores.texto }]}
                            placeholder="Mínimo 8 caracteres"
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
                            Debe incluir al menos un número
                        </Text>
                    )}

                    {/* Confirmar contraseña */}
                    <Text style={[styles.label, { color: colores.texto, fontSize: 14 * escalaFuente }]}>
                        Confirmar contraseña
                    </Text>
                    <View style={[
                        styles.inputContainer,
                        { backgroundColor: colores.fondo, borderColor: errores.confirmarContrasena ? '#E53935' : colores.primario },
                    ]}>
                        <Ionicons name="lock-closed-outline" size={18} color={colores.textoSecundario} style={styles.iconoIzq} />
                        <TextInput
                            style={[styles.input, { color: colores.texto }]}
                            placeholder="Repite la contraseña"
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
                        <Text style={styles.textoErrorGeneral}>{errores.general}</Text>
                    ) : null}

                    <TouchableOpacity
                        style={[styles.botonConfirmar, { backgroundColor: colores.primario }, guardando && styles.botonDeshabilitado]}
                        onPress={handleConfirmar}
                        disabled={guardando}
                    >
                        <Text style={styles.textoBotonConfirmar}>
                            {guardando ? 'Guardando...' : 'Confirmar cambio'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
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
        paddingHorizontal: 16,
        paddingBottom: 40,
    },
    tarjeta: {
        borderRadius: 24,
        paddingVertical: 28,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    iconoCirculo: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    titulo: {
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 6,
    },
    subtitulo: {
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 18,
    },
    label: {
        fontWeight: 'bold',
        alignSelf: 'flex-start',
        marginBottom: 8,
        marginTop: 14,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderRadius: 14,
        paddingHorizontal: 14,
        width: '100%',
    },
    iconoIzq: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        paddingVertical: 13,
        fontSize: 14,
    },
    hint: {
        fontSize: 11,
        marginTop: 6,
        alignSelf: 'flex-start',
    },
    textoError: {
        fontSize: 12,
        color: '#E53935',
        marginTop: 6,
        alignSelf: 'flex-start',
        fontWeight: '600',
    },
    textoErrorGeneral: {
        fontSize: 13,
        color: '#E53935',
        textAlign: 'center',
        marginTop: 16,
        fontWeight: '600',
    },
    botonConfirmar: {
        width: '100%',
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: 28,
    },
    botonDeshabilitado: {
        opacity: 0.7,
    },
    textoBotonConfirmar: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});