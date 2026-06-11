import { InstrumentItem } from "@/components/ui/instrument-item";
import { PatientCard } from "@/components/ui/patient-card";
import { TestConfirmationModal } from "@/components/ui/test-confirmation-modal";
import { getAllInstruments } from "@/database/repositories/instrumentRepository";
import { Instrument } from "@/types/instrument";
import { Patient } from "@/types/patient";
import { useFocusEffect } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type SexoPaciente = "masculino" | "feminino" | "outro";

export default function TestSelectionPage() {
  const params = useLocalSearchParams<{
    patientId?: string;
    nome?: string;
    cpf?: string;
    dataNascimento?: string;
    sexo?: string;
    escolaridade?: string;
  }>();

  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInstrument, setSelectedInstrument] =
    useState<Instrument | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  function normalizeSexo(value?: string): SexoPaciente {
    if (value === "masculino" || value === "feminino" || value === "outro") {
      return value;
    }

    return "outro";
  }

  const selectedPatient = useMemo<Patient>(() => {
    return {
      id: Number(params.patientId || 0),
      nome_completo: params.nome || "Paciente não informado",
      cpf: params.cpf || "",
      data_nascimento: params.dataNascimento || "",
      sexo: normalizeSexo(params.sexo),
      escolaridade: Number(params.escolaridade || 0),
    };
  }, [params]);

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
    if (!selectedInstrument) return;

    setIsConfirming(true);

    router.push({
      pathname: "/tests/selecao_unidade",
      params: {
        patientId: String(selectedPatient.id),
        nome: selectedPatient.nome_completo,
        cpf: selectedPatient.cpf,
        dataNascimento: selectedPatient.data_nascimento,
        sexo: selectedPatient.sexo,
        escolaridade: String(selectedPatient.escolaridade),
        instrumentId: String(selectedInstrument.id),
        instrumentNome: selectedInstrument.nome,
      },
    });

    setShowConfirmation(false);
    setSelectedInstrument(null);
    setIsConfirming(false);
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
        <PatientCard patient={selectedPatient} />

        <View style={styles.titleSection}>
          <Text style={styles.title}>Selecione o Teste Cognitivo</Text>
          <Text style={styles.subtitle}>
            Escolha um ou mais testes para aplicar
          </Text>
        </View>

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

      {selectedInstrument && (
        <TestConfirmationModal
          visible={showConfirmation}
          patient={selectedPatient}
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
    borderColor: "#A824EE",
    backgroundColor: "transparent",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  outlineButtonText: {
    color: "#A824EE",
    fontSize: 14,
    fontWeight: "500",
  },
});
