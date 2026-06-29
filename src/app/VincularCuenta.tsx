import { useState } from 'react';
import { useAccesibilidad } from '../context/AccesibilidadContext';
import { iniciarSesion } from '../service/authService';

import { useRouter } from 'expo-router';
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function VincularCuenta() {
    const router = useRouter();
    const { cargarPreferencias } = useAccesibilidad();

    const [correo, setCorreo] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [mostrarContrasena, setMostrarContrasena] = useState(false);
    const [errores, setErrores] = useState<{ [key: string]: string }>({});

    const validarCorreo = (valor: string) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(valor);
    };

    const validarContrasena = (valor: string) => {
        return valor.length >= 8 && /\d/.test(valor);
    };

    const handleVincular = async () => {
        const nuevosErrores: { [key: string]: string } = {};

        if (!validarCorreo(correo)) {
            nuevosErrores.correo = 'Ingresa un correo electrónico válido';
        }

        if (!validarContrasena(contrasena)) {
            nuevosErrores.contrasena =
                'La contraseña debe tener mínimo 8 caracteres y al menos un número';
        }

        setErrores(nuevosErrores);

        if (Object.keys(nuevosErrores).length === 0) {
            try {
                await iniciarSesion(correo, contrasena);
                await cargarPreferencias();
                router.replace('/inicio');
            } catch (error: any) {
                if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                    setErrores({ general: 'Correo o contraseña incorrectos' });
                } else {
                    setErrores({ general: 'Ocurrió un error, intenta nuevamente' });
                }
            }
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.wrapper}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            {/* HEADER */}
            <View style={styles.header}>
                <Image
                    source={require('../../assets/images/LogoFondoBlanco.jpg')}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <Text style={styles.appNombre}>SabiaMente</Text>
            </View>

            {/* FORMULARIO */}
            <View style={styles.formulario}>

                {/* Correo */}
                <View style={[styles.inputContainer, errores.correo && styles.inputError]}>
                    <TextInput
                        style={styles.input}
                        placeholder="Correo electrónico"
                        placeholderTextColor="#aaa"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={correo}
                        onChangeText={(t) => {
                            setCorreo(t);
                            setErrores((e) => ({ ...e, correo: '' }));
                        }}
                    />
                </View>
                {errores.correo ? <Text style={styles.textoError}>{errores.correo}</Text> : null}

                {/* Contraseña */}
                <View style={[styles.inputContainer, errores.contrasena && styles.inputError]}>
                    <TextInput
                        style={styles.input}
                        placeholder="Contraseña"
                        placeholderTextColor="#aaa"
                        secureTextEntry={!mostrarContrasena}
                        value={contrasena}
                        onChangeText={(t) => {
                            setContrasena(t);
                            setErrores((e) => ({ ...e, contrasena: '' }));
                        }}
                    />
                    <TouchableOpacity onPress={() => setMostrarContrasena(!mostrarContrasena)}>
                        <Text style={styles.icono}>{mostrarContrasena ? '🙈' : '👁️'}</Text>
                    </TouchableOpacity>
                </View>
                {errores.contrasena ? <Text style={styles.textoError}>{errores.contrasena}</Text> : null}

                {/* Error general */}
                {errores.general ? <Text style={styles.textoError}>{errores.general}</Text> : null}

            </View>

            {/* FOOTER */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.botonVincular} onPress={handleVincular}>
                    <Text style={styles.textoBotonVincular}>Vincular</Text>
                </TouchableOpacity>

                <Text style={styles.textoCuenta}>¿No tienes cuenta?</Text>

                <TouchableOpacity
                    style={styles.botonCrear}
                    onPress={() => router.push('/CrearCuenta')}
                >
                    <Text style={styles.textoBotonCrear}>Crear cuenta</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: '#FDF8EC',
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        paddingBottom: 40,
    },
    logo: {
        width: 120,
        height: 120,
        backgroundColor: '#F0EDE4',
        borderRadius: 12,
    },
    appNombre: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1B3A6B',
        marginTop: 6,
    },
    formulario: {
        paddingHorizontal: 40,
        gap: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 14,
        backgroundColor: '#fff',
        marginBottom: 12,
    },
    inputError: {
        borderColor: '#E53935',
        borderWidth: 2,
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 14,
        color: '#1a1a1a',
    },
    icono: {
        fontSize: 16,
        marginLeft: 6,
    },
    textoError: {
        fontSize: 11,
        color: '#E53935',
        marginTop: -8,
        marginBottom: 8,
    },
    footer: {
        paddingHorizontal: 40,
        paddingTop: 32,
        alignItems: 'center',
        gap: 12,
    },
    botonVincular: {
        backgroundColor: '#F5C518',
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        width: '100%',
    },
    textoBotonVincular: {
        color: '#1a1a1a',
        fontSize: 16,
        fontWeight: 'bold',
    },
    textoCuenta: {
        fontSize: 13,
        color: '#888',
    },
    botonCrear: {
        backgroundColor: '#1B3A6B',
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        width: '100%',
    },
    textoBotonCrear: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});