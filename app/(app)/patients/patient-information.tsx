import { usePacienteInformation } from "@/hooks/usePacienteInformation";
import {
  calcularIdade,
  capitalizarNome,
  formatarData,
  formatCpf,
} from "@/utils/formatters";
import { Feather, Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function PatientInformation() {
  const { patientId } = useLocalSearchParams<{
    patientId: string;
  }>();

  const { paciente, loading } = usePacienteInformation(
    patientId ? patientId : null,
  );

  // IHC: Feedback visual enquanto carrega os dados
  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#A824EE" />
        <Text style={styles.loadingText}>Carregando ficha...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER PADRONIZADO (Igual ao Editar/Criar) */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          <Feather name="arrow-left" size={26} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.textTitle}>Ficha do Paciente</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.card}>
          <View style={styles.identity}>
            <View style={styles.avatar}>
              <Ionicons name="person-outline" size={28} color="#A824EE" />
            </View>

            <View style={styles.identityContent}>
              <Text style={styles.name} numberOfLines={2}>
                {paciente?.nome_completo
                  ? capitalizarNome(paciente.nome_completo)
                  : "Paciente não identificado"}
              </Text>

              <Text style={styles.cpf}>
                CPF: {paciente?.cpf ? formatCpf(paciente.cpf) : "Não informado"}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons
                name="document-text-outline"
                size={14}
                color="#A824EE"
              />
              <Text style={styles.sectionTitle}>DADOS PESSOAIS</Text>
            </View>

            <View style={styles.row}>
              <View style={styles.info}>
                <Text style={styles.label}>Nascimento</Text>
                <Text style={styles.value}>
                  {paciente?.data_nascimento
                    ? formatarData(paciente.data_nascimento)
                    : "Não informada"}
                </Text>
              </View>

              <View style={styles.info}>
                <Text style={styles.label}>Idade</Text>
                <Text style={styles.value}>
                  {paciente?.data_nascimento
                    ? `${calcularIdade(paciente.data_nascimento)} anos`
                    : "Não informada"}
                </Text>
              </View>
            </View>

            <View style={styles.infoHorizontal}>
              <Text style={styles.label}>Sexo</Text>
              <Text style={styles.value}>
                {paciente?.sexo
                  ? capitalizarNome(paciente.sexo)
                  : "Não informado"}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="school-outline" size={14} color="#A824EE" />
              <Text style={styles.sectionTitle}>ESCOLARIDADE</Text>
            </View>
            <Text style={styles.value}>
              {paciente?.escolaridade_nome
                ? capitalizarNome(paciente.escolaridade_nome)
                : "Não informada"}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="heart-outline" size={14} color="#A824EE" />
              <Text style={styles.sectionTitle}>CONDIÇÕES DE SAÚDE (DCNT)</Text>
            </View>
            <Text style={styles.value}>
              {paciente?.dcnts
                ? capitalizarNome(paciente.dcnts)
                : "Nenhuma DCNT cadastrada"}
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
                  ? formatarData(paciente.ultima_avaliacao)
                  : "Nenhuma avaliação"}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC", // Fundo do padrão arquitetural
    paddingTop: Platform.OS === "ios" ? 60 : 40,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#64748B",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  textTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0F172A",
    marginLeft: 16,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
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
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 4,
  },
  cpf: {
    fontSize: 13,
    color: "#64748B",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 16,
  },
  section: {
    width: "100%",
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    color: "#A824EE",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 40,
    marginBottom: 12,
  },
  info: {
    flexDirection: "column",
    gap: 4,
  },
  infoHorizontal: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  label: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
  value: {
    fontSize: 14,
    color: "#1E293B",
    fontWeight: "600",
  },
  boxBotton: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: 24,
  },
  buttonOutline: {
    height: 52,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#A824EE",
  },
  buttonOutlineText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#A824EE",
  },
});
