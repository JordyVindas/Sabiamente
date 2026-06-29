import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  Timestamp,
  where,
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { registrarActividad } from './historialService';

export interface Insignia {
  id: string;
  moduloId: string;
  nombre: string;
  imagen: string;
  xpRecompensa: number;
}

// Obtiene la insignia asociada a un módulo
export const obtenerInsigniaPorModulo = async (moduloId: string): Promise<Insignia | null> => {
  const snap = await getDocs(
    query(collection(db, 'insignias'), where('moduloId', '==', moduloId))
  );
  if (snap.empty) return null;
  const docu = snap.docs[0];
  return { id: docu.id, ...docu.data() } as Insignia;
};

// Verifica si el usuario ya tiene la insignia
export const usuarioTieneInsignia = async (uid: string, insigniaId: string): Promise<boolean> => {
  const ref = doc(db, 'usuarioInsignias', uid, 'insignias', insigniaId);
  const snap = await getDoc(ref);
  return snap.exists();
};

// Otorga la insignia al usuario
export const otorgarInsignia = async (uid: string, insignia: Insignia): Promise<boolean> => {
  const yaLaTiene = await usuarioTieneInsignia(uid, insignia.id);
  if (yaLaTiene) return false;

  await setDoc(
    doc(db, 'usuarioInsignias', uid, 'insignias', insignia.id),
    {
      fechaObtenida: Timestamp.now(),
    }
  );

  await registrarActividad(
    uid,
    'insignia',
    'Insignia obtenida',
    `Has ganado la insignia: ${insignia.nombre}`,
    insignia.id
  );

  return true;
};

// Obtiene todas las insignias del usuario
export const obtenerInsigniasUsuario = async (uid: string): Promise<string[]> => {
  const snap = await getDocs(
    collection(db, 'usuarioInsignias', uid, 'insignias')
  );
  return snap.docs.map((d) => d.id);
};

// Obtiene las insignias completas del usuario con sus datos
export const obtenerInsigniasCompletas = async (uid: string): Promise<Insignia[]> => {
  const idsSnap = await getDocs(collection(db, 'usuarioInsignias', uid, 'insignias'));
  const ids = idsSnap.docs.map((d) => d.id);

  const insignias: Insignia[] = [];
  for (const id of ids) {
    const snap = await getDoc(doc(db, 'insignias', id));
    if (snap.exists()) {
      insignias.push({ id: snap.id, ...snap.data() } as Insignia);
    }
  }
  return insignias;

};

export interface InsigniaGanada {
  id: string;
  nombre: string;
  imagen: string;
  nombreModulo: string;
  fechaObtenida: any;
}

export const obtenerInsigniasGanadas = async (uid: string): Promise<InsigniaGanada[]> => {
  // Obtener IDs y fechas de las insignias del usuario
  const usuarioSnap = await getDocs(collection(db, 'usuarioInsignias', uid, 'insignias'));

  const resultado: InsigniaGanada[] = [];

  for (const docu of usuarioSnap.docs) {
    const insigniaId = docu.id;
    const fechaObtenida = docu.data().fechaObtenida;

    // Datos de la insignia
    const insigniaSnap = await getDoc(doc(db, 'insignias', insigniaId));
    if (!insigniaSnap.exists()) continue;
    const insigniaData = insigniaSnap.data();

    // Nombre del módulo
    const moduloSnap = await getDoc(doc(db, 'modulos', insigniaData.moduloId));
    const nombreModulo = moduloSnap.data()?.titulo || 'Módulo';

    resultado.push({
      id: insigniaId,
      nombre: insigniaData.nombre,
      imagen: insigniaData.imagen,
      nombreModulo,
      fechaObtenida,
    });
  }

  return resultado;
};