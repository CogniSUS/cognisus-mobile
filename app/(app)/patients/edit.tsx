import { database } from "@/database/database";
import { useToast } from "@/hooks/useToast";
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
  FlatList,
  Modal,
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

  // Estados de DCNT atualizados para suportar string IDs
  const [dcntsSelecionadas, setDcntsSelecionadas] = useState<string[]>([]);
  const [modalDcntVisivel, setModalDcntVisivel] = useState(false);

  const [listaEscolaridade, setListaEscolaridade] = useState<
    { id: string; tipo: string }[]
  >([]);

  const [listaDCNT, setListaDCNT] = useState<{ id: string; tipo: string }[]>(
    [],
  );

  const toggleDcnt = (dcntId: string) => {
    setDcntsSelecionadas((prev) =>
      prev.includes(dcntId)
        ? prev.filter((item) => item !== dcntId)
        : [...prev, dcntId],
    );
  };

  async function carregarListasBase() {
    try {
      const escolaridadeCollection = database.collections.get("escolaridade");
      const dcntCollection = database.collections.get("dcnt");

      const [escolaridades, dcnts] = await Promise.all([
        escolaridadeCollection.query().fetch(),
        dcntCollection.query().fetch(),
      ]);

      setListaEscolaridade(
        escolaridades.map((e: any) => ({ id: e.id, tipo: e.tipo })),
      );

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

      // Resgata o ID da escolaridade se houver vínculo
      if (paciente.nivelEscolaridade) {
        setEscolaridade(paciente.nivelEscolaridade.id);
      }

      const relacoesCollection = database.collections.get("paciente_dcnt");
      const dcntsDoPaciente = await relacoesCollection
        .query(Q.where("id_paciente", pacienteId))
        .fetch();

      // Mapeia os IDs das DCNTs já vinculadas via propriedade de relacionamento
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

      // Toda mutação no banco precisa ocorrer dentro de um database.write()
      await database.write(async () => {
        const pacienteCollection = database.collections.get("paciente");
        const relacoesCollection = database.collections.get("paciente_dcnt");

        // 1. Atualiza os dados principais do paciente
        const paciente = (await pacienteCollection.find(pacienteId)) as any;
        await paciente.update((p: any) => {
          p.nomeCompleto = nome;
          p.dataNascimento = dataFormatada;
          p.sexo = sexo;
          p.nivelEscolaridade.id = escolaridade;
        });

        // 2. Limpa as DCNTs antigas (Soft Delete para sincronizar com Supabase)
        const relacoesAntigas = await relacoesCollection
          .query(Q.where("id_paciente", pacienteId))
          .fetch();

        for (const relacao of relacoesAntigas) {
          await relacao.markAsDeleted();
        }

        // 3. Insere as novas DCNTs selecionadas
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
            <Picker.Item label="Masculino" value="masculino" color="#0f0f0f" />
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
                label={item.tipo}
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
              keyExtractor={(item) => item.id}
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
  );
}

// Estilos inalterados
const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: "#F8FAFC", padding: 24 },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 30 },
  textTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0f0f0f",
    marginLeft: 16,
  },
  boxMid: { width: "100%" },
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
  picker: { flex: 1, marginLeft: 4 },
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
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#732cad",
  },
  tertiaryButton: { flex: 1, backgroundColor: "#732cad" },
  cancelButtonText: { fontSize: 16, fontWeight: "700", color: "#732cad" },
  tertiaryButtonText: { fontSize: 16, fontWeight: "700", color: "#ffffff" },
  primaryButton: { backgroundColor: "#2563EB" },
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
  checkboxLabel: { marginLeft: 12, fontSize: 16, color: "#334155" },
  checkboxLabelSelected: { color: "#2563EB", fontWeight: "600" },
});
