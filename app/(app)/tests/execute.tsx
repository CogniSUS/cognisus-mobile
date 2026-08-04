import { QuestionCard } from "@/components/ui/question-card";
import { TestHeader } from "@/components/ui/test-header";
import { TestInstruction } from "@/components/ui/test-instruction";
import { TimerCard } from "@/components/ui/time-card";
import { meemSteps } from "@/constants/meem";
import { getDB } from "@/database/database";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/providers/AuthProvider";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function TestExecutePage() {
  const { user } = useAuth();
  const router = useRouter();
  const { info: showInfo, success: showSuccess, error: showError } = useToast();

  const params = useLocalSearchParams<{
    patientId: string;
    instrumentId: string;
    unidadeId: string;
  }>();

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const [patientName, setPatientName] = useState("");
  const [patientEscolaridade, setPatientEscolaridade] = useState("");
  const [instrumentName, setInstrumentName] = useState("");
  const [loadingDados, setLoadingDados] = useState(true);

  const [dataInicio] = useState(() => new Date().toISOString());

  const step = meemSteps[currentStep];

  useEffect(() => {
    async function carregarContextoDoTeste() {
      try {
        setLoadingDados(true);
        const db = await getDB();

        // 1. Buscamos nome_completo e escolaridade da tabela paciente
        const paciente = await db.getFirstAsync<{
          nome_completo: string;
          escolaridade: string;
        }>(
          `SELECT p.nome_completo, e.tipo as escolaridade 
          FROM paciente p
          LEFT JOIN escolaridade e ON p.escolaridade = e.id 
          WHERE p.id = ? LIMIT 1`,
          [Number(params.patientId)],
        );

        const instrumento = await db.getFirstAsync<{ nome: string }>(
          "SELECT nome FROM instrumento_avaliacao WHERE id = ? LIMIT 1",
          [Number(params.instrumentId)],
        );

        if (paciente) {
          setPatientName(paciente.nome_completo);
          setPatientEscolaridade(paciente.escolaridade || "Analfabeto");
        }
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

  const handleAnswer = (questionId: string, value: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleNext = () => {
    const perguntasDaEtapa = step.questions || [];

    const temPerguntaSemResposta = perguntasDaEtapa.some(
      (pergunta) => answers[pergunta.id] === undefined,
    );

    if (temPerguntaSemResposta) {
      showInfo(
        "Por favor, responda todas as perguntas desta etapa antes de avançar.",
      );
      return;
    }

    if (currentStep < meemSteps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      finalizar();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  };

  const obterClassificacao = (
    scoreTotal: number,
    escolaridade: string,
  ): string => {
    const esc = escolaridade.toLowerCase().trim();
    let notaCorte = 20; // Default (analfabeto)

    switch (esc) {
      case "analfabeto":
        notaCorte = 20;
        break;
      case "ensino fundamental incompleto":
        notaCorte = 25;
        break;
      case "ensino fundamental completo":
        notaCorte = 26.5;
        break;
      case "ensino médio":
        notaCorte = 28;
        break;
      case "ensino superior":
        notaCorte = 29;
        break;
      default:
        notaCorte = 20;
    }

    return scoreTotal >= notaCorte ? "Normal" : "Possível Déficit Cognitivo";
  };

  const finalizar = async () => {
    try {
      setLoadingDados(true);

      const db = await getDB();

      // 1. Inicializamos os scores por domínios
      const scores = {
        orientacao_temporal: 0,
        orientacao_espacial: 0,
        memoria_imediata: 0,
        atencao: 0,
        memoria_recente: 0,
        linguagem: 0,
        visuoespacial: 0,
        total: 0,
      };

      // 2. Extraímos todas as perguntas mapeadas no meemSteps
      const todasAsPerguntas = meemSteps.flatMap((s) => s.questions || []);

      // 3. Calculamos as pontuações correspondentes a cada domínio
      Object.entries(answers).forEach(([perguntaId, pontuacao]) => {
        const pergunta = todasAsPerguntas.find((p) => p.id === perguntaId);
        if (pergunta) {
          const dominio = pergunta.dominio as keyof typeof scores;
          scores[dominio] += pontuacao;
          scores.total += pontuacao;
        }
      });

      // 4. Obtemos a classificação com base na escolaridade gravada
      const classificacaoFinal = obterClassificacao(
        scores.total,
        patientEscolaridade,
      );
      const agora = new Date().toISOString();

      // 5. Executamos o INSERT com todas as colunas exigidas pelo seu banco local
      const resultadoInsert = await db.runAsync(
        `INSERT INTO avaliacao_teste_meem (
          created_at,
          update_at,
          deleted_at,
          sync_status,
          sync_error,
          id_paciente,
          id_profissional,
          id_instrumento,
          unidade_saude,
          data_inicio,
          data_fim,
          score_orientacao_espacial,
          score_atencao,
          score_linguagem,
          score_visuoespacial,
          score_memoria_recente,
          score_memoria_imediata,
          score_total,
          classificacao,
          score_orientacao_temporal
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          agora, // created_at
          null, // update_at
          null, // deleted_at
          "pending", // sync_status
          null, // sync_error
          Number(params.patientId), // id_paciente
          user!.id, // id_profissional
          Number(params.instrumentId), // id_instrumento
          Number(params.unidadeId), // unidade_saude
          dataInicio, // data_inicio
          agora, // data_fim
          scores.orientacao_espacial, // score_orientacao_espacial
          scores.atencao, // score_atencao
          scores.linguagem, // score_linguagem
          scores.visuoespacial, // score_visuoespacial
          scores.memoria_recente, // score_memoria_recente
          scores.memoria_imediata, // score_memoria_imediata
          scores.total, // score_total
          classificacaoFinal, // classificacao
          scores.orientacao_temporal, // score_orientacao_temporal
        ],
      );

      // 6. Alerta de sucesso e redirecionamento de tela
      showSuccess("Teste finalizado e salvo com sucesso!");
      router.push({
        pathname: "/(app)/results/[id]",
        params: {
          id: String(resultadoInsert.lastInsertRowId),
        },
      });
    } catch (error) {
      console.error("Erro ao persistir avaliação no SQLite:", error);
      showError("Não foi possível salvar o resultado do teste localmente.");
    } finally {
      setLoadingDados(false);
    }
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
          <TestInstruction
            instruction={step.instruction}
            isIntro={step.isIntro}
          />

          {step.hasTimer && (
            <TimerCard amountOfTime={step.amountOfTime || 60} />
          )}

          {step.questions?.map((pergunta) => (
            <QuestionCard
              key={pergunta.id}
              question={pergunta}
              currentValue={answers[pergunta.id]}
              onAnswer={handleAnswer}
            />
          ))}
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
