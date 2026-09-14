import { InstrumentItem } from "@/components/ui/instrument-item";
import { PatientCard } from "@/components/ui/patient-card";
import { InstrumentoAvaliacaoRepository } from "@/database/repositories/InstrumentoAvaliacaoRepository";
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

export default function TestSelectInstrumentPage() {
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

  function normalizeSexo(value?: string): SexoPaciente {
    if (value === "masculino" || value === "feminino" || value === "outro") {
      return value;
    }

    return "outro";
  }

  const selectedPatient = useMemo<Patient>(() => {
    return {
      id: params.patientId || "",
      nome_completo: params.nome || "Paciente não informado",
      cpf: params.cpf || "",
      data_nascimento: params.dataNascimento || "",
      sexo: normalizeSexo(params.sexo),
      escolaridade: params.escolaridade || "",
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
      const data = await InstrumentoAvaliacaoRepository.listarAtivos();
      setInstruments(data);
    } catch (error) {
      console.error("Erro ao carregar instrumentos:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleSelectInstrument(instrument: Instrument) {
    // Redireciona diretamente para a seleção de unidade
    router.push({
      pathname: "/tests/select-unit",
      params: {
        patientId: String(selectedPatient.id),
        nome: selectedPatient.nome_completo,
        cpf: selectedPatient.cpf,
        dataNascimento: selectedPatient.data_nascimento,
        sexo: selectedPatient.sexo,
        escolaridade: String(selectedPatient.escolaridade),
        instrumentId: String(instrument.id),
        instrumentNome: instrument.nome,
      },
    });
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
  outlineButtonText: { color: "#A824EE", fontSize: 14, fontWeight: "500" },
});
