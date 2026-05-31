import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
export default function TestsPage() {
  useFocusEffect(() => {
    router.replace("/tests/selecao_unidade");
  });

  return null; // Não renderizar nada
}
