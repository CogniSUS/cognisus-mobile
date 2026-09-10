import { QuestionCard } from "@/components/ui/question-card";
import { TestAbandonModal } from "@/components/ui/test-abandon-modal";
import { TestHeader } from "@/components/ui/test-header";
import { TestInstruction } from "@/components/ui/test-instruction";
import { TimerCard } from "@/components/ui/time-card";
import { meemSteps } from "@/constants/meem";
import { database } from "@/database/database";
import { AvaliacaoTesteMeem } from "@/database/models/AvaliacaoTesteMeem";
import { Paciente } from "@/database/models/Paciente";
import { useProtectTestNavigation } from "@/hooks/useProtectTestNavigation";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/providers/AuthProvider";
import { useTestProtection } from "@/providers/TestProtectionProvider";
import { Feather } from "@expo/vector-icons";
import { Q } from "@nozbe/watermelondb";
import type { Href } from "expo-router";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { InstrumentoAvaliacao } from "../../../database/models/InstrumentoAvaliacao";

export default function TestExecutePage() {
  const CLASSIFICAO_NORMAL = "Normal";
  const CLASSIFICAO_DEFICIT = "Possível Déficit Cognitivo";
  const { user } = useAuth();
  const router = useRouter();
  const navigation = useNavigation();
  const { info: showInfo, success: showSuccess, error: showError } = useToast();
  const { setOnMenuNavigationAttempt, isTestInProgress } = useTestProtection();

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
  const [showAbandonModal, setShowAbandonModal] = useState(false);
  const [pendingNavigationRoute, setPendingNavigationRoute] = useState<
    string | null
  >(null);

  const [dataInicio] = useState(() => new Date().toISOString());

  const step = meemSteps[currentStep];

  useEffect(() => {
    async function carregarContextoDoTeste() {
      try {
        setLoadingDados(true);

        const pacienteCollection =
          database.collections.get<Paciente>("paciente");
        const instrumentoCollection =
          database.collections.get<InstrumentoAvaliacao>(
            "instrumento_avaliacao",
          );

        // 1. Busca os registros diretamente pelo ID (agora em formato string)
        const paciente = await pacienteCollection.find(params.patientId);
        const instrumento = await instrumentoCollection.find(
          params.instrumentId,
        );

        // 2. Resolve a escolaridade através do relacionamento
        let escolaridadeNome = "Analfabeto";
        if (paciente.nivelEscolaridade) {
          try {
            const esc = await paciente.nivelEscolaridade.fetch();
            if (esc) escolaridadeNome = esc.tipo;
          } catch {
            console.warn("Escolaridade não encontrada, usando padrão.");
          }
        }

        setPatientName(paciente.nomeCompleto);
        setPatientEscolaridade(escolaridadeNome);
        setInstrumentName(instrumento.nome);
      } catch (error) {
        console.error("Erro ao buscar dados do teste no WatermelonDB:", error);
      } finally {
        setLoadingDados(false);
      }
    }

    if (params.patientId && params.instrumentId) {
      carregarContextoDoTeste();
    }
  }, [params.patientId, params.instrumentId]);

  // Proteção contra saída acidental do teste
  useProtectTestNavigation({
    isActive: !loadingDados,
    patientName: patientName || "Carregando...",
    instrumentName: instrumentName || "Carregando...",
    currentStep: currentStep + 1,
    totalSteps: meemSteps.length,
  });

  // Registra callback para interceptar navegação do menu
  useEffect(() => {
    setOnMenuNavigationAttempt(() => (route: string) => {
      setPendingNavigationRoute(route);
      setShowAbandonModal(true);
    });

    // Cleanup ao desmontar
    return () => {
      setOnMenuNavigationAttempt(undefined);
    };
  }, [setOnMenuNavigationAttempt]);

  // Proteção contra botão "back" nativo do Android e gestos do iOS
  useEffect(() => {
    const unsubscribe = navigation.addListener(
      "beforeRemove" as any,
      (e: any) => {
        // Se teste não está em progresso, permite navegação normal
        if (!isTestInProgress) {
          return;
        }

        // Se teste está em progresso, previne a navegação e mostra o modal
        e.preventDefault();
        setPendingNavigationRoute(null); // Indica que veio do back button
        setShowAbandonModal(true);
      },
    );

    return unsubscribe;
  }, [navigation, isTestInProgress]);

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
    let notaCorte = 20;

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

    return scoreTotal >= notaCorte ? CLASSIFICAO_NORMAL : CLASSIFICAO_DEFICIT;
  };

  const finalizar = async () => {
    try {
      setLoadingDados(true);

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

      const todasAsPerguntas = meemSteps.flatMap((s) => s.questions || []);

      Object.entries(answers).forEach(([perguntaId, pontuacao]) => {
        const pergunta = todasAsPerguntas.find((p) => p.id === perguntaId);
        if (pergunta) {
          const dominio = pergunta.dominio as keyof typeof scores;
          scores[dominio] += pontuacao;
          scores.total += pontuacao;
        }
      });

      const classificacaoFinal = obterClassificacao(
        scores.total,
        patientEscolaridade,
      );
      const agora = new Date().toISOString();

      let novaAvaliacaoId = "";

      await database.write(async () => {
        const avaliacaoCollection =
          database.collections.get<AvaliacaoTesteMeem>("avaliacao_teste_meem");

        // 1. Busca assíncrona feita ANTES do bloco create
        const profissionais = await database.collections
          .get("profissional")
          .query(Q.where("user_id", user!.id))
          .fetch();

        const profissionalId =
          profissionais.length > 0 ? profissionais[0].id : null;

        // 2. Bloco create estritamente síncrono (sem async/await)
        const novaAvaliacao = await avaliacaoCollection.create((av) => {
          av.paciente.id = params.patientId;

          if (profissionalId) {
            av.profissional.id = profissionalId;
          }

          av.instrumento.id = params.instrumentId;

          if (params.unidadeId) {
            av.unidadeSaude.id = params.unidadeId;
          }

          av.dataInicio = dataInicio;
          av.dataFim = agora;

          av.scoreOrientacaoEspacial = scores.orientacao_espacial;
          av.scoreAtencao = scores.atencao;
          av.scoreLinguagem = scores.linguagem;
          av.scoreVisuoespacial = scores.visuoespacial;
          av.scoreMemoriaRecente = scores.memoria_recente;
          av.scoreMemoriaImediata = scores.memoria_imediata;
          av.scoreOrientacaoTemporal = scores.orientacao_temporal;
          av.scoreTotal = scores.total;

          av.classificacao = classificacaoFinal;
        });

        novaAvaliacaoId = novaAvaliacao.id;
      });

      showSuccess("Teste finalizado e salvo com sucesso!");

      router.push({
        pathname: "/(app)/results/[id]",
        params: {
          id: novaAvaliacaoId,
        },
      });
    } catch (error) {
      console.error("Erro ao persistir avaliação no WatermelonDB:", error);
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

      <TestAbandonModal
        visible={showAbandonModal}
        patientName={patientName}
        instrumentName={instrumentName}
        currentStep={currentStep + 1}
        totalSteps={meemSteps.length}
        onConfirmAbandon={() => {
          setShowAbandonModal(false);
          if (pendingNavigationRoute) {
            // Navegação para rota específica (via menu)
            router.push(pendingNavigationRoute as Href);
          } else {
            // Navegação via back button nativo (volta para tela anterior)
            router.back();
          }
        }}
        onCancel={() => {
          setShowAbandonModal(false);
          setPendingNavigationRoute(null);
        }}
      />
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
