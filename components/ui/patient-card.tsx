/**
 * Card que exibe dados do paciente selecionado
 * - Avatar roxo com ícone de pessoa
 * - Nome completo do paciente
 * - Idade calculada + Sexo
 *
 * Props:
 * - patient: Patient - Dados do paciente
 */
import { Patient, calculateAge } from "@/types/patient";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
interface PatientCardProps {
  patient: Patient;
}
export function PatientCard({ patient }: PatientCardProps) {
  const age = calculateAge(patient.data_nascimento);

  return (
    <View style={styles.container}>
      {/* Avatar com ícone */}
      <View style={styles.avatar}>
        <Ionicons name="person" size={28} color="#FFFFFF" />
      </View>

      {/* Conteúdo */}
      <View style={styles.content}>
        <Text style={styles.name}>{patient.nome_completo}</Text>
        <Text style={styles.subtitle}>
          {age} anos • {patient.sexo}
        </Text>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 12,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#A855F7",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
});
