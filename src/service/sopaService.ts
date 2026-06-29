import { collection, doc, getDoc, getDocs, query, setDoc, Timestamp, where } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { registrarActividad } from './historialService';
import { obtenerInsigniaPorModulo, otorgarInsignia } from './insigniaService';

const XP_POR_NIVEL = 50;

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

export const actualizarProgreso = async (uid: string, xpGanado: number): Promise<void> => {
  const ref = doc(db, 'usuarioProgreso', uid);
  const snap = await getDoc(ref);

  let xpTotal = xpGanado;
  let nivel = 1;
  let xpSiguienteNivel = 100;

  if (snap.exists()) {
    const data = snap.data();
    xpTotal = (data.xpTotal || 0) + xpGanado;
    nivel = data.nivel || 1;
    xpSiguienteNivel = data.xpSiguienteNivel || 100;
  }

  // Subir todos los niveles que correspondan
  while (xpTotal >= xpSiguienteNivel) {
    nivel += 1;
    xpSiguienteNivel = xpSiguienteNivel * 2;
  }

  await setDoc(ref, {
    xpTotal,
    nivel,
    xpSiguienteNivel,
  });
};

export const guardarResultado = async (
  uid: string,
  juegoId: string,
  moduloId: string,
  puntaje: number
): Promise<void> => {
  const ref = doc(db, 'usuarioJuegos', uid, 'juegos', juegoId);
  const snap = await getDoc(ref);

  // Verifica si el juego ya estaba completado antes
  const yaEstabaCompletado = snap.exists() && snap.data().completado === true;

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

  // Solo la primera vez que se completa: historial + XP de nivel
  if (!yaEstabaCompletado) {
    const juegoSnap = await getDoc(doc(db, 'juegos', juegoId));
    const nombreJuego = juegoSnap.data()?.titulo || 'Nivel';

    await registrarActividad(
      uid,
      'nivel_completado',
      'Nivel completado',
      `Has completado el nivel: ${nombreJuego}`,
      juegoId
    );

    // XP por completar un nivel nuevo
    await actualizarProgreso(uid, XP_POR_NIVEL);
  }
};

export const verificarModuloCompleto = async (
  uid: string,
  moduloId: string
): Promise<{ completado: boolean; insigniaOtorgada: boolean; nombreInsignia?: string; xpInsignia?: number }> => {
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
  let insigniaOtorgada = false;
  let nombreInsignia: string | undefined;
  let xpInsignia: number | undefined;

  if (completado) {
    // Otorgar insignia del módulo (solo si no la tiene)
    const insignia = await obtenerInsigniaPorModulo(moduloId);
    if (insignia) {
      insigniaOtorgada = await otorgarInsignia(uid, insignia);

      // Solo si se otorga por primera vez: historial del módulo + XP de la insignia
      if (insigniaOtorgada) {
        nombreInsignia = insignia.nombre;
        xpInsignia = insignia.xpRecompensa;

        const moduloSnap = await getDoc(doc(db, 'modulos', moduloId));
        const nombreModulo = moduloSnap.data()?.titulo || 'Módulo';

        await registrarActividad(
          uid,
          'modulo_completado',
          'Monitoreo de módulo',
          `Has completado todos los niveles del módulo: ${nombreModulo}`,
          moduloId
        );

        // XP por completar el módulo entero
        await actualizarProgreso(uid, insignia.xpRecompensa);
      }
    }
  }

  return { completado, insigniaOtorgada, nombreInsignia, xpInsignia };
};