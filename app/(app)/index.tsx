import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/providers/AuthProvider";
import { calcularIdade, formatarDataBR } from "@/utils/dateHelpers";
import { capitalizarNome, formatCpf } from "@/utils/formatters";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PacienteRepository } from "@/database/repositories/PacienteRepository";
import { Q } from "@nozbe/watermelondb";

type PacienteMapeado = {
  id: string;
  nome_completo: string;
  cpf: string;
  data_nascimento: string;
  sexo: string;
  escolaridade_nome?: string;
  ultima_avaliacao?: string | null;
};

export default function HomePage() {
  const { user } = useAuth();
  const { info: showInfo, error: showError } = useToast();
  const params = useLocalSearchParams<{ cpfBuscaInicial?: string }>();

  const insets = useSafeAreaInsets();

  const [patients, setPatients] = useState<PacienteMapeado[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Estados e Animação do Modal Customizado
  const [modalVisible, setModalVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [pacienteSelecionado, setPacienteSelecionado] =
    useState<PacienteMapeado | null>(null);

  const nomeProfissional = useMemo(() => {
    return user?.user_metadata?.nome_completo || user?.email || "Profissional";
  }, [user]);

  async function carregarPacientes() {
    try {
      setIsLoading(true);
      const todosPacientes = await PacienteRepository.listarTodos();
      const pacientesMapeados: PacienteMapeado[] = [];

      for (const p of todosPacientes) {
        let ultimaAvaliacaoData = null;
        let escolaridadeNome = undefined;

        try {
          const avaliacoes = await p.avaliacoes
            .extend(Q.sortBy("created_at", Q.desc), Q.take(1))
            .fetch();

          if (avaliacoes.length > 0) {
            const a = avaliacoes[0];
            ultimaAvaliacaoData =
              a.dataFim || a.dataInicio || a.createdAt?.toISOString();
          }

          if (p.nivelEscolaridade) {
            const esc = await p.nivelEscolaridade.fetch();
            escolaridadeNome = esc ? esc.tipo : undefined;
          }
        } catch (e) {
          console.warn(
            `Aviso: Falha ao carregar dependências do paciente ${p.id}`,
          );
        }

        pacientesMapeados.push({
          id: p.id,
          nome_completo: p.nomeCompleto,
          cpf: p.cpf,
          data_nascimento: p.dataNascimento,
          sexo: p.sexo,
          escolaridade_nome: escolaridadeNome,
          ultima_avaliacao: ultimaAvaliacaoData,
        });
      }

      setPatients(pacientesMapeados);
    } catch (error) {
      console.error("Erro ao carregar pacientes:", error);
      showError("Não foi possível carregar a lista de pacientes.");
    } finally {
      setIsLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      carregarPacientes();
    }, []),
  );

  useEffect(() => {
    if (params.cpfBuscaInicial) {
      setSearch(formatCpf(params.cpfBuscaInicial));
      router.setParams({ cpfBuscaInicial: undefined });
    }
  }, [params.cpfBuscaInicial]);

  const filteredPatients = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");

    // LÓGICA CORRIGIDA AQUI
    if (!normalizedSearch) {
      // 1. Filtra apenas pacientes que possuem data de última avaliação
      const avaliadosRecentemente = patients.filter(
        (patient) => patient.ultima_avaliacao != null,
      );

      // 2. Ordena da avaliação mais recente para a mais antiga
      avaliadosRecentemente.sort((a, b) => {
        const dataA = new Date(a.ultima_avaliacao as string).getTime();
        const dataB = new Date(b.ultima_avaliacao as string).getTime();
        return dataB - dataA;
      });

      // 3. Retorna os 5 primeiros
      return avaliadosRecentemente.slice(0, 5);
    }

    const searchDigits = normalizedSearch.replace(/\D/g, "");

    return patients.filter((patient) => {
      const normalizedName = patient.nome_completo.toLocaleLowerCase("pt-BR");
      const cpfDigits = patient.cpf.replace(/\D/g, "");

      const matchesName = normalizedName.includes(normalizedSearch);
      const matchesCpf =
        searchDigits.length > 0 && cpfDigits.includes(searchDigits);

      return matchesName || matchesCpf;
    });
  }, [patients, search]);

  // Funções de controle da Animação do Modal
  function abrirModal(paciente: PacienteMapeado) {
    setPacienteSelecionado(paciente);
    setModalVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }

  function fecharModal() {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      setPacienteSelecionado(null);
    });
  }

  function iniciarRastreio() {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);

      if (pacienteSelecionado) {
        router.push({
          pathname: "/tests/select-instrument",
          params: {
            patientId: String(pacienteSelecionado.id),
            nome: pacienteSelecionado.nome_completo,
            cpf: pacienteSelecionado.cpf,
            dataNascimento: pacienteSelecionado.data_nascimento,
            sexo: pacienteSelecionado.sexo,
            escolaridade: pacienteSelecionado.escolaridade_nome ?? "",
          },
        });
      }
    });
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Text style={styles.greeting}>
        Olá, {capitalizarNome(nomeProfissional)}
      </Text>

      <Text style={styles.searchTitle}>Buscar Paciente</Text>

      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={20} color="#94A3B8" />
        <TextInput
          placeholder="Digite o Nome ou CPF"
          placeholderTextColor="#9CA3AF"
          style={styles.searchInput}
          value={search}
          autoCapitalize="words"
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch("")} hitSlop={10}>
            <Ionicons name="close" size={20} color="#94A3B8" />
          </Pressable>
        )}
      </View>

      {isLoading ? (
        <ActivityIndicator
          style={styles.searchLoading}
          size="large"
          color="#A21CAF"
        />
      ) : (
        <FlatList
          data={filteredPatients}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={() => (
            <Text style={styles.listSectionTitle}>
              {search.length > 0
                ? "Resultados da busca"
                : "Avaliados Recentemente"}
            </Text>
          )}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed,
              ]}
              onPress={() => abrirModal(item)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.patientName}>{item.nome_completo}</Text>
                <TouchableOpacity
                  hitSlop={15}
                  onPress={() =>
                    router.push({
                      pathname: "/(app)/patients/edit",
                      params: { id: item.id },
                    })
                  }
                >
                  <Feather name="edit-2" size={18} color="#2563EB" />
                </TouchableOpacity>
              </View>

              <View style={styles.cardBody}>
                <Text style={styles.infoText}>
                  <Text style={styles.infoLabel}>CPF:</Text>{" "}
                  {formatCpf(item.cpf)}
                </Text>
                <Text style={styles.infoText}>
                  <Text style={styles.infoLabel}>Idade:</Text>{" "}
                  {calcularIdade(item.data_nascimento)} anos
                </Text>
                <Text style={styles.infoText}>
                  <Text style={styles.infoLabel}>Última avaliação:</Text>{" "}
                  {item.ultima_avaliacao
                    ? formatarDataBR(item.ultima_avaliacao)
                    : "Nenhuma"}
                </Text>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.actionText}>Selecionar para Rastreio</Text>
                <Ionicons name="arrow-forward" size={16} color="#A21CAF" />
              </View>
            </Pressable>
          )}
          ListEmptyComponent={() => {
            // LÓGICA DE EMPTY STATE CORRIGIDA AQUI
            if (search.length > 0) {
              return (
                <View style={styles.notFoundCard}>
                  <Text style={styles.notFoundText}>
                    Paciente não encontrado
                  </Text>
                  <Pressable
                    onPress={() =>
                      router.push({
                        pathname: "/(app)/patients/create",
                        params: { cpfInicial: search.replace(/\D/g, "") },
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
              );
            }

            // Exibição quando não há busca E não há pacientes avaliados recentemente
            return (
              <View style={[styles.notFoundCard, { borderColor: "#E2E8F0" }]}>
                <Text style={[styles.notFoundText, { marginBottom: 0 }]}>
                  Nenhuma avaliação recente encontrada.
                </Text>
              </View>
            );
          }}
        />
      )}

      {modalVisible && (
        <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={fecharModal} />

          <View
            style={[
              styles.modalContent,
              { paddingBottom: Math.max(insets.bottom, 24) },
            ]}
          >
            <View style={styles.modalDragHandle} />

            <Text style={styles.modalTitle}>Confirmação de Identidade</Text>
            <Text style={styles.modalSubtitle}>
              Verifique os dados antes de iniciar o rastreio cognitivo.
            </Text>

            {pacienteSelecionado && (
              <View style={styles.identityCard}>
                <Text style={styles.identityText}>
                  <Text style={styles.identityLabel}>Nome:</Text>{" "}
                  {pacienteSelecionado.nome_completo}
                </Text>
                <Text style={styles.identityText}>
                  <Text style={styles.identityLabel}>CPF:</Text>{" "}
                  {formatCpf(pacienteSelecionado.cpf)}
                </Text>
                <Text style={styles.identityText}>
                  <Text style={styles.identityLabel}>Data Nasc.:</Text>{" "}
                  {formatarDataBR(pacienteSelecionado.data_nascimento)} (
                  {calcularIdade(pacienteSelecionado.data_nascimento)} anos)
                </Text>
                <Text style={styles.identityText}>
                  <Text style={styles.identityLabel}>Escolaridade:</Text>{" "}
                  {pacienteSelecionado.escolaridade_nome ?? "Não informada"}
                </Text>
              </View>
            )}

            <Pressable onPress={iniciarRastreio} style={{ width: "100%" }}>
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

            <Pressable onPress={fecharModal} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Voltar / Cancelar</Text>
            </Pressable>
          </View>
        </Animated.View>
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
    marginBottom: 24,
    marginTop: 6,
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
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
  },
  searchLoading: {
    marginTop: 30,
  },
  listContent: {
    paddingBottom: 40,
  },
  listSectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 12,
    marginTop: 8,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E6E1F0",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  patientName: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1F2A44",
    flex: 1,
  },
  cardBody: {
    gap: 4,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: "#445066",
  },
  infoLabel: {
    fontWeight: "700",
    color: "#1F2A44",
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  actionText: {
    color: "#A21CAF",
    fontWeight: "700",
    fontSize: 14,
  },

  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
    zIndex: 100,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 0,
    alignItems: "center",
  },
  modalDragHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#E2E8F0",
    borderRadius: 2,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1F2A44",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 20,
  },
  identityCard: {
    width: "100%",
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E6E1F0",
    marginBottom: 24,
    gap: 8,
  },
  identityText: {
    fontSize: 15,
    color: "#445066",
  },
  identityLabel: {
    fontWeight: "800",
    color: "#1F2A44",
  },
  startButton: {
    borderRadius: 16,
    minHeight: 56,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#A020F0",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    width: "100%",
  },
  startButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  cancelButton: {
    paddingTop: 16,
    marginTop: 8,
    width: "100%",
    alignItems: "center",
  },
  cancelText: {
    color: "#6C63FF",
    fontSize: 15,
    fontWeight: "600",
  },
  notFoundCard: {
    marginTop: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E9D5FF",
    alignItems: "center",
  },
  notFoundText: {
    fontSize: 15,
    color: "#5B657C",
    marginBottom: 14,
  },
  notFoundButton: {
    borderRadius: 12,
    minHeight: 48,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  notFoundButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
});
