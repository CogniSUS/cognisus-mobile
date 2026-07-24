import { getDB } from "@/database/database";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/providers/AuthProvider";
import {
  AntDesign,
  FontAwesome,
  FontAwesome5,
  Ionicons,
} from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

type PacienteBusca = {
  id: number;
  nome_completo: string;
  cpf: string;
  data_nascimento: string;
  sexo: "masculino" | "feminino" | "outro";
  escolaridade_nome: string | null;
  ultima_avaliacao: string | null;
};

export default function HomePage() {
  const { user } = useAuth();
  const params = useLocalSearchParams<{
    abrirCadastro?: string;
  }>();

  useEffect(() => {
    if (params.abrirCadastro === "true") {
      limparBuscaPaciente();
      limparCampos();
      setMostrarCadastro(true);

      router.setParams({
        abrirCadastro: undefined,
      });
    }
  }, [params.abrirCadastro]);

  const [mostrarCadastro, setMostrarCadastro] = useState(false);
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [sexo, setSexo] = useState("");
  const [escolaridade, setEscolaridade] = useState("");

  const [loading, setLoading] = useState(false);

  const [dcntsSelecionadas, setDcntsSelecionadas] = useState<number[]>([]);
  const [modalDcntVisivel, setModalDcntVisivel] = useState(false);

  const [listaEscolaridade, setListaEscolaridade] = useState<
    { id: number; tipo: string }[]
  >([]);
  const [listaDCNT, setListaDCNT] = useState<{ id: number; tipo: string }[]>(
    [],
  );

  const [cpfBusca, setCpfBusca] = useState("");
  const [buscandoPaciente, setBuscandoPaciente] = useState(false);
  const [pacienteEncontrado, setPacienteEncontrado] =
    useState<PacienteBusca | null>(null);
  const [pacienteNaoEncontrado, setPacienteNaoEncontrado] = useState(false);

  const { success: showSuccess, error: showError, info: showInfo } = useToast();

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const nomeProfissional = useMemo(() => {
    return user?.user_metadata?.nome_completo || user?.email || "Profissional";
  }, [user]);

  function formatCpf(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) {
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    }
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(
      6,
      9,
    )}-${digits.slice(9)}`;
  }

  function limparCampos() {
    setNome("");
    setCpf("");
    setDataNascimento("");
    setSexo("");
    setEscolaridade("");
    setDcntsSelecionadas([]);
  }

  function limparBuscaPaciente() {
    setCpfBusca("");
    setPacienteEncontrado(null);
    setPacienteNaoEncontrado(false);
  }

  function toggleDcnt(id: number) {
    setDcntsSelecionadas((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      return [...prev, id];
    });
  }

  function formatarDataBR(dataISO: string | null) {
    if (!dataISO) return "Nenhuma avaliação registrada";

    if (/^\d{4}-\d{2}-\d{2}$/.test(dataISO)) {
      const [ano, mes, dia] = dataISO.split("-");
      return `${dia}/${mes}/${ano}`;
    }

    const data = new Date(dataISO);
    if (Number.isNaN(data.getTime())) return "Nenhuma avaliação registrada";

    return data.toLocaleDateString("pt-BR");
  }

  function calcularIdade(dataISO: string) {
    let ano = 0;
    let mes = 0;
    let dia = 0;

    if (/^\d{4}-\d{2}-\d{2}$/.test(dataISO)) {
      const partes = dataISO.split("-");
      ano = Number(partes[0]);
      mes = Number(partes[1]) - 1;
      dia = Number(partes[2]);
    } else {
      const nascimento = new Date(dataISO);
      ano = nascimento.getFullYear();
      mes = nascimento.getMonth();
      dia = nascimento.getDate();
    }

    const hoje = new Date();
    let idade = hoje.getFullYear() - ano;

    if (
      hoje.getMonth() < mes ||
      (hoje.getMonth() === mes && hoje.getDate() < dia)
    ) {
      idade--;
    }

    return idade;
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

  async function buscarPacientePorCpf() {
    try {
      setBuscandoPaciente(true);
      setPacienteEncontrado(null);
      setPacienteNaoEncontrado(false);

      const cpfNumeros = cpfBusca.replace(/\D/g, "");

      if (!cpfNumeros) {
        return;
      }

      if (cpfNumeros.length !== 11) {
        return;
      }

      const db = await getDB();

      const paciente = await db.getFirstAsync<PacienteBusca>(
        `
        SELECT
          p.id,
          p.nome_completo,
          p.cpf,
          p.data_nascimento,
          p.sexo,
          e.tipo AS escolaridade_nome,
          (
            SELECT COALESCE(a.data_fim, a.data_inicio, a.created_at)
            FROM avaliacao_teste_meem a
            WHERE a.id_paciente = p.id
              AND a.deleted_at IS NULL
            ORDER BY datetime(COALESCE(a.data_fim, a.data_inicio, a.created_at)) DESC
            LIMIT 1
          ) AS ultima_avaliacao
        FROM paciente p
        LEFT JOIN escolaridade e ON e.id = p.escolaridade
        WHERE p.cpf = ?
          AND p.deleted_at IS NULL
        LIMIT 1
        `,
        [cpfNumeros],
      );

      if (!paciente) {
        setPacienteNaoEncontrado(true);
        return;
      }

      setPacienteEncontrado(paciente);
    } catch (error) {
      console.log(error);
      showError("Erro ao buscar paciente.");
    } finally {
      setBuscandoPaciente(false);
    }
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
        setCpfBusca(cpf);
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

  function iniciarRastreio() {
    if (!pacienteEncontrado) {
      showInfo("Selecione um paciente válido.");
      return;
    }

    router.push({
      pathname: "/tests/selection",
      params: {
        patientId: String(pacienteEncontrado.id),
        nome: pacienteEncontrado.nome_completo,
        cpf: pacienteEncontrado.cpf,
        dataNascimento: pacienteEncontrado.data_nascimento,
        sexo: pacienteEncontrado.sexo,
        escolaridade: pacienteEncontrado.escolaridade_nome ?? "",
      },
    });
  }

  useEffect(() => {
    async function carregarDados() {
      await carregarEscolaridades();
      await carregarDCNT();
    }

    carregarDados();
  }, []);

  useFocusEffect(
    useCallback(() => {
      setCpfBusca("");
      setPacienteEncontrado(null);
      setPacienteNaoEncontrado(false);
    }, []),
  );

  useEffect(() => {
    const cpfNumeros = cpfBusca.replace(/\D/g, "");

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!cpfNumeros) {
      setPacienteEncontrado(null);
      setPacienteNaoEncontrado(false);
      return;
    }

    if (cpfNumeros.length < 11) {
      setPacienteEncontrado(null);
      setPacienteNaoEncontrado(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      buscarPacientePorCpf();
    }, 350);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [cpfBusca]);

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
          <Text style={styles.greeting}>Olá, {nomeProfissional}</Text>

          {!pacienteEncontrado && (
            <Pressable
              onPress={() => {
                showInfo("Busque um paciente por CPF para iniciar o rastreio.");
              }}
            >
              <LinearGradient
                colors={["#B12CF7", "#9D22F0", "#8A18E8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.bannerButton}
              >
                <View>
                  <Text style={styles.bannerText}>INICIAR RASTREIO</Text>
                  <Text style={styles.bannerText}>COGNITIVO</Text>
                </View>

                <View style={styles.bannerCircle}>
                  <Ionicons name="add" size={28} color="#A21CAF" />
                </View>
              </LinearGradient>
            </Pressable>
          )}

          <Text style={styles.searchTitle}>Buscar Paciente por CPF</Text>

          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={20} color="#94A3B8" />
            <TextInput
              placeholder="Digite o CPF do paciente"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              style={styles.searchInput}
              value={cpfBusca}
              maxLength={14}
              onChangeText={(text) => setCpfBusca(formatCpf(text))}
            />
            {cpfBusca.length > 0 && (
              <Pressable onPress={limparBuscaPaciente}>
                <Ionicons name="close" size={20} color="#94A3B8" />
              </Pressable>
            )}
          </View>

          {buscandoPaciente && (
            <ActivityIndicator style={styles.searchLoading} color="#A21CAF" />
          )}

          {pacienteEncontrado && (
            <>
              <View style={styles.identityCard}>
                <View style={styles.header}>
                  <Text style={styles.identityTitle}>
                    CONFIRMAÇÃO DE IDENTIDADE
                  </Text>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() =>
                      router.push({
                        pathname: "/(app)/patients/edicao_paciente",
                        params: { id: pacienteEncontrado.id },
                      })
                    }
                  >
                    <FontAwesome name="pencil" size={24} color="#ffffff" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.identityText}>
                  <Text style={styles.identityLabel}>Nome:</Text>{" "}
                  {pacienteEncontrado.nome_completo}
                </Text>

                <Text style={styles.identityText}>
                  <Text style={styles.identityLabel}>CPF:</Text>{" "}
                  {formatCpf(pacienteEncontrado.cpf)}
                </Text>

                <Text style={styles.identityText}>
                  <Text style={styles.identityLabel}>Data de Nascimento:</Text>{" "}
                  {formatarDataBR(pacienteEncontrado.data_nascimento)}
                </Text>

                <Text style={styles.identityText}>
                  <Text style={styles.identityLabel}>Idade:</Text>{" "}
                  {calcularIdade(pacienteEncontrado.data_nascimento)} anos
                </Text>

                <Text style={styles.identityText}>
                  <Text style={styles.identityLabel}>Escolaridade:</Text>{" "}
                  {pacienteEncontrado.escolaridade_nome ?? "Não informada"}
                </Text>

                <View style={styles.divider} />

                <Text style={styles.identityTitle}>HISTÓRICO</Text>

                <Text style={styles.identityText}>
                  <Text style={styles.identityLabel}>
                    Data da última avaliação:
                  </Text>{" "}
                  {formatarDataBR(pacienteEncontrado.ultima_avaliacao)}
                </Text>
              </View>

              <Pressable onPress={iniciarRastreio}>
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

              <Pressable onPress={limparBuscaPaciente}>
                <Text style={styles.cancelText}>Voltar / Cancelar</Text>
              </Pressable>
            </>
          )}

          {pacienteNaoEncontrado && (
            <View style={styles.notFoundCard}>
              <Text style={styles.notFoundText}>Paciente não encontrado</Text>

              <Pressable
                onPress={() => {
                  limparBuscaPaciente();
                  setMostrarCadastro(true);
                }}
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
          )}
        </View>
      )}

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
  greeting: {
    fontSize: 18,
    fontWeight: "600",
    color: "#42526B",
    marginBottom: 18,
    marginTop: 6,
  },

  bannerButton: {
    marginBottom: 24,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#A020F0",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },

  bannerText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 22,
  },

  bannerCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
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
  },

  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
  },

  identityCard: {
    marginTop: 18,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E6E1F0",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  identityTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1F2A44",
    marginBottom: 12,
    flex: 1,
    flexWrap: "wrap",
  },

  identityText: {
    fontSize: 15,
    color: "#445066",
    marginBottom: 8,
    lineHeight: 22,
  },

  identityLabel: {
    fontWeight: "800",
    color: "#1F2A44",
  },

  divider: {
    height: 1,
    backgroundColor: "#E6E6EF",
    marginVertical: 14,
  },

  startButton: {
    marginTop: 20,
    borderRadius: 16,
    minHeight: 56,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#A020F0",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },

  startButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },

  cancelText: {
    marginTop: 16,
    textAlign: "center",
    color: "#6C63FF",
    fontSize: 15,
    fontWeight: "600",
  },

  notFoundCard: {
    marginTop: 18,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E9D5FF",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },

  notFoundText: {
    fontSize: 15,
    color: "#5B657C",
    marginBottom: 14,
  },

  notFoundButton: {
    borderRadius: 12,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },

  notFoundButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  searchLoading: {
    marginTop: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  editButton: {
    backgroundColor: "#c41616",
    width: 50,
    height: 50,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  editButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});
