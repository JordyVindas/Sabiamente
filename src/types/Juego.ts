export interface Juego {
  id: string;
  moduloId: string;
  faseId: string;
  titulo: string;
  tipo: string;
  descripcion: string;
  icono: string;
  orden: number;
  activo: boolean;
}