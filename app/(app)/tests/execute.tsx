import { TestHeader } from "@/components/ui/test-header";
import { meemSteps } from "@/constants/meem";
import { getDB } from "@/database/database";
import { useAuth } from "@/providers/AuthProvider";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ExecuteTest() {
  const { user } = useAuth();

  const params = useLocalSearchParams<{
    patientId: string;
    instrumentId: string;
    unidadeId: string;
  }>();

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const [patientName, setPatientName] = useState("");
  const [instrumentName, setInstrumentName] = useState("");
  const [loadingDados, setLoadingDados] = useState(true);

  const step = meemSteps[currentStep];

  useEffect(() => {
    async function carregarContextoDoTeste() {
      try {
        setLoadingDados(true);
        const db = await getDB();

        const paciente = await db.getFirstAsync<{ nome_completo: string }>(
          "SELECT nome_completo FROM paciente WHERE id = ? LIMIT 1",
          [Number(params.patientId)],
        );

        const instrumento = await db.getFirstAsync<{ nome: string }>(
          "SELECT nome FROM instrumento_avaliacao WHERE id = ? LIMIT 1",
          [Number(params.instrumentId)],
        );

        if (paciente) setPatientName(paciente.nome_completo);
        if (instrumento) setInstrumentName(instrumento.nome);
      } catch (error) {
        console.error("Erro ao buscar dados do teste no SQLite:", error);
      } finally {
        setLoadingDados(false);
      }
    }

    if (params.patientId && params.instrumentId) {
      carregarContextoDoTeste();
    }
  }, [params.patientId, params.instrumentId]);

  const handleNext = () => {
    if (currentStep < meemSteps.length - 1) setCurrentStep((prev) => prev + 1);
    else finalizar();
  };

  const handlePrevious = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  };

  const finalizar = () => {
    console.log("Test finished. Answers:", answers);
  };

  if (loadingDados) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9D22F0" />
        <Text style={styles.loadingText}>Preparando o teste...</Text>
      </View>
    );
  }

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === meemSteps.length - 1;

  return (
    <View style={styles.container}>
      <TestHeader
        patientName={patientName}
        instrumentName={instrumentName}
        currentStep={currentStep + 1}
        totalSteps={meemSteps.length}
      />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentArea}>
          <Text style={styles.stepTitle}>{step.title}</Text>

          <View></View>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.btnOutline, isFirstStep && styles.btnOutlineDisabled]}
          onPress={handlePrevious}
          disabled={isFirstStep}
          activeOpacity={0.7}
        >
          <Feather
            name="chevron-left"
            size={20}
            color={isFirstStep ? "#D1D5DB" : "#A824EE"}
          />
          <Text
            style={[styles.btnOutlineText, isFirstStep && styles.textDisabled]}
          >
            Anterior
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnSolid}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.btnSolidText}>
            {isLastStep ? "Finalizar" : "Próxima"}
          </Text>
          <Feather
            name={isLastStep ? "check" : "chevron-right"}
            size={20}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F2F8",
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F2F8",
  },
  loadingText: {
    marginTop: 12,
    color: "#6B7280",
    fontSize: 16,
  },
  contentArea: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 24,
    gap: 12,
  },
  btnOutline: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#A824EE",
    borderRadius: 16,
    paddingVertical: 16,
  },
  btnSolid: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#9D22F0",
    borderRadius: 16,
    paddingVertical: 16,
  },
  btnOutlineText: {
    color: "#A824EE",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  btnSolidText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  btnOutlineDisabled: {
    borderColor: "#D1D5DB",
    backgroundColor: "#F9FAFB",
  },
  textDisabled: {
    color: "#D1D5DB",
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 16,
  },
});
