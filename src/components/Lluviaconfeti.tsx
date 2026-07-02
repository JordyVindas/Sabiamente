import { useEffect, useMemo } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withTiming,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
const COLORES = ['#F5C518', '#E53935', '#3B7FC4', '#2E7D32', '#FFFFFF'];

interface ParticulaProps {
  color: string;
  xInicio: number;
  xFin: number;
  retraso: number;
  duracion: number;
  ancho: number;
  alto: number;
}

function Particula({ color, xInicio, xFin, retraso, duracion, ancho, alto }: ParticulaProps) {
  const progreso = useSharedValue(0);

  useEffect(() => {
    progreso.value = withDelay(
      retraso,
      withTiming(1, { duration: duracion, easing: Easing.out(Easing.quad) })
    );
  }, []);

  const estiloAnimado = useAnimatedStyle(() => {
    const y = progreso.value * (height + 40) - 40;
    const x = xInicio + (xFin - xInicio) * progreso.value;
    const rotacion = progreso.value * 720;
    const opacidad = progreso.value > 0.85 ? Math.max(0, 1 - (progreso.value - 0.85) / 0.15) : 1;

    return {
      opacity: opacidad,
      transform: [
        { translateY: y },
        { translateX: x },
        { rotate: `${rotacion}deg` },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.particula,
        { backgroundColor: color, width: ancho, height: alto },
        estiloAnimado,
      ]}
    />
  );
}

interface LluviaConfetiProps {
  cantidad?: number;
}

/**
 * Lluvia de confeti hecha con Reanimated (corre en el hilo de UI,
 * compatible con la New Architecture). Se dispara una sola vez al
 * montar el componente; para repetirla, vuelve a montarlo con una
 * "key" distinta desde el componente que lo usa.
 */
export default function LluviaConfeti({ cantidad = 70 }: LluviaConfetiProps) {
  const particulas = useMemo(() => {
    return Array.from({ length: cantidad }).map((_, i) => {
      const xInicio = Math.random() * width;
      return {
        id: i,
        color: COLORES[Math.floor(Math.random() * COLORES.length)],
        xInicio,
        xFin: xInicio + (Math.random() * 160 - 80),
        retraso: Math.random() * 500,
        duracion: 2200 + Math.random() * 1600,
        ancho: 6 + Math.random() * 6,
        alto: 10 + Math.random() * 6,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {particulas.map((p) => (
        <Particula key={p.id} {...p} />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  particula: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderRadius: 2,
  },
});