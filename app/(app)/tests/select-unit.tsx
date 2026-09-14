// app/tests/select-unit.tsx
import { database } from "@/database/database";
import { useToast } from "@/hooks/useToast";
import { capitalizarNome } from "@/utils/formatters";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function TestSelectUnitPage() {
  const { error: showError, info: showInfo } = useToast();

  const params = useLocalSearchParams<{
    patientId?: string;
    nome?: string;
    cpf?: string;
    dataNascimento?: string;
    sexo?: string;
    escolaridade?: string;
    instrumentId?: string;
    instrumentNome?: string;
  }>();

  const [unidadeSaude, setUnidadeSaude] = useState<string>("");
  const [listaUnidades, setListaUnidades] = useState<
    { id: string; nome: string }[]
  >([]);

  function prosseguirParaTeste() {
    if (unidadeSaude === "") {
      return showError("Informe a unidade para prosseguir!");
    }

    showInfo(
      `Teste "${params.instrumentNome || "selecionado"}" confirmado para ${params.nome || "o paciente"}.`,
    );

    // Usa push normalmente para empilhar a rota de execução
    router.push({
      pathname: "/tests/execute",
      params: {
        unidadeId: unidadeSaude,
        patientId: params.patientId,
        instrumentId: params.instrumentId,
      },
    });
  }

  function fecharModal() {
    // router.back() fechará a tela "transparente", revelando a tela anterior sem recarregá-la
    router.back();
  }

  async function carregarUnidade() {
    try {
      const unidadesCollection = database.collections.get("unidade_saude");
      const unidades = await unidadesCollection.query().fetch();

      const dados = unidades.map((u) => ({
        id: u.id,
        // Aplica a formatação aqui
        nome: capitalizarNome((u as any).nome),
      }));

      setListaUnidades(dados);
    } catch (error) {
      console.log("Erro ao carregar unidades:", error);
    }
  }

  useEffect(() => {
    carregarUnidade();
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.overlay}
    >
      {/* Área clicável escura para fechar o modal/voltar */}
      <Pressable style={styles.backdrop} onPress={fecharModal} />

      {/* Bottom Sheet Branco */}
      <View style={styles.sheet}>
        <View style={styles.header}>
          <Text style={styles.title}>Selecione a Unidade de Saúde</Text>
          <TouchableOpacity
            onPress={fecharModal}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <Ionicons name="close" size={24} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>
          Em qual unidade este teste está sendo aplicado?
        </Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        >
          {listaUnidades.map((item) => {
            const isSelected = unidadeSaude === item.id;

            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.unitCard, isSelected && styles.unitCardSelected]}
                onPress={() => setUnidadeSaude(item.id)}
                activeOpacity={0.7}
              >
                <View style={styles.unitCardContent}>
                  <Ionicons
                    name="business-outline"
                    size={20}
                    color={isSelected ? "#A824EE" : "#9CA3AF"}
                  />
                  <Text
                    style={[
                      styles.unitCardText,
                      isSelected && styles.unitCardTextSelected,
                    ]}
                  >
                    {item.nome}
                  </Text>
                </View>

                {isSelected && (
                  <Ionicons name="checkmark" size={24} color="#A824EE" />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <TouchableOpacity
          style={[styles.primaryButton, !unidadeSaude && styles.buttonDisabled]}
          onPress={prosseguirParaTeste}
          disabled={!unidadeSaude}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Iniciar Teste</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    maxHeight: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  subtitle: {
    fontSize: 14,
    color: "#42526B",
    marginBottom: 20,
  },
  listContainer: {
    gap: 12,
    paddingBottom: 16,
  },
  unitCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E6E1F0",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 60,
    marginBottom: 12, // fallback se gap não for suportado em versões muito antigas
  },
  unitCardSelected: {
    borderColor: "#A824EE",
    backgroundColor: "#F8F6FC",
  },
  unitCardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  unitCardText: {
    fontSize: 16,
    color: "#1F2937",
    marginLeft: 12,
  },
  unitCardTextSelected: {
    color: "#A824EE",
    fontWeight: "600",
  },
  primaryButton: {
    height: 56,
    backgroundColor: "#A824EE",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
