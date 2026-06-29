import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

export type TamanoFuente = 'normal' | 'grande' | 'extragrande';

export interface PreferenciasAccesibilidad {
  modoOscuro: boolean;
  tamanoFuente: TamanoFuente;
}

export const guardarAccesibilidad = async (
  uid: string,
  preferencias: PreferenciasAccesibilidad
): Promise<void> => {
  await setDoc(
    doc(db, 'usuarios', uid),
    { accesibilidad: preferencias },
    { merge: true } // merge para no borrar los otros campos del usuario
  );
};

export const obtenerAccesibilidad = async (
  uid: string
): Promise<PreferenciasAccesibilidad> => {
  const snap = await getDoc(doc(db, 'usuarios', uid));
  const data = snap.data()?.accesibilidad;

  return {
    modoOscuro: data?.modoOscuro ?? false,
    tamanoFuente: data?.tamanoFuente ?? 'normal',
  };
};