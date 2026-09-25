import { useToast } from "@/hooks/useToast";
import { formatarDataBR } from "@/utils/dateHelpers";
import { formatCpf } from "@/utils/formatters";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { PacienteRepository } from "@/database/repositories/PacienteRepository";
import { Q } from "@nozbe/watermelondb";

type PacienteMapeado = {
  id: string;
  nome_completo: string;
  cpf: string;
  ultima_avaliacao?: string | null;
};

export default function ResultsPage() {
  const { error: showError } = useToast();

  const [patients, setPatients] = useState<PacienteMapeado[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  async function carregarPacientes() {
    try {
      setIsLoading(true);
      const todosPacientes = await PacienteRepository.listarTodos();
      const pacientesMapeados: PacienteMapeado[] = [];

      for (const p of todosPacientes) {
        let ultimaAvaliacaoData = null;

        try {
          const avaliacoes = await p.avaliacoes
            .extend(Q.sortBy("created_at", Q.desc), Q.take(1))
            .fetch();

          if (avaliacoes.length > 0) {
            const a = avaliacoes[0];
            ultimaAvaliacaoData =
              a.dataFim || a.dataInicio || a.createdAt?.toISOString();
          }
        } catch (e) {
          console.warn(
            `Aviso: Falha ao carregar avaliações do paciente ${p.id}`,
          );
        }

        pacientesMapeados.push({
          id: p.id,
          nome_completo: p.nomeCompleto,
          cpf: p.cpf,
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

  const filteredPatients = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");

    if (!normalizedSearch) {
      // Exibe apenas pacientes que já possuem histórico (alguma avaliação)
      const comHistorico = patients.filter((p) => p.ultima_avaliacao != null);

      // Ordena pelas avaliações mais recentes
      comHistorico.sort((a, b) => {
        const dataA = new Date(a.ultima_avaliacao as string).getTime();
        const dataB = new Date(b.ultima_avaliacao as string).getTime();
        return dataB - dataA;
      });

      return comHistorico.slice(0, 10);
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

  function handleSelecionarPaciente(patientId: string) {
    router.push({
      pathname: "/(app)/results/history",
      params: { patientId },
    });
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.boxTop}>
        <Text style={styles.title}>Histórico do Paciente</Text>
        <Text style={styles.text}>
          Busque por Nome ou CPF para acessar o histórico de avaliações.
        </Text>
      </View>

      <View style={styles.boxInput}>
        <Ionicons name="search-outline" size={20} color="#94A3B8" />
        <TextInput
          placeholder="Digite o Nome ou CPF"
          placeholderTextColor="#9CA3AF"
          style={styles.input}
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
              onPress={() => handleSelecionarPaciente(item.id)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.patientName}>{item.nome_completo}</Text>
              </View>

              <View style={styles.cardBody}>
                <Text style={styles.infoText}>
                  <Text style={styles.infoLabel}>CPF:</Text>{" "}
                  {formatCpf(item.cpf)}
                </Text>
                <Text style={styles.infoText}>
                  <Text style={styles.infoLabel}>Última avaliação:</Text>{" "}
                  {item.ultima_avaliacao
                    ? formatarDataBR(item.ultima_avaliacao)
                    : "Nenhuma avaliação"}
                </Text>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.actionText}>Ver Histórico Completo</Text>
                <Ionicons
                  name="document-text-outline"
                  size={16}
                  color="#A21CAF"
                />
              </View>
            </Pressable>
          )}
          ListEmptyComponent={() => {
            if (search.length > 0) {
              return (
                <View style={styles.notFoundCard}>
                  <Text style={styles.notFoundText}>
                    Paciente não encontrado
                  </Text>
                </View>
              );
            }

            return (
              <View style={[styles.notFoundCard, { borderColor: "#E2E8F0" }]}>
                <Text style={[styles.notFoundText, { marginBottom: 0 }]}>
                  Nenhum histórico recente encontrado.
                </Text>
              </View>
            );
          }}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  boxTop: {
    width: "100%",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
  },
  boxInput: {
    height: 52,
    width: "100%",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 14,
    borderColor: "#C77DFF",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    paddingHorizontal: 12,
    gap: 8,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    height: "100%",
    color: "#172033",
    fontSize: 16,
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
  },
});
