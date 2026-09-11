// app/tests/_layout.tsx
import { Stack } from "expo-router";

export default function TestsLayout() {
  return (
    <Stack>
      {/* Tela de Seleção de Instrumento (Tela normal) */}
      <Stack.Screen name="select-instrument" options={{ headerShown: false }} />

      {/* Tela de Seleção de Unidade (Transformada em Modal Transparente) */}
      <Stack.Screen
        name="select-unit"
        options={{
          headerShown: false,
          presentation: "transparentModal", // É isso que cria o efeito modal sobreposto
          animation: "fade", // Faz surgir suavemente
        }}
      />

      {/* Tela de Execução do Teste (Tela normal) */}
      <Stack.Screen name="execute" options={{ headerShown: false }} />
    </Stack>
  );
}
