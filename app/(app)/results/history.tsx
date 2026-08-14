import { HistoryChart } from "@/components/features/results/history-chart";
import { HistoryFilter } from "@/components/features/results/history-filter";
import { HistoryResultCard } from "@/components/features/results/history-result-card";
import { getDB } from "@/database/database";
import { getPatientHistory } from "@/database/repositories/ResultRepository";
import { CognitiveResult, ResultFilter } from "@/types/result";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
  useCallback,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

type PatientHeader = {
  id: number;
  nome_completo: string;
  cpf: string;
};

export default function PatientHistoryPage() {
  const params = useLocalSearchParams<{
    patientId?: string;
  }>();

  const patientId = Number(params.patientId);

  const [patient, setPatient] =
    useState<PatientHeader | null>(null);

  const [results, setResults] =
    useState<CognitiveResult[]>([]);

  const [filter, setFilter] =
    useState<ResultFilter>("all");

  const [loading, setLoading] =
    useState(true);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [patientId]),
  );

  async function loadHistory() {
    if (!patientId) {
      return;
    }

    try {
      setLoading(true);

      const db = await getDB();

      const patientData =
        await db.getFirstAsync<PatientHeader>(
          `
            SELECT
              id,
              nome_completo,
              cpf
            FROM paciente
            WHERE id = ?
              AND deleted_at IS NULL
            LIMIT 1
          `,
          [patientId],
        );

      setPatient(patientData || null);

      const history =
        await getPatientHistory(patientId);

      setResults(history);
    } catch (error) {
      console.error(
        "Erro ao carregar histórico:",
        error,
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredResults = useMemo(() => {
    if (filter === "all") {
      return results;
    }

    return results.filter((result) => {
      const abbreviation =
        result.testAbbreviation
          .trim()
          .toLowerCase();

      if (filter === "meem") {
        return abbreviation === "meem";
      }

      if (filter === "moca") {
        return abbreviation === "moca";
      }

      return (
        abbreviation === "fluência" ||
        abbreviation === "fluencia"
      );
    });
  }, [results, filter]);

  const maxScore = useMemo(() => {
    if (filteredResults.length === 0) {
      return 30;
    }

    return Math.max(
      ...filteredResults.map(
        (result) => result.maxScore,
      ),
    );
  }, [filteredResults]);

  function handleResultPress(
    result: CognitiveResult,
  ) {
    router.push({
      pathname: "/results/[id]",
      params: {
        id: String(result.id),
        type: result.testAbbreviation,
      },
    });
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#A824EE"
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {patient && (
        <View style={styles.patientCard}>
          <View style={styles.avatar}>
            <Ionicons
              name="person-outline"
              size={24}
              color="#A824EE"
            />
          </View>

          <View>
            <Text style={styles.patientName}>
              {patient.nome_completo}
            </Text>

            <Text style={styles.patientCpf}>
              CPF: {patient.cpf}
            </Text>
          </View>
        </View>
      )}

      <Text style={styles.title}>
        Histórico de Avaliações
      </Text>

      <HistoryFilter
        value={filter}
        onChange={setFilter}
      />

      <HistoryChart
        results={filteredResults}
        maxScore={maxScore}
      />

      <Text style={styles.testsTitle}>
        Testes Realizados
      </Text>

      <View style={styles.resultsList}>
        {filteredResults.map((result) => (
          <HistoryResultCard
            key={`${result.testAbbreviation}-${result.id}`}
            result={result}
            onPress={handleResultPress}
          />
        ))}

        {filteredResults.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              Nenhuma avaliação encontrada para
              este filtro.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F2F8",
  },

  content: {
    padding: 16,
    paddingBottom: 32,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: "#F3F2F8",
    alignItems: "center",
    justifyContent: "center",
  },

  patientCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 16,

    flexDirection: "row",
    alignItems: "center",
    gap: 13,

    borderWidth: 1,
    borderColor: "#ECE8F2",
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F3E8FF",
    alignItems: "center",
    justifyContent: "center",
  },

  patientName: {
    color: "#334155",
    fontSize: 16,
    fontWeight: "700",
  },

  patientCpf: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 3,
  },

  title: {
    color: "#334155",
    fontSize: 19,
    fontWeight: "800",
    marginTop: 20,
    marginBottom: 14,
  },

  testsTitle: {
    color: "#334155",
    fontSize: 17,
    fontWeight: "800",
    marginTop: 22,
    marginBottom: 12,
  },

  resultsList: {
    gap: 12,
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
  },

  emptyText: {
    color: "#64748B",
    textAlign: "center",
  },
});