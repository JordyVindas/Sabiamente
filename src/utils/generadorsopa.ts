export interface Celda {
  letra: string;
  fila: number;
  columna: number;
  encontrada: boolean;
  seleccionada: boolean;
}

export interface PalabraEnGrilla {
  palabra: string;
  celdas: { fila: number; columna: number }[];
  encontrada: boolean;
}

const LETRAS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const DIRECCIONES = [
  { df: 0, dc: 1 },   
  { df: 1, dc: 0 },   
];

export const calcularTamano = (palabras: string[]): number => {
  const maxLongitud = Math.max(...palabras.map((p) => p.length));
  const tamano = Math.max(maxLongitud + 2, Math.ceil(Math.sqrt(palabras.length * 8)));
 return Math.min(tamano, 10);
};

export const generarGrilla = (
  palabras: string[],
  tamano: number
): { grilla: Celda[][]; palabrasEnGrilla: PalabraEnGrilla[] } => {
  // Inicializar grilla vacía
  const grilla: Celda[][] = Array.from({ length: tamano }, (_, f) =>
    Array.from({ length: tamano }, (_, c) => ({
      letra: '',
      fila: f,
      columna: c,
      encontrada: false,
      seleccionada: false,
    }))
  );

  const palabrasEnGrilla: PalabraEnGrilla[] = [];

  for (const palabra of palabras) {
    let colocada = false;
    let intentos = 0;

    while (!colocada && intentos < 100) {
      intentos++;
      const dir = DIRECCIONES[Math.floor(Math.random() * DIRECCIONES.length)];
      const filaMax = dir.df === 0 ? tamano : tamano - palabra.length * Math.abs(dir.df);
      const colMax =
        dir.dc === 0
          ? tamano
          : dir.dc > 0
          ? tamano - palabra.length
          : tamano;
      const colMin = dir.dc < 0 ? palabra.length - 1 : 0;

      if (filaMax <= 0 || colMax <= colMin) continue;

      const fila = Math.floor(Math.random() * filaMax);
      const columna = colMin + Math.floor(Math.random() * (colMax - colMin));


      let cabe = true;
      const celdas: { fila: number; columna: number }[] = [];

      for (let i = 0; i < palabra.length; i++) {
        const f = fila + i * dir.df;
        const c = columna + i * dir.dc;

        if (f < 0 || f >= tamano || c < 0 || c >= tamano) {
          cabe = false;
          break;
        }

        const letraActual = grilla[f][c].letra;
        if (letraActual !== '' && letraActual !== palabra[i]) {
          cabe = false;
          break;
        }

        celdas.push({ fila: f, columna: c });
      }

      if (cabe) {
        for (let i = 0; i < palabra.length; i++) {
          grilla[celdas[i].fila][celdas[i].columna].letra = palabra[i];
        }
        palabrasEnGrilla.push({ palabra, celdas, encontrada: false });
        colocada = true;
      }
    }
  }

  // Rellenar espacios vacíos
  for (let f = 0; f < tamano; f++) {
    for (let c = 0; c < tamano; c++) {
      if (grilla[f][c].letra === '') {
        grilla[f][c].letra = LETRAS[Math.floor(Math.random() * LETRAS.length)];
      }
    }
  }

  return { grilla, palabrasEnGrilla };
};
