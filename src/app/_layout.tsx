import { Stack } from "expo-router";

export default function RootLayout() {
  return (

    <Stack>

      <Stack.Screen name="PaginaCarga" options={{ title: "Carga" }} />
      <Stack.Screen name="Login" options={{ title: "Logeo" }} />
      <Stack.Screen name="CrearCuenta" options={{ title: "Crear" }} />
      <Stack.Screen name="VincularCuenta" options={{ title: "Vinculo" }} />
      <Stack.Screen name="inicio" options={{ title: "PaginaPrincipal" }} />
      <Stack.Screen name="ModuloJuego" options={{ title: "Modulo" }} />



      <Stack.Screen name="new" options={{ title: "Nuevo" }} />
    </Stack>
  );
}
