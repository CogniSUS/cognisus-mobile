/**
 * Tela de seleção de teste cognitivo
 * - Exibe dados do paciente mockado
 * - Lista instrumentos de avaliação do SQLite
 * - Modal de confirmação ao selecionar teste
 * - Botão "Voltar ao Início" que navega para "/"
 *
 * Fluxo:
 * 1. Carregar instrumentos do SQLite ao montar
 * 2. Exibir lista de instrumentos
 * 3. Ao clicar em um instrumento, exibir modal
 * 4. Ao confirmar, navegar ou fechar modal
 * 5. Ao clicar "Voltar", retornar para home
 */
import { InstrumentItem } from "@/components/ui/instrument-item";
import { PatientCard } from "@/components/ui/patient-card";
import { TestConfirmationModal } from "@/components/ui/test-confirmation-modal";
import { getAllInstruments } from "@/database/repositories/instrumentRepository";
import { Instrument } from "@/types/instrument";
import { Patient } from "@/types/patient";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
export default function TestSelectionPage() {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInstrument, setSelectedInstrument] =
    useState<Instrument | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const mockPatient: Patient = {
    id: 1,
    nome_completo: "João da Silva Neto",
    cpf: "123.456.789-10",
    data_nascimento: "1958-05-21", // 66 anos
    sexo: "masculino",
    escolaridade: 4,
  };

  // Carregar instrumentos do SQLite ao focar na tela
  useFocusEffect(
    useCallback(() => {
      loadInstruments();
    }, []),
  );
  async function loadInstruments() {
    try {
      setLoading(true);
      const data = await getAllInstruments();
      setInstruments(data);
    } catch (error) {
      console.error("Erro ao carregar instrumentos:", error);
    } finally {
      setLoading(false);
    }
  }
  function handleSelectInstrument(instrument: Instrument) {
    setSelectedInstrument(instrument);
    setShowConfirmation(true);
  }
  async function handleConfirm() {
    // Por enquanto, apenas fechar o modal
    // Futuramente: navegar para tela de execução do teste
    setIsConfirming(true);

    // Simular pequeno delay
    setTimeout(() => {
      setShowConfirmation(false);
      setSelectedInstrument(null);
      setIsConfirming(false);

      // Toast de sucesso (se tiver useToast disponível)
      // showSuccess("Teste iniciado!");
    }, 500);
  }
  function handleCancel() {
    setShowConfirmation(false);
    setSelectedInstrument(null);
  }
  function handleBackToHome() {
    router.push("/");
  }
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Patient Card */}
        <PatientCard patient={mockPatient} />
        {/* Título da Seção */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Selecione o Teste Cognitivo</Text>
          <Text style={styles.subtitle}>
            Escolha um ou mais testes para aplicar
          </Text>
        </View>
        {/* Lista de Instrumentos */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Carregando instrumentos...</Text>
          </View>
        ) : instruments.length > 0 ? (
          <View style={styles.instrumentsList}>
            {instruments.map((instrument, index) => (
              <InstrumentItem
                key={instrument.id}
                instrument={instrument}
                index={index}
                onPress={handleSelectInstrument}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Nenhum instrumento disponível no momento.
            </Text>
          </View>
        )}
        {/* Botão Voltar */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.outlineButton}
            onPress={handleBackToHome}
            activeOpacity={0.7}
          >
            <Text style={styles.outlineButtonText}>Voltar ao Início</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      {/* Modal de Confirmação */}
      {selectedInstrument && (
        <TestConfirmationModal
          visible={showConfirmation}
          patient={mockPatient}
          instrument={selectedInstrument}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          isLoading={isConfirming}
        />
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F4FA",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: 12,
    paddingBottom: 20,
  },
  titleSection: {
    marginHorizontal: 16,
    marginVertical: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  instrumentsList: {
    gap: 0,
  },
  loadingContainer: {
    paddingVertical: 32,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 14,
    color: "#64748B",
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: "center",
    marginHorizontal: 16,
  },
  emptyText: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
  },
  buttonContainer: {
    marginHorizontal: 16,
    marginVertical: 16,
  },
  outlineButton: {
    borderWidth: 1.5,
    borderColor: "#A824EE", // Ajuste para o HEX exato do roxo do seu design (ex: #9333EA)
    backgroundColor: "transparent",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  outlineButtonText: {
    color: "#A824EE", // Deve ser a mesma cor da borda
    fontSize: 14,
    fontWeight: "500",
  },
});
