import { calculateAge, Patient } from "@/types/patient";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

export type PatientListItem = Patient & {
  ultima_avaliacao: string | null;
  ultima_unidade: string | null;
};

interface PatientListCardProps {
  patient: PatientListItem;
  onEdit: (patient: PatientListItem) => void;
  onDelete: (patient: PatientListItem) => void;
  onPress?: (patient: PatientListItem) => void;
}

function formatCpf(cpf: string) {
  const digits = cpf.replace(/\D/g, "").slice(0, 11);

  if (digits.length !== 11) {
    return cpf;
  }

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(
    6,
    9,
  )}-${digits.slice(9, 11)}`;
}

function formatSex(sex: Patient["sexo"]) {
  const labels: Record<Patient["sexo"], string> = {
    masculino: "Masculino",
    feminino: "Feminino",
    outro: "Outro",
  };

  return labels[sex];
}

function formatDate(date: string | null) {
  if (!date) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate.toLocaleDateString("pt-BR");
}

export function PatientListCard({
  patient,
  onEdit,
  onDelete,
  onPress,
}: PatientListCardProps) {
  const age = calculateAge(patient.data_nascimento);
  const lastEvaluationDate = formatDate(patient.ultima_avaliacao);
  const hasEvaluation = Boolean(
    patient.ultima_unidade || lastEvaluationDate,
  );

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && onPress && styles.containerPressed,
      ]}
      onPress={() => onPress?.(patient)}
      disabled={!onPress}
    >
      <View style={styles.avatar}>
        <Ionicons name="person-outline" size={28} color="#A824EE" />
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {patient.nome_completo}
        </Text>

        <Text style={styles.cpf}>CPF: {formatCpf(patient.cpf)}</Text>

        <Text style={styles.details}>
          {age} anos • {formatSex(patient.sexo)}
        </Text>

        {hasEvaluation && (
          <View style={styles.evaluationInfo}>
            {patient.ultima_unidade && (
              <Text style={styles.secondaryInfo} numberOfLines={1}>
                {patient.ultima_unidade}
              </Text>
            )}

            {lastEvaluationDate && (
              <Text style={styles.secondaryInfo}>
                Último teste: {lastEvaluationDate}
              </Text>
            )}
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            pressed && styles.actionButtonPressed,
          ]}
          onPress={(event) => {
            event.stopPropagation();
            onEdit(patient);
          }}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={`Editar paciente ${patient.nome_completo}`}
        >
          <Feather name="edit-2" size={21} color="#2563EB" />
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            pressed && styles.actionButtonPressed,
          ]}
          onPress={(event) => {
            event.stopPropagation();
            onDelete(patient);
          }}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={`Excluir paciente ${patient.nome_completo}`}
        >
          <Feather name="trash-2" size={21} color="#EF4444" />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 150,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    borderWidth: 1,
    borderColor: "#ECE8F2",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  containerPressed: {
    opacity: 0.92,
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#F3E8FF",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  content: {
    flex: 1,
    paddingTop: 1,
  },

  name: {
    color: "#172033",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },

  cpf: {
    color: "#64748B",
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 4,
  },

  details: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "500",
  },

  evaluationInfo: {
    marginTop: 9,
    gap: 2,
  },

  secondaryInfo: {
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
  },

  actions: {
    minHeight: 106,
    justifyContent: "space-between",
    alignItems: "center",
    marginLeft: 4,
  },

  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  actionButtonPressed: {
    backgroundColor: "#F1F5F9",
  },
});