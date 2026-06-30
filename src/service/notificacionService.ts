import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp,
  where,
} from 'firebase/firestore';
import { db } from './firebaseConfig';

export interface Notificacion {
  id: string;
  tipo: string;
  titulo: string;
  descripcion: string;
  fecha: Timestamp;
  leida: boolean;
  referencia: string;
}

export const crearNotificacion = async (
  uid: string,
  tipo: string,
  titulo: string,
  descripcion: string,
  referencia: string
): Promise<void> => {
  await addDoc(collection(db, 'notificaciones', uid, 'items'), {
    tipo,
    titulo,
    descripcion,
    fecha: Timestamp.now(),
    leida: false,
    referencia,
  });
};

export const obtenerNotificaciones = async (uid: string): Promise<Notificacion[]> => {
  const snap = await getDocs(
    query(
      collection(db, 'notificaciones', uid, 'items'),
      orderBy('fecha', 'desc')
    )
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Notificacion[];
};

const existeRecordatorioHoy = async (uid: string, moduloId: string): Promise<boolean> => {
  const inicioDia = new Date();
  inicioDia.setHours(0, 0, 0, 0);

  const snap = await getDocs(
    query(
      collection(db, 'notificaciones', uid, 'items'),
      where('referencia', '==', moduloId),
      where('tipo', '==', 'recordatorio'),
      where('fecha', '>=', Timestamp.fromDate(inicioDia))
    )
  );
  return !snap.empty;
};

export const generarRecordatorios = async (
  uid: string,
  modulosActivos: { id: string; titulo: string }[]
): Promise<void> => {
  for (const modulo of modulosActivos) {
    const yaExiste = await existeRecordatorioHoy(uid, modulo.id);
    if (!yaExiste) {
      await crearNotificacion(
        uid,
        'recordatorio',
        'No te pierdas esta oportunidad',
        `Aprovecha el impulso y completa el módulo: ${modulo.titulo}`,
        modulo.id
      );
    }
  }
};