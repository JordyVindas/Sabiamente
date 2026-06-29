import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

export interface DatosProgreso {
  nivel: number;
  xpTotal: number;
  xpSiguienteNivel: number;
  rango: string;
}

export const obtenerRango = (nivel: number): string => {
  if (nivel >= 31) return 'Experto';
  if (nivel >= 16) return 'Avanzado';
  if (nivel >= 6) return 'Aprendiz';
  return 'Novato';
};

export const obtenerProgresoUsuario = async (uid: string): Promise<DatosProgreso> => {
  const snap = await getDoc(doc(db, 'usuarioProgreso', uid));

  if (snap.exists()) {
    const data = snap.data();
    const nivel = data.nivel || 1;
    return {
      nivel,
      xpTotal: data.xpTotal || 0,
      xpSiguienteNivel: data.xpSiguienteNivel || 100,
      rango: obtenerRango(nivel),
    };
  }

  return { nivel: 1, xpTotal: 0, xpSiguienteNivel: 100, rango: 'Novato' };
};

export const obtenerDatosUsuario = async (uid: string): Promise<{ nombre: string; fotoPerfil: string }> => {
  const snap = await getDoc(doc(db, 'usuarios', uid));
  return {
    nombre: snap.data()?.nombre || 'Usuario',
    fotoPerfil: snap.data()?.fotoPerfil || '',
  };
};


export const guardarFotoPerfil = async (uid: string, urlFoto: string): Promise<void> => {
  await updateDoc(doc(db, 'usuarios', uid), {
    fotoPerfil: urlFoto,
  });
};