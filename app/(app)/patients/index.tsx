import {
  PatientListCard,
  PatientListItem,
} from "@/components/features/patients/patient-list-card";
import { getDB } from "@/database/database";
import { useToast } from "@/hooks/useToast";
import { Patient } from "@/types/patient";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type PatientRow = {
  id: number;
  nome_completo: string;
  cpf: string;
  data_nascimento: string;
  sexo: string;
  escolaridade: number | null;
  ultima_avaliacao: string | null;
  ultima_unidade: string | null;
};

function normalizeSex(value: string): Patient["sexo"] {
  const normalized = value.trim().toLowerCase();

  if (
    normalized === "masculino" ||
    normalized === "feminino" ||
    normalized === "outro"
  ) {
    return normalized;
  }

  return "outro";
}

function mapRowToPatient(row: PatientRow): PatientListItem {
  return {
    id: row.id,
    nome_completo: row.nome_completo,
    cpf: row.cpf,
    data_nascimento: row.data_nascimento,
    sexo: normalizeSex(row.sexo),
    escolaridade: row.escolaridade ?? undefined,
    ultima_avaliacao: row.ultima_avaliacao,
    ultima_unidade: row.ultima_unidade,
  };
}

export default function PatientsPage() {
  const { success: showSuccess, error: showError } = useToast();

  const [patients, setPatients] = useState<PatientListItem[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function loadPatients(showLoading = true) {
    try {
      if (showLoading) {
        setIsLoading(true);
      }

      const db = await getDB();

      const rows = await db.getAllAsync<PatientRow>(
        `
          SELECT
            p.id,
            p.nome_completo,
            p.cpf,
            p.data_nascimento,
            p.sexo,
            p.escolaridade,

            (
              SELECT COALESCE(a.data_fim, a.data_inicio, a.created_at)
              FROM avaliacao_teste_meem a
              WHERE a.id_paciente = p.id
                AND a.deleted_at IS NULL
              ORDER BY datetime(
                COALESCE(a.data_fim, a.data_inicio, a.created_at)
              ) DESC
              LIMIT 1
            ) AS ultima_avaliacao,

            (
              SELECT u.nome
              FROM avaliacao_teste_meem a
              INNER JOIN unidade_saude u
                ON u.id = a.unidade_saude
              WHERE a.id_paciente = p.id
                AND a.deleted_at IS NULL
                AND u.deleted_at IS NULL
              ORDER BY datetime(
                COALESCE(a.data_fim, a.data_inicio, a.created_at)
              ) DESC
              LIMIT 1
            ) AS ultima_unidade

          FROM paciente p
          WHERE p.deleted_at IS NULL
          ORDER BY p.nome_completo COLLATE NOCASE ASC
        `,
      );

      setPatients(rows.map(mapRowToPatient));
    } catch (error) {
      console.error("Erro ao carregar pacientes:", error);
      showError("Não foi possível carregar os pacientes.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadPatients();
    }, []),
  );

  const filteredPatients = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");

    if (!normalizedSearch) {
      return patients;
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

  function handleAddPatient() {
    router.push({
      pathname: "/patients/create",
      params: {
        abrirCadastro: "true",
      },
    });
  }

  function handlePatientPress(patient: PatientListItem) {
    router.push({
      pathname: "/patients/[id]",
      params: {
        id: String(patient.id),
      },
    });
  }

  function handleEditPatient(patient: PatientListItem) {
    router.push({
      pathname: "/patients/edit",
      params: {
        id: String(patient.id),
      },
    });
  }

  function handleDeletePatient(patient: PatientListItem) {
    Alert.alert(
      "Excluir paciente",
      `Deseja realmente excluir ${patient.nome_completo}?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => deletePatient(patient),
        },
      ],
    );
  }

  async function deletePatient(patient: PatientListItem) {
    try {
      const db = await getDB();
      const now = new Date().toISOString();

      await db.runAsync(
        `
          UPDATE paciente
          SET
            deleted_at = ?,
            update_at = ?,
            sync_status = ?
          WHERE id = ?
        `,
        [now, now, "pending", patient.id],
      );

      setPatients((currentPatients) =>
        currentPatients.filter((item) => item.id !== patient.id),
      );

      showSuccess("Paciente excluído com sucesso.");
    } catch (error) {
      console.error("Erro ao excluir paciente:", error);
      showError("Não foi possível excluir o paciente.");
    }
  }

  async function handleRefresh() {
    setIsRefreshing(true);
    await loadPatients(false);
  }

  function clearSearch() {
    setSearch("");
  }

  function renderEmptyState() {
    if (isLoading) {
      return null;
    }

    const isSearching = search.trim().length > 0;

    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name={isSearching ? "search-outline" : "people-outline"}
          size={42}
          color="#B7A5D9"
        />

        <Text style={styles.emptyTitle}>
          {isSearching
            ? "Nenhum paciente encontrado"
            : "Nenhum paciente cadastrado"}
        </Text>

        <Text style={styles.emptyText}>
          {isSearching
            ? "Verifique o nome ou CPF informado."
            : "Os pacientes cadastrados aparecerão nesta lista."}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Pacientes Cadastrados</Text>

        <Pressable
          style={({ pressed }) => [
            styles.addButton,
            pressed && styles.addButtonPressed,
          ]}
          onPress={handleAddPatient}
          accessibilityRole="button"
          accessibilityLabel="Cadastrar novo paciente"
        >
          <Ionicons name="add" size={32} color="#FFFFFF" />
        </Pressable>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={23} color="#94A3B8" />

        <TextInput
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
          placeholder="Buscar por nome ou CPF"
          placeholderTextColor="#94A3B8"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />

        {search.length > 0 && (
          <Pressable
            onPress={clearSearch}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Limpar busca"
          >
            <Ionicons name="close" size={22} color="#94A3B8" />
          </Pressable>
        )}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#A824EE" />
          <Text style={styles.loadingText}>Carregando pacientes...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredPatients}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <PatientListCard
              patient={item}
              onPress={handlePatientPress}
              onEdit={handleEditPatient}
              onDelete={handleDeletePatient}
            />
          )}
          contentContainerStyle={[
            styles.listContent,
            filteredPatients.length === 0 && styles.emptyListContent,
          ]}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={["#A824EE"]}
              tintColor="#A824EE"
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F4F8",
    paddingHorizontal: 18,
    paddingTop: 20,
  },

  headerRow: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  title: {
    flex: 1,
    color: "#172033",
    fontSize: 24,
    fontWeight: "800",
    marginRight: 16,
  },

  addButton: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: "#A824EE",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#F23D9A",
    shadowColor: "#A824EE",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 7,
    elevation: 4,
  },

  addButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },

  searchContainer: {
    height: 60,
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: "#ECE8F2",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  searchInput: {
    flex: 1,
    height: "100%",
    color: "#172033",
    fontSize: 16,
  },

  listContent: {
    paddingBottom: 26,
  },

  emptyListContent: {
    flexGrow: 1,
  },

  separator: {
    height: 14,
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },

  loadingText: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "500",
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingBottom: 80,
  },

  emptyTitle: {
    color: "#334155",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 14,
    textAlign: "center",
  },

  emptyText: {
    color: "#64748B",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 7,
    textAlign: "center",
  },
});
