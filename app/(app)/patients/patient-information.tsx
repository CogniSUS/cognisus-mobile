import { usePacienteInformation } from "@/hooks/usePacienteInformation";
import { calcularIdade, formatarData } from "@/utils/formatters";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function PatientInformation() {
  const { patientId } = useLocalSearchParams<{
    patientId: string;
  }>();

  const { paciente, loading } = usePacienteInformation(
    patientId ? patientId : null,
  );

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={22} color="#A824EE" />
        </TouchableOpacity>

        <Text style={styles.ficha}>Ficha do Paciente</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.identity}>
          <View style={styles.avatar}>
            <Ionicons name="person-outline" size={28} color="#A824EE" />
          </View>

          <View style={styles.identityContent}>
            <Text style={styles.name} numberOfLines={2}>
              {paciente?.nome_completo}
            </Text>

            <Text style={styles.cpf}>CPF: {paciente?.cpf}</Text>
          </View>
        </View>

        <View style={styles.divider} />
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons name="document-text-outline" size={14} color="#A824EE" />

            <Text style={styles.sectionTitle}>DADOS PESSOAIS</Text>
          </View>

          <View style={styles.row}>
            <View style={styles.info}>
              <Text style={styles.label}>Nascimento</Text>

              <Text style={styles.value}>
                {paciente ? formatarData(paciente.data_nascimento) : ""}
              </Text>
            </View>

            <View style={styles.info}>
              <Text style={styles.label}>Idade</Text>

              <Text style={styles.value}>
                {paciente
                  ? `${calcularIdade(paciente.data_nascimento)} anos`
                  : ""}
              </Text>
            </View>
          </View>

          <View style={styles.infoHorizontal}>
            <Text style={styles.label}>Sexo</Text>

            <Text style={styles.value}>{paciente?.sexo}</Text>
          </View>
        </View>

        <View style={styles.divider} />
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons name="school-outline" size={14} color="#A824EE" />

            <Text style={styles.sectionTitle}>ESCOLARIDADE</Text>
          </View>

          <Text style={styles.value}>
            {paciente?.escolaridade_nome ?? "Não informado"}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons name="heart-outline" size={14} color="#A824EE" />

            <Text style={styles.sectionTitle}>CONDIÇÕES DE SAÚDE (DCNT)</Text>
          </View>

          <Text style={styles.value}>
            {paciente?.dcnts ?? "Nenhuma DCNT cadastrada"}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons name="time-outline" size={14} color="#A824EE" />

            <Text style={styles.sectionTitle}>HISTÓRICO</Text>
          </View>

          <View style={styles.infoHorizontal}>
            <Text style={styles.label}>Última avaliação</Text>

            <Text style={styles.value}>
              {paciente?.ultima_avaliacao
                ? paciente.ultima_avaliacao
                : "Nenhuma avaliação"}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.boxBotton}>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text>Voltar à Lista de Paciente</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F2F8",
    alignItems: "center",
  },
  titleContainer: {
    width: "85%",
    height: 62,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  card: {
    width: "85%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 17,
    paddingVertical: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },

  boxBotton: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  button: {
    height: 50,
    width: "85%",
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F2F8",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "gray",
  },
  ficha: {
    fontWeight: "bold",
    fontSize: 18,
  },
  identity: {
    flexDirection: "row",
    alignItems: "center",

    minHeight: 65,
  },

  avatar: {
    width: 52,
    height: 52,

    borderRadius: 26,

    backgroundColor: "#F3E8FF",

    alignItems: "center",
    justifyContent: "center",
  },

  identityContent: {
    flex: 1,
    marginLeft: 14,
  },

  name: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 3,
  },

  cpf: {
    fontSize: 12,
    color: "#64748B",
  },

  divider: {
    height: 1,
    backgroundColor: "#EEEEEE",
    marginVertical: 14,
  },
  section: {
    width: "100%",
  },

  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",

    gap: 7,

    marginBottom: 11,
  },

  sectionTitle: {
    fontSize: 10,
    color: "#A824EE",
    fontWeight: "500",
    letterSpacing: 0.4,
  },

  row: {
    flexDirection: "row",
    gap: 35,
    marginBottom: 8,
  },

  info: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  infoHorizontal: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  label: {
    fontSize: 12,
    color: "#64748B",
  },

  value: {
    fontSize: 12,
    color: "#1E293B",
  },
});
