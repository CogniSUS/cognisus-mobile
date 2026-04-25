import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

export default function PatientDetailsPage() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View className="flex-1 bg-background px-6 py-6">
      <Text className="text-2xl font-bold text-text">Paciente</Text>
      <Text className="text-muted mt-2">ID: {id}</Text>
    </View>
  );
}