import { Stack } from "expo-router";
import { AccesibilidadProvider } from "../context/AccesibilidadContext";


export default function RootLayout() {
  return (
    <AccesibilidadProvider>
      <Stack>
        
        <Stack.Screen name="PaginaCarga" options={{ headerShown: false }} />
        <Stack.Screen name="Login" options={{ headerShown: false }} />
        <Stack.Screen name="CrearCuenta" options={{ headerShown: false }} />
        <Stack.Screen name="VincularCuenta" options={{ headerShown: false }} />
        <Stack.Screen name="inicio" options={{ headerShown: false }} />
        <Stack.Screen name="ModuloJuego" options={{ headerShown: false }} />
        <Stack.Screen name="Juego" options={{ headerShown: false }} />
        <Stack.Screen name="Historial" options={{ headerShown: false }} />
        <Stack.Screen name="new" options={{ headerShown: false }} />
        <Stack.Screen name="Perfil" options={{ headerShown: false }} />
        <Stack.Screen name="Vitrina" options={{ headerShown: false }} />
        <Stack.Screen name="ajustes" options={{ headerShown: false }} />
        <Stack.Screen name="centroAyuda" options={{ headerShown: false }} />
        <Stack.Screen name="recuperarContrasena" options={{ headerShown: false }} />
        <Stack.Screen name="cambioCorrecto" options={{ headerShown: false }} />
        <Stack.Screen name="accesibilidad" options={{ headerShown: false }} />
        <Stack.Screen name="entregaInsignia" options={{ headerShown: false }} />
        <Stack.Screen name="notificaciones" options={{ headerShown: false }} />
        

      </Stack>
    </AccesibilidadProvider>
  );
}