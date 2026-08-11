import { useBuscaHistorico } from "@/hooks/useBuscarHistorico";
import { formatCpf } from "@/utils/formatters";
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Dimensions,
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
          />
        </View>
        <TouchableOpacity style={styles.button} onPress={getBuscarHistorico}>
          {loading ? (
            <ActivityIndicator color={"white"} size={"small"} />
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
    padding: 24,
  },
  boxTop: {
    height: Dimensions.get("window").height / 4,
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  boxMid: {
    height: Dimensions.get("window").height / 3,
    width: "100%",
    alignItems: "center",
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
    height: 50,
    width: "85%",
    alignSelf: "center",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 30,
    borderColor: "#732cad",
    flexDirection: "row",
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    height: "100%",
    color: "#172033",
    fontSize: 16,
    marginLeft: 10,
  },
  button: {
    height: 50,
    width: "85%",
    marginTop: 10,
    alignSelf: "center",
    backgroundColor: "#732cad",
    borderRadius: 20,
    justifyContent: "center",
  },
  textButton: {
    fontSize: 20,
    fontWeight: "500",
    color: "#ffffff",
    alignSelf: "center",
  },
});
