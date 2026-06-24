import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { Fase } from '../types/Fase';
import { Juego } from '../types/Juego';

export const obtenerFasesPorModulo = async (moduloId: string): Promise<Fase[]> => {
  const snap = await getDocs(
    query(
      collection(db, 'fases'),
      where('moduloId', '==', moduloId),
      orderBy('orden')
    )
  );
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Fase[];
};

export const obtenerJuegosPorFase = async (faseId: string): Promise<Juego[]> => {
  const snap = await getDocs(
    query(
      collection(db, 'juegos'),
      where('faseId', '==', faseId),
      orderBy('orden')
    )
  );
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Juego[];
};

export const obtenerJuegosCompletadosPorModulo = async (
  uid: string,
  moduloId: string
): Promise<Set<string>> => {
  const snap = await getDocs(
    query(
      collection(db, 'usuarioJuegos', uid, 'juegos'),
      where('moduloId', '==', moduloId),
      where('completado', '==', true)
    )
  );
  return new Set(snap.docs.map((doc) => doc.id));
};