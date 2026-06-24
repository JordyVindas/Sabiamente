import { collection, doc, getDoc, getDocs, query, setDoc, Timestamp, where } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { registrarActividad } from './historialService';

export interface DatosJuego {
  id: string;
  titulo: string;
  Palabras: string[];
  moduloId: string;
  faseId: string;
}

export const obtenerDatosJuego = async (juegoId: string): Promise<DatosJuego> => {
  const snap = await getDoc(doc(db, 'juegos', juegoId));
  if (!snap.exists()) throw new Error('Juego no encontrado');
  return { id: snap.id, ...snap.data() } as DatosJuego;
};

export const registrarIntento = async (
  uid: string,
  juegoId: string,
  moduloId: string,
): Promise<void> => {
  const ref = doc(db, 'usuarioJuegos', uid, 'juegos', juegoId);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    const data = snap.data();
    await setDoc(ref, {
      ...data,
      intentos: (data.intentos || 0) + 1,
    });
  } else {
    await setDoc(ref, {
      completado: false,
      puntaje: 0,
      moduloId,
      intentos: 1,
      fechaCompletado: null,
    });
  }
};

export const guardarResultado = async (
  uid: string,
  juegoId: string,
  moduloId: string,
  puntaje: number
): Promise<void> => {
  const ref = doc(db, 'usuarioJuegos', uid, 'juegos', juegoId);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    const data = snap.data();
    await setDoc(ref, {
      ...data,
      completado: true,
      puntaje: Math.max(data.puntaje || 0, puntaje),
      moduloId,
      fechaCompletado: Timestamp.now(),
    });
  } else {
    await setDoc(ref, {
      completado: true,
      puntaje,
      moduloId,
      intentos: 1,
      fechaCompletado: Timestamp.now(),
    });
  }
};


export const verificarModuloCompleto = async (
  uid: string,
  moduloId: string
): Promise<boolean> => {
  const todosSnap = await getDocs(
    query(collection(db, 'juegos'), where('moduloId', '==', moduloId), where('activo', '==', true))
  );
  const total = todosSnap.size;

  const completadosSnap = await getDocs(
    query(
      collection(db, 'usuarioJuegos', uid, 'juegos'),
      where('moduloId', '==', moduloId),
      where('completado', '==', true)
    )
  );

  const completado = completadosSnap.size >= total;

  if (completado) {
    const moduloSnap = await getDoc(doc(db, 'modulos', moduloId));
    const nombreModulo = moduloSnap.data()?.titulo || 'Módulo';

    await registrarActividad(
      uid,
      'modulo_completado',
      'Monitoreo de módulo',
      `Has completado la sopa de letras del módulo: ${nombreModulo}`,
      moduloId
    );
  }

  return completado;
};