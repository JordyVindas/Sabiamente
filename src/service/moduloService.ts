import { collection, doc, getDocs, query, setDoc, Timestamp, where } from 'firebase/firestore';
import { Modulo } from '../types/Modulo';
import { db } from './firebaseConfig';
import { registrarActividad } from './historialService';

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

export const obtenerModulosEnProgreso = async (uid: string): Promise<number> => {
  const snap = await getDocs(
    query(
      collection(db, 'usuarioModulos', uid, 'modulos'),
      where('completado', '==', false)
    )
  );
  return snap.size;
};

export const agregarModuloUsuario = async (uid: string, moduloId: string): Promise<void> => {
  // Obtener nombre del módulo
  const moduloSnap = await getDocs(
    query(collection(db, 'modulos'), where('__name__', '==', moduloId))
  );
  const nombreModulo = moduloSnap.docs[0]?.data().titulo || 'Módulo';

  await setDoc(
    doc(db, 'usuarioModulos', uid, 'modulos', moduloId),
    {
      agregadoEn: Timestamp.now(),
      completado: false,
    }
  );

  

  await registrarActividad(
    uid,
    'modulo_agregado',
    'Registro de nuevo módulo',
    `Se ha registrado el módulo "${nombreModulo}" en tu perfil`,
    moduloId
  );
};