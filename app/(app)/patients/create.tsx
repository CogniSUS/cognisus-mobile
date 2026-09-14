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
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
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

  const [modalDcntVisivel, setModalDcntVisivel] = useState(false);
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
  });

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
              dropdownIconColor="#732cad" // Força a cor do ícone de dropdown para não ficar invisível
            >
              <Picker.Item
                label="Selecione o sexo"
                value=""
                // enabled={false} - Removido: era isso que bloqueava o clique na área do input!
                color="#9CA3AF"
              />
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
              <Picker.Item
                label="Escolaridade"
                value=""
                // enabled={false} - Removido
                color="#9CA3AF"
              />
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

          {/* DCNT */}
          <TouchableOpacity
            style={styles.boxInput}
            onPress={() => setModalDcntVisivel(true)}
            activeOpacity={0.7}
          >
            <FontAwesome name="heartbeat" size={24} color="#732cad" />
            <View style={styles.inputPlaceholderContainer}>
              <Text
                style={{
                  color: dcntsSelecionadas.length > 0 ? "#0f0f0f" : "#9CA3AF",
                  fontSize: 16,
                }}
              >
                {dcntsSelecionadas.length > 0
                  ? `${dcntsSelecionadas.length} DCNT(s) selecionada(s)`
                  : "DCNT referida (opcional)"}
              </Text>
            </View>
          </TouchableOpacity>

          {/* BOTÕES DE AÇÃO */}
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

        {/* --- MODAL DE SELEÇÃO MÚLTIPLA DE DCNT --- */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalDcntVisivel}
          onRequestClose={() => setModalDcntVisivel(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Selecione as DCNTs</Text>

              <FlatList
                data={listaDCNT}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                  const isSelected = dcntsSelecionadas.includes(item.id);

                  return (
                    <TouchableOpacity
                      style={[
                        styles.checkboxContainer,
                        isSelected && styles.checkboxSelected,
                      ]}
                      onPress={() => toggleDcnt(item.id)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={isSelected ? "checkbox" : "square-outline"}
                        size={24}
                        color={isSelected ? "#A824EE" : "#64748B"}
                      />
                      <Text
                        style={[
                          styles.checkboxLabel,
                          isSelected && styles.checkboxLabelSelected,
                        ]}
                      >
                        {capitalizarNome(item.tipo)}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.primaryButton,
                  { marginTop: 15, width: "100%" },
                ]}
                onPress={() => setModalDcntVisivel(false)}
              >
                <Text style={styles.primaryButtonText}>Concluído</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
  inputPlaceholderContainer: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
    marginLeft: 12,
  },
  picker: {
    flex: 1,
    marginLeft: 4,
    height: "100%", // Garante que a área clicável do picker expanda verticalmente por toda a caixa
  },
  boxBotton: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 12,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#A824EE",
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
  primaryButton: {
    backgroundColor: "#A824EE",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F172A",
    marginBottom: 15,
    textAlign: "center",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  checkboxSelected: {
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 0,
  },
  checkboxLabel: {
    marginLeft: 12,
    fontSize: 16,
    color: "#334155",
  },
  checkboxLabelSelected: {
    color: "#A824EE",
    fontWeight: "600",
  },
});
