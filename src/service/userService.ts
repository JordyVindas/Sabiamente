import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

export const guardarDatosUsuario = async (
  uid: string,
  datos: {
    nombre: string;
    correo: string;
    genero: string;
    fechaNacimiento: string;
  }
) => {
  await setDoc(doc(db, 'usuarios', uid), {
    ...datos,
    creadoEn: new Date().toISOString(),
  });
};