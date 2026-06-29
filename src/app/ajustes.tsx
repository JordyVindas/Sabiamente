import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { useEffect, useState } from 'react';

import { verificarCredenciales } from '../service/authService';

import {
    ActivityIndicator,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAccesibilidad } from '../context/AccesibilidadContext';
import { subirImagenCloudinary } from '../service/cloudinaryService';
import { auth } from '../service/firebaseConfig';
import { guardarFotoPerfil, obtenerDatosUsuario } from '../service/perfilService';

export default function Ajustes() {
    const { colores, escalaFuente } = useAccesibilidad();

    const [subiendoFoto, setSubiendoFoto] = useState(false);

    const router = useRouter();
    const uid = auth.currentUser?.uid;

    const [nombre, setNombre] = useState('');
    const [correo, setCorreo] = useState('');
    const [fotoPerfil, setFotoPerfil] = useState('https://i.pravatar.cc/150');
    const [cargando, setCargando] = useState(true);

    const [modalRecuperar, setModalRecuperar] = useState(false);
    const [correoRecuperar, setCorreoRecuperar] = useState('');
    const [contrasenaActual, setContrasenaActual] = useState('');
    const [verificando, setVerificando] = useState(false);
    const [mensajeRecuperar, setMensajeRecuperar] = useState('');
    const [mostrarContrasena, setMostrarContrasena] = useState(false);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        if (!uid) return;
        try {
            setCargando(true);
            const datos = await obtenerDatosUsuario(uid);
            setNombre(datos.nombre);
            setCorreo(auth.currentUser?.email || '');
            if (datos.fotoPerfil) {
                setFotoPerfil(datos.fotoPerfil);
            }
        } catch (e) {
            console.error('Error cargando datos:', e);
        } finally {
            setCargando(false);
        }
    };

    const handleSeleccionarFoto = async () => {
        const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permiso.granted) {
            alert('Necesitas dar permiso para acceder a tus fotos');
            return;
        }

        const resultado = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (resultado.canceled) return;

        try {
            setSubiendoFoto(true);
            const uri = resultado.assets[0].uri;
            const urlFoto = await subirImagenCloudinary(uri);
            await guardarFotoPerfil(uid!, urlFoto);
            setFotoPerfil(urlFoto);
        } catch (e) {
            console.error('Error subiendo foto:', e);
            alert('No se pudo subir la imagen. Intenta de nuevo.');
        } finally {
            setSubiendoFoto(false);
        }
    };

    const handleSalir = async () => {
        try {
            await signOut(auth);
            router.replace('/Login');
        } catch (e) {
            console.error('Error al cerrar sesión:', e);
        }
    };

    const handleVerificar = async () => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regex.test(correoRecuperar)) {
            setMensajeRecuperar('Ingresa un correo válido');
            return;
        }
        if (!contrasenaActual) {
            setMensajeRecuperar('Ingresa tu contraseña actual');
            return;
        }

        try {
            setVerificando(true);
            setMensajeRecuperar('');
            await verificarCredenciales(correoRecuperar, contrasenaActual);
            cerrarModalRecuperar();
            router.push('/recuperarContrasena');
        } catch (e: any) {
            if (e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') {
                setMensajeRecuperar('Correo o contraseña incorrectos');
            } else if (e.code === 'auth/user-mismatch') {
                setMensajeRecuperar('El correo no coincide con tu cuenta');
            } else {
                setMensajeRecuperar('Error al verificar. Intenta de nuevo.');
            }
        } finally {
            setVerificando(false);
        }
    };

    const cerrarModalRecuperar = () => {
        setModalRecuperar(false);
        setCorreoRecuperar('');
        setContrasenaActual('');
        setMensajeRecuperar('');
        setMostrarContrasena(false);
    };

    return (
        <View style={[styles.wrapper, { backgroundColor: colores.fondo }]}>

            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.botonVolver}>
                    <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitulo}>Ajustes</Text>
                <View style={{ width: 32 }} />
            </View>

            {cargando ? (
                <ActivityIndicator size="large" color={colores.primario} style={styles.cargando} />
            ) : (
                <ScrollView
                    contentContainerStyle={styles.scrollContenido}
                    showsVerticalScrollIndicator={false}
                >
                    {/* FOTO sobresaliendo */}
                    <View style={styles.fotoContainer}>
                        <Image source={{ uri: fotoPerfil }} style={[styles.fotoPerfil, { borderColor: colores.fondoTarjeta }]} />
                        {subiendoFoto ? (
                            <View style={styles.botonEditarFoto}>
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            </View>
                        ) : (
                            <TouchableOpacity style={styles.botonEditarFoto} onPress={handleSeleccionarFoto}>
                                <Ionicons name="camera" size={16} color="#FFFFFF" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* TARJETA */}
                    <View style={[styles.tarjeta, { backgroundColor: colores.fondoTarjeta }]}>
                        <Text style={[styles.nombre, { color: colores.texto, fontSize: 22 * escalaFuente }]}>
                            {nombre}
                        </Text>
                        <Text style={[styles.correo, { color: colores.textoSecundario, fontSize: 14 * escalaFuente }]}>
                            {correo}
                        </Text>

                        {/* CONFIGURACIONES */}
                        <Text style={[styles.seccionTitulo, { color: colores.texto, fontSize: 17 * escalaFuente }]}>
                            Configuraciones
                        </Text>

                        <TouchableOpacity style={styles.botonAmarillo} onPress={() => router.push('/accesibilidad')}>
                            <Ionicons name="accessibility" size={20} color="#FFFFFF" />
                            <Text style={styles.botonTexto}>Accesibilidad</Text>
                            <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.botonAmarillo} onPress={() => setModalRecuperar(true)}>
                            <Ionicons name="card" size={20} color="#FFFFFF" />
                            <Text style={styles.botonTexto}>Recuperar Contraseña</Text>
                            <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.botonAmarillo}>
                            <Ionicons name="globe" size={20} color="#FFFFFF" />
                            <Text style={styles.botonTexto}>Lenguaje</Text>
                            <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.botonAmarillo}>
                            <Ionicons name="shield-checkmark" size={20} color="#FFFFFF" />
                            <Text style={styles.botonTexto}>Seguridad y control</Text>
                            <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
                        </TouchableOpacity>

                        {/* AYUDA */}
                        <Text style={[styles.seccionTitulo, { color: colores.texto, fontSize: 17 * escalaFuente }]}>
                            Ayuda
                        </Text>

                        <TouchableOpacity style={styles.botonAzul}>
                            <Ionicons name="help-circle" size={20} color="#FFFFFF" />
                            <Text style={styles.botonTexto}>Centro de ayuda</Text>
                            <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.botonAzul} onPress={handleSalir}>
                            <Ionicons name="exit" size={20} color="#FFFFFF" />
                            <Text style={styles.botonTexto}>Salir</Text>
                            <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
                        </TouchableOpacity>

                    </View>

                </ScrollView>
            )}

            {/* MODAL RECUPERAR CONTRASEÑA */}
            <Modal
                visible={modalRecuperar}
                transparent
                animationType="fade"
                onRequestClose={cerrarModalRecuperar}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalRecuperar}>
                        <TouchableOpacity style={styles.cerrarModal} onPress={cerrarModalRecuperar}>
                            <Ionicons name="close-circle" size={28} color="#FFFFFF" />
                        </TouchableOpacity>

                        <Text style={styles.modalTitulo}>Recuperación de contraseña</Text>

                        <Text style={styles.modalLabel}>Correo electrónico</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Ej: Juan@gmail.com"
                            placeholderTextColor="#aaa"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={correoRecuperar}
                            onChangeText={setCorreoRecuperar}
                        />

                        <Text style={styles.modalLabel}>Contraseña actual</Text>
                        <View style={styles.inputConIcono}>
                            <TextInput
                                style={styles.inputInterno}
                                placeholder="Contraseña"
                                placeholderTextColor="#aaa"
                                secureTextEntry={!mostrarContrasena}
                                value={contrasenaActual}
                                onChangeText={setContrasenaActual}
                            />
                            <TouchableOpacity onPress={() => setMostrarContrasena(!mostrarContrasena)}>
                                <Ionicons
                                    name={mostrarContrasena ? 'eye-off' : 'eye'}
                                    size={20}
                                    color="#888"
                                />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={styles.botonVerificar}
                            onPress={handleVerificar}
                            disabled={verificando}
                        >
                            <Text style={styles.textoBotonModal}>
                                {verificando ? 'Verificando...' : 'Verificar'}
                            </Text>
                        </TouchableOpacity>

                        {mensajeRecuperar ? (
                            <Text style={styles.mensajeRecuperar}>{mensajeRecuperar}</Text>
                        ) : null}
                    </View>
                </View>
            </Modal>

            {/* NAVBAR */}
            <View style={styles.navbar}>
                <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/inicio')}>
                    <Ionicons name="home" size={22} color="#FFFFFF" />
                    <Text style={styles.navTexto}>Inicio</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => router.push('/Historial')}>
                    <Ionicons name="time" size={22} color="#FFFFFF" />
                    <Text style={styles.navTexto}>Historial</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => router.push('/Perfil')}>
                    <Ionicons name="person" size={22} color="#FFFFFF" />
                    <Text style={styles.navTexto}>Perfil</Text>
                </TouchableOpacity>
            </View>

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
        backgroundColor: '#1B3A6B',
    },
    botonVolver: { width: 32 },
    headerTitulo: {
        flex: 1,
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
    },
    cargando: { flex: 1 },
    scrollContenido: {
        paddingBottom: 90,
        paddingHorizontal: 16,
    },
    fotoContainer: {
        alignItems: 'center',
        zIndex: 10,
        marginBottom: -50,
    },
    fotoPerfil: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: '#FDF8EC',
        backgroundColor: '#ccc',
    },
    botonEditarFoto: {
        position: 'absolute',
        bottom: 0,
        right: '35%',
        backgroundColor: '#3B7FC4',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    tarjeta: {
        backgroundColor: '#FDF8EC',
        borderRadius: 24,
        alignItems: 'center',
        paddingTop: 60,
        paddingBottom: 24,
        paddingHorizontal: 20,
    },
    nombre: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    correo: {
        fontSize: 14,
        color: '#999',
        marginTop: 2,
        marginBottom: 8,
    },
    seccionTitulo: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#1a1a1a',
        alignSelf: 'flex-start',
        marginTop: 20,
        marginBottom: 14,
    },
    botonAmarillo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5C518',
        borderRadius: 10,
        paddingVertical: 16,
        paddingHorizontal: 16,
        width: '100%',
        marginBottom: 12,
        gap: 12,
    },
    botonAzul: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1B6FC4',
        borderRadius: 10,
        paddingVertical: 16,
        paddingHorizontal: 16,
        width: '100%',
        marginBottom: 12,
        gap: 12,
    },
    botonTexto: {
        flex: 1,
        fontSize: 15,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    navbar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 10,
        paddingBottom: 24,
        backgroundColor: '#3B7FC4',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    navItem: { alignItems: 'center', gap: 2 },
    navTexto: { fontSize: 11, color: '#FFFFFF' },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    modalRecuperar: {
        backgroundColor: '#F5C518',
        borderRadius: 20,
        padding: 24,
        width: '100%',
        alignItems: 'center',
    },
    cerrarModal: {
        position: 'absolute',
        top: 12,
        right: 12,
    },
    modalTitulo: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1B3A6B',
        marginBottom: 16,
        marginTop: 8,
    },
    modalLabel: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginTop: 12,
        marginBottom: 8,
        alignSelf: 'flex-start',
    },
    modalInput: {
        backgroundColor: '#FDF8EC',
        borderRadius: 20,
        paddingVertical: 12,
        paddingHorizontal: 16,
        width: '100%',
        fontSize: 14,
        color: '#1a1a1a',
    },
    inputConIcono: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FDF8EC',
        borderRadius: 20,
        paddingHorizontal: 16,
        width: '100%',
    },
    inputInterno: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 14,
        color: '#1a1a1a',
    },
    botonVerificar: {
        backgroundColor: '#1B3A6B',
        borderRadius: 20,
        paddingVertical: 12,
        paddingHorizontal: 40,
        marginTop: 20,
    },
    textoBotonModal: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: 'bold',
    },
    mensajeRecuperar: {
        fontSize: 12,
        color: '#1B3A6B',
        textAlign: 'center',
        marginTop: 12,
        fontWeight: '600',
    },
});