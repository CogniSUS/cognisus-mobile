import { useCadastroPaciente } from "@/hooks/useCadastroPaciente";
import { useDominios } from "@/hooks/useDominios";
import { capitalizarNome, formatCpf } from "@/utils/formatters";
import {
  AntDesign,
  Feather,
  FontAwesome,
  FontAwesome5,
  Ionicons,
} from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function PatientCreatePage() {
  const params = useLocalSearchParams<{ cpfInicial?: string }>();
  const { listaEscolaridade, listaDCNT } = useDominios();

  const {
    nome,
    setNome,
    cpf,
    setCpf,
    dataNascimento,
    setDataNascimento,
    sexo,
    setSexo,
    escolaridade,
    setEscolaridade,
    dcntsSelecionadas,
    loading,
    toggleDcnt,
    cadastrarPaciente,
  } = useCadastroPaciente((cpfCadastrado) => {
    router.replace({
      pathname: "/",
      params: { cpfBuscaInicial: cpfCadastrado },
    });
  }, listaDCNT);

  useEffect(() => {
    if (params.cpfInicial) {
      setCpf(formatCpf(params.cpfInicial));
    }
  }, [params.cpfInicial, setCpf]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: "#F8FAFC" }}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <Feather name="arrow-left" size={26} color="#0f0f0f" />
          </TouchableOpacity>
          <Text style={styles.textTitle}>Cadastro de Paciente</Text>
        </View>

        <View style={styles.boxMid}>
          {/* NOME */}
          <View style={styles.boxInput}>
            <AntDesign name="smile" size={24} color="#732cad" />
            <TextInput
              placeholder="Nome completo"
              value={nome}
              onChangeText={setNome}
              autoCapitalize="words"
              style={styles.input}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* CPF */}
          <View style={styles.boxInput}>
            <FontAwesome name="id-card-o" size={24} color="#732cad" />
            <TextInput
              placeholder="Digite seu CPF"
              value={cpf}
              maxLength={14}
              onChangeText={(text) => setCpf(formatCpf(text))}
              keyboardType="numeric"
              style={styles.input}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* DATA NASCIMENTO */}
          <View style={styles.boxInput}>
            <FontAwesome5 name="calendar-alt" size={24} color="#732cad" />
            <TextInput
              placeholder="Data de nascimento"
              value={dataNascimento}
              onChangeText={(text) => {
                let formatted = text.replace(/\D/g, "");
                if (formatted.length > 2) {
                  formatted = formatted.slice(0, 2) + "/" + formatted.slice(2);
                }
                if (formatted.length > 5) {
                  formatted = formatted.slice(0, 5) + "/" + formatted.slice(5);
                }
                setDataNascimento(formatted);
              }}
              keyboardType="numeric"
              maxLength={10}
              style={styles.input}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* SEXO */}
          <View style={styles.boxInput}>
            <FontAwesome name="intersex" size={24} color="#732cad" />
            <Picker
              selectedValue={sexo}
              onValueChange={(itemValue) => setSexo(itemValue)}
              style={styles.picker}
              dropdownIconColor="#732cad"
            >
              <Picker.Item label="Selecione o sexo" value="" color="#9CA3AF" />
              <Picker.Item
                label="Masculino"
                value="masculino"
                color="#0f0f0f"
              />
              <Picker.Item label="Feminino" value="feminino" color="#0f0f0f" />
              <Picker.Item label="Outro" value="outro" color="#0f0f0f" />
            </Picker>
          </View>

          {/* ESCOLARIDADE */}
          <View style={styles.boxInput}>
            <Ionicons name="school" size={24} color="#732cad" />
            <Picker
              selectedValue={escolaridade}
              onValueChange={(itemValue) => setEscolaridade(itemValue)}
              style={styles.picker}
              dropdownIconColor="#732cad"
            >
              <Picker.Item label="Escolaridade" value="" color="#9CA3AF" />
              {listaEscolaridade.map((item) => (
                <Picker.Item
                  key={item.id}
                  label={capitalizarNome(item.tipo)}
                  value={item.id}
                  color="#0f0f0f"
                />
              ))}
            </Picker>
          </View>

          {/* SEÇÃO DE CONDIÇÕES DE SAÚDE (DCNT) - MOVIMENTADA PARA CIMA DOS BOTÕES */}
          <View style={styles.healthConditionSection}>
            <Text style={styles.healthConditionQuestion}>
              Algum profissional de saúde já informou que você tem alguma das
              seguintes condições de saúde?
            </Text>

            <View style={styles.chipsContainer}>
              {listaDCNT.map((item) => {
                const isSelected = dcntsSelecionadas.includes(item.id);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                    onPress={() => toggleDcnt(item.id, item.tipo)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isSelected && styles.chipTextSelected,
                      ]}
                    >
                      {item.tipo}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* BOTÕES DE AÇÃO - SEMPRE NO FINAL */}
          <View style={styles.boxBotton}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => router.back()}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.tertiaryButton]}
              onPress={cadastrarPaciente}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={"white"} size={"small"} />
              ) : (
                <Text style={styles.tertiaryButtonText}>Confirmar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#F8FAFC",
    padding: 24,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  textTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0f0f0f",
    marginLeft: 16,
  },
  boxMid: {
    width: "100%",
  },
  boxInput: {
    height: 56,
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    height: "100%",
    marginLeft: 12,
    fontSize: 16,
    color: "#0f0f0f",
  },
  picker: {
    flex: 1,
    marginLeft: 4,
    height: "100%",
  },
  healthConditionSection: {
    width: "100%",
    marginTop: 8,
    marginBottom: 24,
  },
  healthConditionQuestion: {
    fontSize: 15,
    fontWeight: "600",
    color: "#334155",
    lineHeight: 22,
    marginBottom: 12,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  chipSelected: {
    backgroundColor: "#F3E8FF",
    borderColor: "#A824EE",
  },
  chipText: {
    fontSize: 14,
    color: "#475569",
    fontWeight: "500",
  },
  chipTextSelected: {
    color: "#A824EE",
    fontWeight: "700",
  },
  boxBotton: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    gap: 12,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#732cad",
  },
  tertiaryButton: {
    flex: 1,
    backgroundColor: "#732cad",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#732cad",
  },
  tertiaryButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
});
