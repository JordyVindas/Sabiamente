import { createContext, ReactNode, useContext, useState } from 'react';
import {
    guardarAccesibilidad,
    obtenerAccesibilidad,
    TamanoFuente,
} from '../service/accesibilidadService';
import { auth } from '../service/firebaseConfig';

interface AccesibilidadContextType {
  modoOscuro: boolean;
  tamanoFuente: TamanoFuente;
  toggleModoOscuro: () => void;
  cambiarTamanoFuente: (tamano: TamanoFuente) => void;
  cargarPreferencias: () => Promise<void>;
  colores: {
    fondo: string;
    fondoTarjeta: string;
    texto: string;
    textoSecundario: string;
    primario: string;
  };
  escalaFuente: number;
}

const AccesibilidadContext = createContext<AccesibilidadContextType | undefined>(undefined);

export function AccesibilidadProvider({ children }: { children: ReactNode }) {
  const [modoOscuro, setModoOscuro] = useState(false);
  const [tamanoFuente, setTamanoFuente] = useState<TamanoFuente>('normal');

  // Carga las preferencias del usuario actual
  const cargarPreferencias = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    try {
      const prefs = await obtenerAccesibilidad(uid);
      setModoOscuro(prefs.modoOscuro);
      setTamanoFuente(prefs.tamanoFuente);
    } catch (e) {
      console.error('Error cargando accesibilidad:', e);
    }
  };

  // Guarda cuando cambian las preferencias
  const persistir = async (nuevoModo: boolean, nuevoTamano: TamanoFuente) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    try {
      await guardarAccesibilidad(uid, {
        modoOscuro: nuevoModo,
        tamanoFuente: nuevoTamano,
      });
    } catch (e) {
      console.error('Error guardando accesibilidad:', e);
    }
  };

  const toggleModoOscuro = () => {
    const nuevoModo = !modoOscuro;
    setModoOscuro(nuevoModo);
    persistir(nuevoModo, tamanoFuente);
  };

  const cambiarTamanoFuente = (tamano: TamanoFuente) => {
    setTamanoFuente(tamano);
    persistir(modoOscuro, tamano);
  };

  const colores = modoOscuro
    ? {
        fondo: '#121212',
        fondoTarjeta: '#1E1E1E',
        texto: '#FFFFFF',
        textoSecundario: '#B0B0B0',
        primario: '#3B7FC4',
      }
    : {
        fondo: '#FDF8EC',
        fondoTarjeta: '#FFFFFF',
        texto: '#1a1a1a',
        textoSecundario: '#888888',
        primario: '#1B3A6B',
      };

  const escalaFuente =
    tamanoFuente === 'normal' ? 1 : tamanoFuente === 'grande' ? 1.2 : 1.4;

  return (
    <AccesibilidadContext.Provider
      value={{
        modoOscuro,
        tamanoFuente,
        toggleModoOscuro,
        cambiarTamanoFuente,
        cargarPreferencias,
        colores,
        escalaFuente,
      }}
    >
      {children}
    </AccesibilidadContext.Provider>
  );
}

export function useAccesibilidad() {
  const context = useContext(AccesibilidadContext);
  if (!context) {
    throw new Error('useAccesibilidad debe usarse dentro de AccesibilidadProvider');
  }
  return context;
}