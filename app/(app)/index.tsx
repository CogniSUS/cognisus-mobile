import { getDB } from "@/database/database";
import { useToast } from "@/hooks/useToast";
import {
  AntDesign,
  FontAwesome,
  FontAwesome5,
  Ionicons,
} from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomePage() {
  const [mostrarCadastro, setMostrarCadastro] = useState(false);
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [sexo, setSexo] = useState("");
  const [escolaridade, setEscolaridade] = useState("");
  const [dcnt, setDCNT] = useState("");
  const [loading, setLoading] = useState(false);

  const [dcntsSelecionadas, setDcntsSelecionadas] = useState<number[]>([]);
  const [modalDcntVisivel, setModalDcntVisivel] = useState(false);

  const [listaEscolaridade, setListaEscolaridade] = useState<
    { id: number; tipo: string }[]
  >([]);
  const [listaDCNT, setListaDCNT] = useState<{ id: number; tipo: string }[]>(
    [],
  );

  const { success: showSuccess, error: showError, info: showInfo } = useToast();

  function formatCpf(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9)
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  }

  function limparCampos() {
    setNome("");
    setCpf("");
    setDataNascimento("");
    setSexo("");
    setEscolaridade("");
    setDCNT("");
  }

  function toggleDcnt(id: number) {
    setDcntsSelecionadas((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  }

  async function carregarEscolaridades() {
    const db = await getDB();

    const dados = await db.getAllAsync<{
      id: number;
      tipo: string;
    }>("SELECT * FROM escolaridade");

    setListaEscolaridade(dados);
  }

  async function carregarDCNT() {
    const db = await getDB();

    const dados = await db.getAllAsync<{
      id: number;
      tipo: string;
    }>("SELECT * FROM dcnt");

    setListaDCNT(dados);
  }

  async function cadastrarPaciente() {
    try {
      setLoading(true);

      const cpfNumeros = cpf.replace(/\D/g, "");

      if (
        !nome ||
        !cpfNumeros ||
        !dataNascimento ||
        sexo === "" ||
        escolaridade === ""
      ) {
        setLoading(false);
        return showInfo("Preencha os campos");
      } else if (cpfNumeros.length !== 11) {
        setLoading(false);
        return showError("CPF deve conter exatamente 11 dígitos");
      }

      const partesData = dataNascimento.split("/");

      if (partesData.length !== 3) {
        setLoading(false);
        return showError("Data inválida");
      }

      const dia = partesData[0];
      const mes = partesData[1];
      const ano = partesData[2];

      if (dia.length !== 2 || mes.length !== 2 || ano.length !== 4) {
        setLoading(false);
        return showError("Data inválida");
      }

      const dataFormatada = `${ano}-${mes}-${dia}`;

      if (Number(dia) > 31 || Number(mes) > 12) {
        setLoading(false);
        return showError("Data inválida");
      }

      try {
        const db = await getDB();

        const pacienteExistente = await db.getFirstAsync<{ id: number }>(
          "SELECT id FROM paciente WHERE cpf = ? LIMIT 1",
          [cpfNumeros],
        );

        if (pacienteExistente) {
          setLoading(false);
          return showError("Este CPF já está cadastrado no sistema.");
        }

        await db.withTransactionAsync(async () => {
          const resultado = await db.runAsync(
            `INSERT INTO paciente (created_at, sync_status, nome_completo, cpf, data_nascimento, sexo, escolaridade)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              new Date().toISOString(),
              "pending",
              nome,
              cpfNumeros,
              dataFormatada,
              sexo,
              escolaridade,
            ],
          );

          const pacienteId = resultado.lastInsertRowId;

          // Inserindo todas as DCNTs do array
          for (const dcntId of dcntsSelecionadas) {
            await db.runAsync(
              `INSERT INTO paciente_dcnt (created_at, sync_status, id_paciente, id_dcnt)
               VALUES (?, ?, ?, ?)`,
              [new Date().toISOString(), "pending", pacienteId, dcntId],
            );
          }

          const pacientePersistido = await db.getAllAsync<{
            id: number;

            nome_completo: string;

            cpf: string;

            data_nascimento: string;

            sexo: string;

            escolaridade: number;
          }>(`SELECT * FROM paciente WHERE id = ?`, [pacienteId]);

          console.log("Paciente recuperado do banco local", pacientePersistido);

          const pacienteDcntPersistido = await db.getAllAsync<{
            id: number;

            id_paciente: number;

            id_dcnt: number;
          }>(`SELECT * FROM paciente_dcnt WHERE id_paciente = ?`, [pacienteId]);

          console.log(
            "Paciente_DCNT recuperado do banco local",

            pacienteDcntPersistido,
          );
        });

        showSuccess("Paciente cadastrado com sucesso!");
        limparCampos();
        setMostrarCadastro(false);
        setLoading(false);
      } catch (dbError) {
        console.log("Erro SQLite:", dbError);
        showError("Erro interno ao salvar dados.");
        setLoading(false);
      }
    } catch (err) {
      console.log(err);
      showError("Erro ao conectar ao servidor.");
      setLoading(false);
    }
  }

  useEffect(() => {
    async function carregarDados() {
      await carregarEscolaridades();
      await carregarDCNT();
    }

    carregarDados();
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      {mostrarCadastro ? (
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.boxTop}>
            <Text style={styles.text}>Cadastro de Paciente</Text>
          </View>
          <View style={styles.boxMid}>
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
            <View style={styles.boxInput}>
              <TextInput
                placeholder="Digite seu CPF"
                keyboardType="numeric"
                style={styles.input}
                value={cpf}
                maxLength={14}
                onChangeText={(text) => setCpf(formatCpf(text))}
              />
              <FontAwesome style={styles.icons} name="id-card-o" size={24} />
            </View>
            <View style={styles.boxInput}>
              <TextInput
                placeholder="Data de nascimento"
                value={dataNascimento}
                onChangeText={(text) => {
                  let formatted = text.replace(/\D/g, "");

                  if (formatted.length > 2) {
                    formatted =
                      formatted.slice(0, 2) + "/" + formatted.slice(2);
                  }

                  if (formatted.length > 5) {
                    formatted =
                      formatted.slice(0, 5) + "/" + formatted.slice(5);
                  }

                  setDataNascimento(formatted);
                }}
                keyboardType="numeric"
                maxLength={10}
                style={styles.input}
              />
              <FontAwesome5
                style={styles.icons}
                name="calendar-alt"
                size={24}
              />
            </View>
            <View style={styles.boxInput}>
              <Picker
                selectedValue={sexo}
                onValueChange={(itemValue) => setSexo(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Selecione o sexo" value="" />

                <Picker.Item label="Masculino" value="masculino" />

                <Picker.Item label="Feminino" value="feminino" />

                <Picker.Item label="Outro" value="outro" />
              </Picker>
              <FontAwesome style={styles.icons} name="intersex" size={24} />
            </View>

            <View style={styles.boxInput}>
              <Picker
                selectedValue={escolaridade}
                onValueChange={(itemValue) => setEscolaridade(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Escolaridade" value="" />

                {listaEscolaridade.map((item) => (
                  <Picker.Item
                    key={item.id}
                    label={item.tipo}
                    value={item.id}
                  />
                ))}
              </Picker>
              <Ionicons style={styles.icons} name="school" size={24} />
            </View>

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

            <View style={styles.boxBotton}>
              <TouchableOpacity
                style={[styles.button, styles.tertiaryButton]}
                onPress={() => {
                  limparCampos();
                  setMostrarCadastro(false);
                }}
              >
                <Text style={styles.tertiaryButtonText}>Voltar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.tertiaryButton]}
                onPress={cadastrarPaciente}
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
      ) : (
        <View>
          <Text style={styles.title}>Cognisus Mobile</Text>

          <Text style={styles.subtitle}>Aplicativo de triagem cognitiva</Text>

          <Pressable
            style={[styles.button, styles.secondaryButton]}
            onPress={() => router.push("/tests")}
          >
            <Text style={styles.secondaryButtonText}>Testes</Text>
          </Pressable>
          <Pressable
            style={[styles.button, styles.secondaryButton]}
            onPress={() => setMostrarCadastro(true)}
          >
            <Text style={styles.secondaryButtonText}>Cadastro de paciente</Text>
          </Pressable>
        </View>
      )}
      {/* --- MODAL DE SELEÇÃO DE MÚLTIPLAS DCNTs --- */}
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
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    padding: 24,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
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
  subtitle: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    marginTop: 12,
    marginBottom: 32,
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
  secondaryButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
  secondaryButtonText: {
    color: "#0F172A",
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
