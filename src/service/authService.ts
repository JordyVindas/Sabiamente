import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebaseConfig';

export const registrarUsuario = async (correo: string, contrasena: string) => {
  const credencial = await createUserWithEmailAndPassword(auth, correo, contrasena);
  return credencial.user;
};

export const iniciarSesion = async (correo: string, contrasena: string) => {
  const credencial = await signInWithEmailAndPassword(auth, correo, contrasena);
  return credencial.user;
};