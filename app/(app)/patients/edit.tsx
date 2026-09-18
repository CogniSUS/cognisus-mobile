import { database } from "@/database/database";
import { useToast } from "@/hooks/useToast";
import { capitalizarNome } from "@/utils/formatters";
import {
  AntDesign,
  Feather,
  FontAwesome,
  FontAwesome5,
  Ionicons,
} from "@expo/vector-icons";
import { Q } from "@nozbe/watermelondb";
import { Picker } from "@react-native-picker/picker";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
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

export default function PatientEditPage() {
  const { success: showSuccess, error: showError } = useToast();
  const { id } = useLocalSearchParams();
  // Os IDs no WatermelonDB são strings (UUID)
  const pacienteId = String(id);

  const [nome, setNome] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [sexo, setSexo] = useState("");
  const [escolaridade, setEscolaridade] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [dcntsSelecionadas, setDcntsSelecionadas] = useState<string[]>([]);
  const [listaEscolaridade, setListaEscolaridade] = useState<
    { id: string; tipo: string }[]
  >([]);
  const [listaDCNT, setListaDCNT] = useState<{ id: string; tipo: string }[]>(
    [],
  );

  const toggleDcnt = (dcntId: string, dcntTipo: string) => {
    const exclusivas = ["Nenhuma dessas condições", "Não sei informar"];
    const isSelecionadaExclusiva = exclusivas.includes(dcntTipo);

    setDcntsSelecionadas((prev) => {
      // 1. Se clicou em "Nenhuma" ou "Não sei", limpa o resto e marca apenas ela.
      if (isSelecionadaExclusiva) {
        return prev.includes(dcntId) ? [] : [dcntId];
      }

      // 2. Se clicou em uma doença normal, remove as opções exclusivas (se estiverem marcadas)
      const prevSemExclusivas = prev.filter((id) => {
        const dcnt = listaDCNT.find((d) => d.id === id);
        return dcnt ? !exclusivas.includes(dcnt.tipo) : true;
      });

      // 3. Faz o toggle normal da doença
      if (prevSemExclusivas.includes(dcntId)) {
        return prevSemExclusivas.filter((id) => id !== dcntId);
      } else {
        return [...prevSemExclusivas, dcntId];
      }
    });
  };

  async function carregarListasBase() {
    try {
      const escolaridadeCollection = database.collections.get("escolaridade");
      const dcntCollection = database.collections.get("dcnt");

      const [escolaridades, dcnts] = await Promise.all([
        escolaridadeCollection.query().fetch(),
        dcntCollection.query().fetch(),
      ]);

      const escolaridadesMapeadas = escolaridades.map((e: any) => ({
        id: e.id,
        tipo: e.tipo,
      }));

      escolaridadesMapeadas.sort((a, b) => {
        if (a.tipo.toLowerCase().includes("analfabeto")) return -1;
        if (b.tipo.toLowerCase().includes("analfabeto")) return 1;
        return 0;
      });

      setListaEscolaridade(escolaridadesMapeadas);
      setListaDCNT(dcnts.map((d: any) => ({ id: d.id, tipo: d.tipo })));
    } catch (error) {
      console.error("Erro ao carregar listas base:", error);
    }
  }

  async function carregarPaciente() {
    try {
      const pacienteCollection = database.collections.get("paciente");
      const paciente = (await pacienteCollection.find(pacienteId)) as any;

      setNome(paciente.nomeCompleto);
      const [ano, mes, dia] = paciente.dataNascimento.split("-");
      setDataNascimento(`${dia}/${mes}/${ano}`);
      setSexo(paciente.sexo);

      if (paciente.nivelEscolaridade) {
        setEscolaridade(paciente.nivelEscolaridade.id);
      }

      const relacoesCollection = database.collections.get("paciente_dcnt");
      const dcntsDoPaciente = await relacoesCollection
        .query(Q.where("id_paciente", pacienteId))
        .fetch();

      setDcntsSelecionadas(dcntsDoPaciente.map((rel: any) => rel.dcnt.id));
    } catch (error) {
      console.error("Erro ao carregar paciente:", error);
      showError("Não foi possível carregar os dados do paciente.");
    }
  }

  async function getEditarPaciente() {
    try {
      setLoading(true);
      if (!nome || !dataNascimento || sexo === "" || escolaridade === null) {
        setLoading(false);
        showError("Preencha os campos obrigatórios");
        return;
      }

      const partesData = dataNascimento.split("/");

      if (partesData.length !== 3) {
        setLoading(false);
        showError("Data inválida");
        return;
      }

      const dia = partesData[0];
      const mes = partesData[1];
      const ano = partesData[2];

      if (dia.length !== 2 || mes.length !== 2 || ano.length !== 4) {
        setLoading(false);
        showError("Data inválida");
        return;
      }

      const dataFormatada = `${ano}-${mes}-${dia}`;

      if (Number(dia) > 31 || Number(mes) > 12) {
        setLoading(false);
        showError("Data inválida");
        return;
      }

      await database.write(async () => {
        const pacienteCollection = database.collections.get("paciente");
        const relacoesCollection = database.collections.get("paciente_dcnt");

        const paciente = (await pacienteCollection.find(pacienteId)) as any;
        await paciente.update((p: any) => {
          p.nomeCompleto = nome;
          p.dataNascimento = dataFormatada;
          p.sexo = sexo;
          p.nivelEscolaridade.id = escolaridade;
        });

        const relacoesAntigas = await relacoesCollection
          .query(Q.where("id_paciente", pacienteId))
          .fetch();

        for (const relacao of relacoesAntigas) {
          await relacao.markAsDeleted();
        }

        for (const dcntId of dcntsSelecionadas) {
          await relacoesCollection.create((pd: any) => {
            pd.paciente.id = pacienteId;
            pd.dcnt.id = dcntId;
          });
        }
      });

      showSuccess("Paciente atualizado com sucesso!");
      router.back();
    } catch (error) {
      console.log(error);
      showError("Erro ao atualizar o paciente.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function carregarDados() {
      await carregarListasBase();
      await carregarPaciente();
    }

    carregarDados();
  }, []);

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
          <Text style={styles.textTitle}>Editar Paciente</Text>
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
            >
              <Picker.Item
                label="Selecione o sexo"
                value=""
                enabled={false}
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
            >
              <Picker.Item
                label="Escolaridade"
                value={null}
                enabled={false}
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

          {/* SEÇÃO DE CONDIÇÕES DE SAÚDE (DCNT) */}
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
              onPress={getEditarPaciente}
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
