import { useBuscaHistorico } from "@/hooks/useBuscarHistorico";
import { formatCpf } from "@/utils/formatters";
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ResultsPage() {
  const { cpfBusca, setCpfBusca, loading, getBuscarHistorico } =
    useBuscaHistorico();

  return (
    <View style={styles.container}>
      <View style={styles.boxTop}>
        <Text style={styles.title}>Histórico do Paciente</Text>

        <Text style={styles.text}>
          Digite o CPF para acessar o histórico completo de avaliações
        </Text>
      </View>

      <View style={styles.boxMid}>
        <View style={styles.boxInput}>
          <Ionicons name="search-outline" size={20} color="#94A3B8" />

          <TextInput
            placeholder="Digite o CPF do paciente"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
            value={cpfBusca}
            style={styles.input}
            maxLength={14}
            onChangeText={(text) => setCpfBusca(formatCpf(text))}
            returnKeyType="search"
            onSubmitEditing={getBuscarHistorico}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={getBuscarHistorico}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.textButton}>Buscar Histórico</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
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
    alignItems: "center",
  },
  boxMid: {
    width: "100%",
    alignItems: "center",
    marginTop: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
    textAlign: "center",
  },
  text: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    paddingHorizontal: 20,
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
  },
  input: {
    flex: 1,
    height: "100%",
    color: "#172033",
    fontSize: 16,
  },
  button: {
    height: 52,
    width: "100%",
    marginTop: 12,
    backgroundColor: "#732CAD",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  textButton: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
