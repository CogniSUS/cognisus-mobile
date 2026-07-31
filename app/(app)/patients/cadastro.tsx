import { useCadastroPaciente } from "@/hooks/useCadastroPaciente";
import { useDominios } from "@/hooks/useDominios";
import { formatCpf } from "@/utils/formatters";
import {
  AntDesign,
  FontAwesome,
  FontAwesome5,
  Ionicons,
} from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
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

export default function CadastroPacientePage() {
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
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.boxTop}>
          <Text style={styles.text}>Cadastro de Paciente</Text>
        </View>

        <View style={styles.boxMid}>
          {/* Campo Nome */}
          <View style={styles.boxInput}>
            <TextInput
              placeholder="Nome completo"
              value={nome}
              onChangeText={setNome}
              autoCapitalize="words"
              style={styles.input}
            />
            <AntDesign style={styles.icons} name="smile" size={24} />
          </View>

          {/* Campo CPF */}
          <View style={styles.boxInput}>
            <TextInput
              placeholder="Digite seu CPF"
              keyboardType="numeric"
              value={cpf}
              maxLength={14}
              onChangeText={(text) => setCpf(formatCpf(text))}
              style={styles.input}
            />
            <FontAwesome style={styles.icons} name="id-card-o" size={24} />
          </View>

          {/* Campo Data */}
          <View style={styles.boxInput}>
            <TextInput
              placeholder="Data de nascimento"
              value={dataNascimento}
              onChangeText={(text) => {
                let formatted = text.replace(/\D/g, "");
                if (formatted.length > 2)
                  formatted = formatted.slice(0, 2) + "/" + formatted.slice(2);
                if (formatted.length > 5)
                  formatted = formatted.slice(0, 5) + "/" + formatted.slice(5);
                setDataNascimento(formatted);
              }}
              keyboardType="numeric"
              maxLength={10}
              style={styles.input}
            />
            <FontAwesome5 style={styles.icons} name="calendar-alt" size={24} />
          </View>

          {/* Picker Sexo */}
          <View style={styles.boxInput}>
            <Picker
              selectedValue={sexo}
              onValueChange={setSexo}
              style={styles.picker}
            >
              <Picker.Item label="Selecione o sexo" value="" />
              <Picker.Item label="Masculino" value="masculino" />
              <Picker.Item label="Feminino" value="feminino" />
              <Picker.Item label="Outro" value="outro" />
            </Picker>
            <FontAwesome style={styles.icons} name="intersex" size={24} />
          </View>

          {/* Picker Escolaridade */}
          <View style={styles.boxInput}>
            <Picker
              selectedValue={escolaridade}
              onValueChange={setEscolaridade}
              style={styles.picker}
            >
              <Picker.Item label="Escolaridade" value="" />
              {listaEscolaridade.map((item) => (
                <Picker.Item key={item.id} label={item.tipo} value={item.id} />
              ))}
            </Picker>
            <Ionicons style={styles.icons} name="school" size={24} />
          </View>

          {/* Botão DCNT */}
          <TouchableOpacity
            style={styles.boxInput}
            onPress={() => setModalDcntVisivel(true)}
          >
            <Text
              style={{
                color: dcntsSelecionadas.length > 0 ? "#000" : "#888",
                flex: 1,
                paddingLeft: 10,
              }}
            >
              {dcntsSelecionadas.length > 0
                ? `${dcntsSelecionadas.length} DCNT(s) selecionada(s)`
                : "Nenhuma DCNT (Opcional)"}
            </Text>
            <FontAwesome style={styles.icons} name="heartbeat" size={24} />
          </TouchableOpacity>

          {/* Botoes Finais */}
          <View style={styles.boxBotton}>
            <TouchableOpacity
              style={[styles.button, styles.tertiaryButton]}
              onPress={() => router.back()}
            >
              <Text style={styles.tertiaryButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.tertiaryButton]}
              onPress={cadastrarPaciente}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.tertiaryButtonText}>Confirmar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

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
                  >
                    <Ionicons
                      name={isSelected ? "checkbox" : "square-outline"}
                      size={24}
                      color={isSelected ? "#2563EB" : "#64748B"}
                    />
                    <Text
                      style={[
                        styles.checkboxLabel,
                        isSelected && styles.checkboxLabelSelected,
                      ]}
                    >
                      {item.tipo}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />

            <TouchableOpacity
              style={[styles.button, styles.primaryButton, { marginTop: 15 }]}
              onPress={() => setModalDcntVisivel(false)}
            >
              <Text style={styles.primaryButtonText}>Concluído</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 32,
  },
  boxTop: {
    height: Dimensions.get("window").height / 5.3,
    width: "100%",
    marginTop: -30,
    alignItems: "center",
  },
  boxMid: {
    height: Dimensions.get("window").height / 1.5,
    width: "100%",
    marginTop: -100,
    backgroundColor: "#e3deff",
    borderRadius: 20,
  },
  boxBotton: {
    height: 62,
    width: "85%",
    alignSelf: "center",
    marginTop: 15,
  },
  tertiaryButton: {
    backgroundColor: "#732cad",
  },
  boxInput: {
    height: 51,
    width: "85%",
    alignSelf: "center",
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 14,
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: 10,
    overflow: "hidden",
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
    alignSelf: "flex-start",
    marginLeft: 12,
    color: "#0f0f0f",
    textAlign: "center",
    marginTop: 12,
  },
  input: {
    flex: 1,
    height: "100%",
    width: "100%",
    paddingHorizontal: 10,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: "#2563EB",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
  tertiaryButtonText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#ffffff",
    alignSelf: "center",
    justifyContent: "center",
  },
  icons: {
    marginTop: 4,
    marginLeft: 4,
  },
  picker: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    maxHeight: "80%",
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0F172A",
    marginBottom: 15,
    textAlign: "center",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  checkboxSelected: {
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    borderBottomWidth: 0,
  },
  checkboxLabel: {
    marginLeft: 12,
    fontSize: 16,
    color: "#334155",
    flex: 1,
  },
  checkboxLabelSelected: {
    color: "#2563EB",
    fontWeight: "600",
  },
});
