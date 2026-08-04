import { useBuscaPaciente } from "@/hooks/useBuscaPaciente";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/providers/AuthProvider";
import { calcularIdade, formatarDataBR } from "@/utils/dateHelpers";
import { formatCpf } from "@/utils/formatters";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomePage() {
  const { user } = useAuth();
  const { info: showInfo } = useToast();

  const params = useLocalSearchParams<{ cpfBuscaInicial?: string }>();

  const {
    cpfBusca,
    setCpfBusca,
    buscandoPaciente,
    pacienteEncontrado,
    pacienteNaoEncontrado,
    limparBuscaPaciente,
  } = useBuscaPaciente();

  useEffect(() => {
    if (params.cpfBuscaInicial) {
      setCpfBusca(formatCpf(params.cpfBuscaInicial));

      router.setParams({ cpfBuscaInicial: undefined });
    }
  }, [params.cpfBuscaInicial, setCpfBusca]);

  const nomeProfissional = useMemo(() => {
    return user?.user_metadata?.nome_completo || user?.email || "Profissional";
  }, [user]);

  function iniciarRastreio() {
    if (!pacienteEncontrado) return showInfo("Selecione um paciente válido.");

    router.push({
      pathname: "/tests/select-instrument",
      params: {
        patientId: String(pacienteEncontrado.id),
        nome: pacienteEncontrado.nome_completo,
        cpf: pacienteEncontrado.cpf,
        dataNascimento: pacienteEncontrado.data_nascimento,
        sexo: pacienteEncontrado.sexo,
        escolaridade: pacienteEncontrado.escolaridade_nome ?? "",
      },
    });
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Text style={styles.greeting}>Olá, {nomeProfissional}</Text>

      {!pacienteEncontrado && (
        <Pressable
          onPress={() =>
            showInfo("Busque um paciente por CPF para iniciar o rastreio.")
          }
        >
          <LinearGradient
            colors={["#B12CF7", "#9D22F0", "#8A18E8"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.bannerButton}
          >
            <View>
              <Text style={styles.bannerText}>INICIAR RASTREIO</Text>
              <Text style={styles.bannerText}>COGNITIVO</Text>
            </View>
            <View style={styles.bannerCircle}>
              <Ionicons name="add" size={28} color="#A21CAF" />
            </View>
          </LinearGradient>
        </Pressable>
      )}

      <Text style={styles.searchTitle}>Buscar Paciente por CPF</Text>

      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={20} color="#94A3B8" />
        <TextInput
          placeholder="Digite o CPF do paciente"
          placeholderTextColor="#9CA3AF"
          keyboardType="numeric"
          style={styles.searchInput}
          value={cpfBusca}
          maxLength={14}
          onChangeText={(text) => setCpfBusca(formatCpf(text))}
        />
        {cpfBusca.length > 0 && (
          <Pressable onPress={limparBuscaPaciente}>
            <Ionicons name="close" size={20} color="#94A3B8" />
          </Pressable>
        )}
      </View>

      {buscandoPaciente && (
        <ActivityIndicator style={styles.searchLoading} color="#A21CAF" />
      )}

      {pacienteEncontrado && (
        <>
          <View style={styles.identityCard}>
            <View style={styles.header}>
              <Text style={styles.identityTitle}>
                CONFIRMAÇÃO DE IDENTIDADE
              </Text>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() =>
                  router.push({
                    pathname: "/(app)/patients/edit",
                    params: { id: pacienteEncontrado.id },
                  })
                }
              >
                <FontAwesome name="pencil" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <Text style={styles.identityText}>
              <Text style={styles.identityLabel}>Nome:</Text>{" "}
              {pacienteEncontrado.nome_completo}
            </Text>

            <Text style={styles.identityText}>
              <Text style={styles.identityLabel}>CPF:</Text>{" "}
              {formatCpf(pacienteEncontrado.cpf)}
            </Text>

            <Text style={styles.identityText}>
              <Text style={styles.identityLabel}>Data de Nascimento:</Text>{" "}
              {formatarDataBR(pacienteEncontrado.data_nascimento)}
            </Text>

            <Text style={styles.identityText}>
              <Text style={styles.identityLabel}>Idade:</Text>{" "}
              {calcularIdade(pacienteEncontrado.data_nascimento)} anos
            </Text>

            <Text style={styles.identityText}>
              <Text style={styles.identityLabel}>Escolaridade:</Text>{" "}
              {pacienteEncontrado.escolaridade_nome ?? "Não informada"}
            </Text>

            <View style={styles.divider} />

            <Text style={styles.identityTitle}>HISTÓRICO</Text>

            <Text style={styles.identityText}>
              <Text style={styles.identityLabel}>
                Data da última avaliação:
              </Text>{" "}
              {formatarDataBR(pacienteEncontrado.ultima_avaliacao)}
            </Text>
          </View>

          <Pressable onPress={iniciarRastreio}>
            <LinearGradient
              colors={["#B12CF7", "#9D22F0", "#8A18E8"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.startButton}
            >
              <Text style={styles.startButtonText}>INICIAR RASTREIO</Text>
              <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
            </LinearGradient>
          </Pressable>

          <Pressable onPress={limparBuscaPaciente}>
            <Text style={styles.cancelText}>Voltar / Cancelar</Text>
          </Pressable>
        </>
      )}

      {pacienteNaoEncontrado && (
        <View style={styles.notFoundCard}>
          <Text style={styles.notFoundText}>Paciente não encontrado</Text>
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/(app)/patients/create",
                params: { cpfInicial: cpfBusca },
              })
            }
          >
            <LinearGradient
              colors={["#B12CF7", "#9D22F0", "#8A18E8"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.notFoundButton}
            >
              <Text style={styles.notFoundButtonText}>
                Cadastrar Novo Paciente
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F2F8",
    paddingHorizontal: 24,
    paddingTop: 18,
  },
  greeting: {
    fontSize: 18,
    fontWeight: "600",
    color: "#42526B",
    marginBottom: 18,
    marginTop: 6,
  },
  bannerButton: {
    marginBottom: 24,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#A020F0",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  bannerText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 22,
  },
  bannerCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  searchTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1F2A44",
    marginBottom: 12,
  },
  searchBox: {
    height: 52,
    borderWidth: 1.5,
    borderColor: "#C77DFF",
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
  },
  identityCard: {
    marginTop: 18,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E6E1F0",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  identityTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1F2A44",
    marginBottom: 12,
    flex: 1,
    flexWrap: "wrap",
  },
  identityText: {
    fontSize: 15,
    color: "#445066",
    marginBottom: 8,
    lineHeight: 22,
  },
  identityLabel: {
    fontWeight: "800",
    color: "#1F2A44",
  },

  divider: {
    height: 1,
    backgroundColor: "#E6E6EF",
    marginVertical: 5,
  },

  startButton: {
    marginTop: 20,
    borderRadius: 16,
    minHeight: 56,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#A020F0",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  startButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  cancelText: {
    marginTop: 16,
    textAlign: "center",
    color: "#6C63FF",
    fontSize: 15,
    fontWeight: "600",
  },
  notFoundCard: {
    marginTop: 18,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E9D5FF",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  notFoundText: {
    fontSize: 15,
    color: "#5B657C",
    marginBottom: 14,
  },
  notFoundButton: {
    borderRadius: 12,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  notFoundButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  searchLoading: {
    marginTop: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  editButton: {
    backgroundColor: "#c41616",
    width: 50,
    height: 50,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});
