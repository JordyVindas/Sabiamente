import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { auth } from './firebaseConfig';

export const registrarUsuario = async (correo: string, contrasena: string) => {
  const credencial = await createUserWithEmailAndPassword(auth, correo, contrasena);
  return credencial.user;
};

export const iniciarSesion = async (correo: string, contrasena: string) => {
  const credencial = await signInWithEmailAndPassword(auth, correo, contrasena);
  return credencial.user;
};

export const verificarCredenciales = async (correo: string, contrasena: string): Promise<boolean> => {
  const user = auth.currentUser;
  if (!user) throw new Error('No hay usuario autenticado');

  const credencial = EmailAuthProvider.credential(correo, contrasena);
  await reauthenticateWithCredential(user, credencial);
  return true;
};