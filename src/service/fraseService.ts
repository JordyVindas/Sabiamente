export interface Frase {
  id: number | string;
  text: string;
}

const API_URL = 'https://positive-api.online/phrases/esp';

// Fuente PRINCIPAL: siempre disponible, sin red, sin esperas.
const FRASES_LOCALES: Frase[] = [
  { id: 'local-1', text: 'La sabiduría comienza con el asombro.' },
  { id: 'local-2', text: 'Solo sé que no sé nada.' },
  { id: 'local-3', text: 'El que pregunta es un tonto por cinco minutos, el que no pregunta es un tonto para siempre.' },
  { id: 'local-4', text: 'La duda es la madre de la sabiduría.' },
  { id: 'local-5', text: 'No hay camino para la sabiduría; la sabiduría es el camino.' },
  { id: 'local-6', text: 'El necio piensa que sabe todo; el sabio sabe que no sabe nada.' },
  { id: 'local-7', text: 'Conócete a ti mismo.' },
  { id: 'local-8', text: 'La verdadera sabiduría está en reconocer la propia ignorancia.' },
  { id: 'local-9', text: 'El sabio no dice todo lo que piensa, pero piensa todo lo que dice.' },
  { id: 'local-10', text: 'La sabiduría suele venir de los errores, no de los aciertos.' },
  { id: 'local-11', text: 'Aprender sin pensar es inútil; pensar sin aprender es peligroso.' },
  { id: 'local-12', text: 'El primer paso hacia la sabiduría es reconocer que no lo sabemos todo.' },
];

let indiceUsado: number[] = [];

const elegirFraseLocalSinRepetir = (): Frase => {
  if (indiceUsado.length >= FRASES_LOCALES.length) indiceUsado = [];
  let i: number;
  do {
    i = Math.floor(Math.random() * FRASES_LOCALES.length);
  } while (indiceUsado.includes(i));
  indiceUsado.push(i);
  return FRASES_LOCALES[i];
};

// Forma real que devuelve https://positive-api.online/phrases/esp
interface FraseApiExterna {
  id: number;
  text: string;
  lang: string;
  category_id: number;
  author_id: number | null;
}

/**
 * Intenta traer una frase extra desde la API externa, con un timeout corto.
 * Es un "bonus" de variedad: si no responde a tiempo o falla, no importa,
 * ya tenemos frases locales de sobra.
 */
export const obtenerFraseDelDia = async (): Promise<Frase> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const respuesta = await fetch(API_URL, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!respuesta.ok) throw new Error(`API respondió con estado ${respuesta.status}`);

    const frases: FraseApiExterna[] = await respuesta.json();
    if (!Array.isArray(frases) || frases.length === 0) throw new Error('Sin frases disponibles');

    const elegida = frases[Math.floor(Math.random() * frases.length)];
    return { id: elegida.id, text: elegida.text };
  } catch (e) {
    // No es un error grave: simplemente usamos el banco local, que siempre funciona.
    return elegirFraseLocalSinRepetir();
  }
};