import {
    addDoc,
    collection,
    getDocs,
    orderBy,
    query,
    Timestamp,
} from 'firebase/firestore';
import { db } from './firebaseConfig';

export interface Actividad {
    id: string;
    tipo: string;
    titulo: string;
    descripcion: string;
    fecha: Timestamp;
    referenciaId: string;
}

export const registrarActividad = async (
    uid: string,
    tipo: string,
    titulo: string,
    descripcion: string,
    referenciaId: string
): Promise<void> => {
    await addDoc(
        collection(db, 'historial', uid, 'actividades'),
        {
            tipo,
            titulo,
            descripcion,
            fecha: Timestamp.now(),
            referenciaId,
        }
    );
};

export const obtenerHistorial = async (uid: string): Promise<Actividad[]> => {
    const snap = await getDocs(
        query(
            collection(db, 'historial', uid, 'actividades'),
            orderBy('fecha', 'desc')
        )
    );
    return snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as Actividad[];
};