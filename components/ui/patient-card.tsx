import { Patient } from "@/types/patient";
import { formatCpf } from "@/utils/formatters";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

interface PatientCardProps {
  patient: Pick<Patient, "nome_completo" | "cpf">;
}

export function PatientCard({ patient }: PatientCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Ionicons
          name="person-outline"
          size={28}
          color="#A824EE"
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.name}>
          {patient.nome_completo}
        </Text>

        <Text style={styles.cpf}>
          CPF: {formatCpf(patient.cpf)}
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
    borderRadius: 15,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 12,
    gap: 13,
    borderWidth: 1,
    borderColor: "#ECE8F2",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F3E8FF",
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
    fontWeight: "700",
    color: "#334155",
  },

  cpf: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 3,
  },
});
