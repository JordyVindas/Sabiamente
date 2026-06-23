import {
  collection,
  getDocs,
  query,
  where,
  doc,
  setDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { Modulo } from '../types/Modulo';

export const obtenerTodosModulos = async (): Promise<Modulo[]> => {
  const snap = await getDocs(
    query(collection(db, 'modulos'), where('activo', '==', true))
  );
  return snap.docs.map((documento) => ({
    id: documento.id,
    ...documento.data(),
  })) as Modulo[];
};

export const obtenerModulosUsuario = async (uid: string): Promise<Set<string>> => {
  const snap = await getDocs(
    collection(db, 'usuarioModulos', uid, 'modulos')
  );
  return new Set(snap.docs.map((documento) => documento.id));
};

export const agregarModuloUsuario = async (uid: string, moduloId: string): Promise<void> => {
  await setDoc(
    doc(db, 'usuarioModulos', uid, 'modulos', moduloId),
    {
      agregadoEn: Timestamp.now(),
      completado: false,
    }
  );
};