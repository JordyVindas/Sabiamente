import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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
import { registrarUsuario } from '../service/authService';
import { guardarDatosUsuario } from '../service/userService';

export default function CrearCuenta() {
    const router = useRouter();

    const [nombre, setNombre] = useState('');
    const [correo, setCorreo] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [confirmarContrasena, setConfirmarContrasena] = useState('');
    const [genero, setGenero] = useState('');
    const [fechaNacimiento, setFechaNacimiento] = useState('');
    const [aceptaTerminos, setAceptaTerminos] = useState(false);
    const [aceptaPoliticas, setAceptaPoliticas] = useState(false);
    const [mostrarContrasena, setMostrarContrasena] = useState(false);
    const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
    const [mostrarGenero, setMostrarGenero] = useState(false);

    const [errores, setErrores] = useState<{ [key: string]: string }>({});

    const generosOpciones = ['Femenino', 'Masculino'];

    const validarCorreo = (valor: string) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(valor);
    };

    const validarContrasena = (valor: string) => {
        const tieneMinimo8 = valor.length >= 8;
        const tieneNumero = /\d/.test(valor);
        return tieneMinimo8 && tieneNumero;
    };

    const validarFecha = (valor: string) => {
        const regex = /^\d{4}\/\d{2}\/\d{2}$/;
        if (!regex.test(valor)) return false;

        const [anio, mes, dia] = valor.split('/').map(Number);
        const fechaNac = new Date(anio, mes - 1, dia);
        const hoy = new Date();
        const edad = hoy.getFullYear() - fechaNac.getFullYear();
        const cumpleEsteAnio = new Date(hoy.getFullYear(), fechaNac.getMonth(), fechaNac.getDate());
        const edadReal = hoy >= cumpleEsteAnio ? edad : edad - 1;

        return edadReal >= 18;
    };

    const formatearFecha = (texto: string) => {
        const soloNumeros = texto.replace(/[^0-9]/g, '');

        let formateado = soloNumeros;
        if (soloNumeros.length > 4) {
            formateado = soloNumeros.slice(0, 4) + '/' + soloNumeros.slice(4);
        }
        if (soloNumeros.length > 6) {
            formateado =
                soloNumeros.slice(0, 4) +
                '/' +
                soloNumeros.slice(4, 6) +
                '/' +
                soloNumeros.slice(6, 8);
        }
        return formateado;
    };

    const handleCrear = async () => {
        const nuevosErrores: { [key: string]: string } = {};

        if (!nombre.trim()) {
            nuevosErrores.nombre = 'El nombre es requerido';
        }

        if (!validarCorreo(correo)) {
            nuevosErrores.correo = 'Ingresa un correo electrónico válido';
        }

        if (!validarContrasena(contrasena)) {
            nuevosErrores.contrasena =
                'La contraseña debe tener mínimo 8 caracteres y al menos un número';
        }

        if (contrasena !== confirmarContrasena) {
            nuevosErrores.confirmarContrasena =
                'Contraseña incorrecta, ingrésala nuevamente';
        }

        if (!genero) {
            nuevosErrores.genero = 'Selecciona un género';
        }

        if (!validarFecha(fechaNacimiento)) {
            nuevosErrores.fechaNacimiento =
                'Debes ser mayor de edad (formato YYYY/MM/DD)';
        }

        if (!aceptaTerminos || !aceptaPoliticas) {
            nuevosErrores.terminos = 'Acepte los términos para continuar';
        }

        setErrores(nuevosErrores);

        if (Object.keys(nuevosErrores).length === 0) {
            try {
                const usuario = await registrarUsuario(correo, contrasena);
                await guardarDatosUsuario(usuario.uid, {
                    nombre,
                    correo,
                    genero,
                    fechaNacimiento,
                });
                router.replace('/inicio');
            } catch (error: any) {
                if (error.code === 'auth/email-already-in-use') {
                    setErrores({ correo: 'Este correo ya está registrado' });
                } else {
                    setErrores({ correo: 'Ocurrió un error, intenta nuevamente' });
                }
            }
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.wrapper}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            {/* HEADER FIJO */}
            <View style={styles.header}>
                <Image
                    source={require('../../assets/images/LogoFondoLimpio.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <Text style={styles.titulo}>Crear cuenta</Text>
            </View>

            {/* FORMULARIO DESLIZABLE */}
            <ScrollView
                contentContainerStyle={styles.formulario}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Nombre */}
                <Text style={styles.label}>Nombre</Text>
                <View style={[styles.inputContainer, errores.nombre && styles.inputError]}>
                    <Ionicons name="person" size={18} color="#888" style={styles.iconoIzq} />
                    <TextInput
                        style={styles.input}
                        placeholder="Ej. Juan"
                        placeholderTextColor="#aaa"
                        value={nombre}
                        onChangeText={(t) => {
                            setNombre(t);
                            setErrores((e) => ({ ...e, nombre: '' }));
                        }}
                    />
                </View>
                {errores.nombre ? <Text style={styles.textoError}>{errores.nombre}</Text> : null}

                {/* Correo */}
                <Text style={styles.label}>Correo electrónico</Text>
                <View style={[styles.inputContainer, errores.correo && styles.inputError]}>
                    <Ionicons name="mail" size={18} color="#888" style={styles.iconoIzq} />
                    <TextInput
                        style={styles.input}
                        placeholder="Ej. Juan@gmail.com"
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
                <Text style={styles.label}>Contraseña</Text>
                <View style={[styles.inputContainer, errores.contrasena && styles.inputError]}>
                    <Ionicons name="lock-closed" size={18} color="#888" style={styles.iconoIzq} />
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
                        <Ionicons
                            name={mostrarContrasena ? 'eye-off' : 'eye'}
                            size={20}
                            color="#888"
                        />
                    </TouchableOpacity>
                </View>
                {errores.contrasena ? (
                    <Text style={styles.textoError}>{errores.contrasena}</Text>
                ) : (
                    <Text style={styles.hint}>Mínimo 8 caracteres y al menos un número</Text>
                )}

                {/* Confirmar contraseña */}
                <Text style={styles.label}>Confirmar contraseña</Text>
                <View style={[styles.inputContainer, errores.confirmarContrasena && styles.inputError]}>
                    <Ionicons name="lock-closed" size={18} color="#888" style={styles.iconoIzq} />
                    <TextInput
                        style={styles.input}
                        placeholder="Contraseña nuevamente"
                        placeholderTextColor="#aaa"
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
                            color="#888"
                        />
                    </TouchableOpacity>
                </View>
                {errores.confirmarContrasena ? (
                    <Text style={styles.textoError}>{errores.confirmarContrasena}</Text>
                ) : null}

                {/* Género */}
                <Text style={styles.label}>Género</Text>
                <TouchableOpacity
                    style={[styles.inputContainer, errores.genero && styles.inputError]}
                    onPress={() => setMostrarGenero(!mostrarGenero)}
                >
                    <TextInput
                        style={styles.input}
                        placeholder="Ej. Masculino"
                        placeholderTextColor="#aaa"
                        value={genero}
                        editable={false}
                        pointerEvents="none"
                    />
                    <Ionicons
                        name={mostrarGenero ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color="#888"
                    />
                </TouchableOpacity>
                {errores.genero ? <Text style={styles.textoError}>{errores.genero}</Text> : null}
                {mostrarGenero && (
                    <View style={styles.dropdown}>
                        {generosOpciones.map((opcion) => (
                            <TouchableOpacity
                                key={opcion}
                                style={styles.dropdownItem}
                                onPress={() => {
                                    setGenero(opcion);
                                    setMostrarGenero(false);
                                    setErrores((e) => ({ ...e, genero: '' }));
                                }}
                            >
                                <Text style={styles.dropdownTexto}>{opcion}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Fecha de nacimiento */}
                <Text style={styles.label}>Fecha de nacimiento</Text>
                <View style={[styles.inputContainer, errores.fechaNacimiento && styles.inputError]}>
                    <Ionicons name="calendar" size={18} color="#888" style={styles.iconoIzq} />
                    <TextInput
                        style={styles.input}
                        placeholder="YYYY/MM/DD"
                        placeholderTextColor="#aaa"
                        value={fechaNacimiento}
                        onChangeText={(t) => {
                            setFechaNacimiento(formatearFecha(t));
                            setErrores((e) => ({ ...e, fechaNacimiento: '' }));
                        }}
                        keyboardType="numeric"
                        maxLength={10}
                    />
                </View>
                {errores.fechaNacimiento ? (
                    <Text style={styles.textoError}>{errores.fechaNacimiento}</Text>
                ) : null}

                {/* Checkboxes */}
                <TouchableOpacity
                    style={[
                        styles.checkboxRow,
                        errores.terminos && !aceptaTerminos && styles.checkboxRowError,
                    ]}
                    onPress={() => {
                        setAceptaTerminos(!aceptaTerminos);
                        setErrores((e) => ({ ...e, terminos: '' }));
                    }}
                >
                    <View style={[styles.checkbox, aceptaTerminos && styles.checkboxActivo]}>
                        {aceptaTerminos && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                    </View>
                    <Text style={styles.checkboxTexto}>Aceptar términos y condiciones</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.checkboxRow,
                        errores.terminos && !aceptaPoliticas && styles.checkboxRowError,
                    ]}
                    onPress={() => {
                        setAceptaPoliticas(!aceptaPoliticas);
                        setErrores((e) => ({ ...e, terminos: '' }));
                    }}
                >
                    <View style={[styles.checkbox, aceptaPoliticas && styles.checkboxActivo]}>
                        {aceptaPoliticas && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                    </View>
                    <Text style={styles.checkboxTexto}>Aceptar políticas de privacidad</Text>
                </TouchableOpacity>

                {errores.terminos ? (
                    <Text style={styles.textoError}>{errores.terminos}</Text>
                ) : null}

                <View style={styles.espacioExtra} />
            </ScrollView>

            {/* FOOTER FIJO */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.botonCrear} onPress={handleCrear}>
                    <Text style={styles.textoBotonCrear}>Crear</Text>
                </TouchableOpacity>

                <Text style={styles.textoCuenta}>¿Ya tienes cuenta?</Text>

                <TouchableOpacity
                    style={styles.botonIniciar}
                    onPress={() => router.push('/VincularCuenta')}
                >
                    <Text style={styles.textoBotonIniciar}>Iniciar sesión</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: '#FDF8EC',
    },
    header: {
        alignItems: 'center',
        paddingTop: 60,
        paddingBottom: 10,
        backgroundColor: '#FDF8EC',
    },
    logo: {
        width: 200,
        height: 200,
    },
    titulo: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1B3A6B',
        marginTop: 6,
    },
    formulario: {
        paddingHorizontal: 32,
        paddingBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1B3A6B',
        marginTop: 16,
        marginBottom: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
    },
    inputError: {
        borderColor: '#E53935',
        borderWidth: 2,
    },
    input: {
        flex: 1,
        paddingVertical: 10,
        fontSize: 14,
        color: '#1a1a1a',
    },
    iconoIzq: {
        marginRight: 8,
    },
    hint: {
        fontSize: 11,
        color: '#888',
        marginTop: 4,
    },
    textoError: {
        fontSize: 11,
        color: '#E53935',
        marginTop: 4,
    },
    dropdown: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        marginTop: 2,
        overflow: 'hidden',
    },
    dropdownItem: {
        paddingVertical: 10,
        paddingHorizontal: 14,
    },
    dropdownTexto: {
        fontSize: 14,
        color: '#1a1a1a',
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 14,
        gap: 10,
        padding: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    checkboxRowError: {
        borderColor: '#E53935',
        borderWidth: 2,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#1B3A6B',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxActivo: {
        backgroundColor: '#1B3A6B',
    },
    checkboxTexto: {
        fontSize: 13,
        color: '#1a1a1a',
    },
    espacioExtra: {
        height: 20,
    },
    footer: {
        paddingHorizontal: 32,
        paddingBottom: 36,
        paddingTop: 12,
        backgroundColor: '#FDF8EC',
        gap: 10,
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
    textoCuenta: {
        fontSize: 13,
        color: '#1a1a1a',
        alignSelf: 'flex-start',
    },
    botonIniciar: {
        backgroundColor: '#F5C518',
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        width: '100%',
    },
    textoBotonIniciar: {
        color: '#1a1a1a',
        fontSize: 16,
        fontWeight: 'bold',
    },
});