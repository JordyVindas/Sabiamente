import { Stack } from "expo-router";

export default function RootLayout() {
  return (

    <Stack>

      <Stack.Screen name="PaginaCarga" options={{ title: "Carga" }} />
      <Stack.Screen name="Login" options={{ title: "Logueo" }} />
      <Stack.Screen name="CrearCuenta" options={{ title: "Crear" }} />
      <Stack.Screen name="VincularCuenta" options={{ title: "Vinculo" }} />
      <Stack.Screen name="inicio" options={{ title: "PaginaPrincipal" }} />
      <Stack.Screen name="ModuloJuego" options={{ title: "Modulo" }} />
      <Stack.Screen name="Juego" options={{ title: "Juego" }} />
      <Stack.Screen name="Historial" options={{ headerShown: false }} />

      <Stack.Screen name="new" options={{ title: "Nuevo" }} />
    </Stack>
  );
}
