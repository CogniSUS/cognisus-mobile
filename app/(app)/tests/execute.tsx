import { CustomSelect } from "@/components/ui/CustomSelect";
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
import {
  calcularNotaDeCorteMeem,
  CLASSIFICACAO_DEFICIT,
  CLASSIFICACAO_NORMAL,
  obterClassificacaoMeem,
} from "@/utils/meemHelpers";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Q } from "@nozbe/watermelondb";
import type { Href } from "expo-router";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
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
import { InstrumentoAvaliacao } from "../../../database/models/InstrumentoAvaliacao";

export default function TestExecutePage() {
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

  // Estados da Etapa de Revisão (Human-in-the-loop)
  const [isReviewStep, setIsReviewStep] = useState(false);
  const [isOverride, setIsOverride] = useState(false);
  const [manualClassification, setManualClassification] =
    useState(CLASSIFICACAO_NORMAL);
  const [justificativa, setJustificativa] = useState("");

  const [dataInicio] = useState(() => new Date().toISOString());
  const scrollRef = useRef<ScrollView>(null);
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

        const paciente = await pacienteCollection.find(params.patientId);
        const instrumento = await instrumentoCollection.find(
          params.instrumentId,
        );

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
        console.error("Erro ao buscar dados do teste:", error);
      } finally {
        setLoadingDados(false);
      }
    }

    if (params.patientId && params.instrumentId) {
      carregarContextoDoTeste();
    }
  }, [params.patientId, params.instrumentId]);

  useProtectTestNavigation({
    isActive: !loadingDados,
    patientName: patientName || "Carregando...",
    instrumentName: instrumentName || "Carregando...",
    currentStep: isReviewStep ? meemSteps.length + 1 : currentStep + 1,
    totalSteps: meemSteps.length + 1,
  });

  useEffect(() => {
    setOnMenuNavigationAttempt(() => (route: string) => {
      setPendingNavigationRoute(route);
      setShowAbandonModal(true);
    });
    return () => {
      setOnMenuNavigationAttempt(undefined);
    };
  }, [setOnMenuNavigationAttempt]);

  useEffect(() => {
    const unsubscribe = navigation.addListener(
      "beforeRemove" as any,
      (e: any) => {
        if (!isTestInProgress) return;
        e.preventDefault();
        setPendingNavigationRoute(null);
        setShowAbandonModal(true);
      },
    );
    return unsubscribe;
  }, [navigation, isTestInProgress]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, [currentStep, isReviewStep]);

  const handleAnswer = (questionId: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (isReviewStep) {
      finalizar();
      return;
    }

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
      // Entra na etapa de revisão antes de finalizar
      setIsReviewStep(true);

      // Pré-carrega a classificação sugerida caso o usuário ative o override
      const totalScoreTemp = Object.values(answers).reduce(
        (acc, val) => acc + val,
        0,
      );
      const classSugerida = obterClassificacaoMeem(
        totalScoreTemp,
        patientEscolaridade,
      );
      setManualClassification(
        classSugerida === CLASSIFICACAO_NORMAL
          ? CLASSIFICACAO_DEFICIT
          : CLASSIFICACAO_NORMAL,
      );
    }
  };

  const handlePrevious = () => {
    if (isReviewStep) {
      setIsReviewStep(false);
    } else if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
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

      const classificacaoSugerida = obterClassificacaoMeem(
        scores.total,
        patientEscolaridade,
      );
      const classificacaoDefinitiva = isOverride
        ? manualClassification
        : classificacaoSugerida;
      const justificativaFinal = isOverride ? justificativa.trim() : null;

      const agora = new Date().toISOString();
      let novaAvaliacaoId = "";

      await database.write(async () => {
        const avaliacaoCollection =
          database.collections.get<AvaliacaoTesteMeem>("avaliacao_teste_meem");
        const profissionais = await database.collections
          .get("profissional")
          .query(Q.where("user_id", user!.id))
          .fetch();
        const profissionalId =
          profissionais.length > 0 ? profissionais[0].id : null;

        const novaAvaliacao = await avaliacaoCollection.create((av) => {
          av.paciente.id = params.patientId;
          if (profissionalId) av.profissional.id = profissionalId;
          av.instrumento.id = params.instrumentId;
          if (params.unidadeId) av.unidadeSaude.id = params.unidadeId;

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

          av.classificacao = classificacaoDefinitiva;
          av.justificativaAlteracao = justificativaFinal;
        });
        novaAvaliacaoId = novaAvaliacao.id;
      });

      showSuccess("Teste finalizado e salvo com sucesso!");
      router.push({
        pathname: "/(app)/results/[id]",
        params: { id: novaAvaliacaoId, patientId: params.patientId },
      });
    } catch (error) {
      console.error("Erro ao persistir avaliação:", error);
      showError("Não foi possível salvar o resultado do teste localmente.");
    } finally {
      setLoadingDados(false);
    }
  };

  if (loadingDados) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9D22F0" />
        <Text style={styles.loadingText}>Preparando...</Text>
      </View>
    );
  }

  const totalScoreAtual = Object.values(answers).reduce(
    (acc, val) => acc + val,
    0,
  );
  const notaDeCorteBase = calcularNotaDeCorteMeem(patientEscolaridade);
  const classificacaoSugerida = obterClassificacaoMeem(
    totalScoreAtual,
    patientEscolaridade,
  );

  const opcoesClassificacao = [
    { label: "Normal", value: CLASSIFICACAO_NORMAL },
    { label: "Possível Déficit Cognitivo", value: CLASSIFICACAO_DEFICIT },
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "android" ? "height" : "padding"}
    >
      <TestHeader
        patientName={patientName}
        instrumentName={instrumentName}
        currentStep={isReviewStep ? meemSteps.length + 1 : currentStep + 1}
        totalSteps={meemSteps.length + 1}
      />

      <ScrollView
        ref={scrollRef}
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.contentArea}>
          {!isReviewStep ? (
            // ==========================================
            // FLUXO NORMAL DO TESTE
            // ==========================================
            <>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <TestInstruction
                instruction={step.instruction}
                isIntro={step.isIntro}
              />
              {step.hasTimer && (
                <TimerCard
                  key={`timer-${step.id}`}
                  amountOfTime={step.amountOfTime || 60}
                />
              )}
              {step.questions?.map((pergunta) => (
                <QuestionCard
                  key={pergunta.id}
                  question={pergunta}
                  currentValue={answers[pergunta.id]}
                  onAnswer={handleAnswer}
                />
              ))}
            </>
          ) : (
            // ==========================================
            // TELA DE REVISÃO E VEREDITO CLINICO
            // ==========================================
            <>
              <Text style={styles.stepTitle}>Revisão e Veredito</Text>
              <Text style={styles.reviewDescription}>
                Você registrou todas as respostas. Confira a pontuação e a
                sugestão do sistema baseada na escolaridade do paciente.
              </Text>

              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Pontuação Total:</Text>
                  <Text style={styles.summaryValue}>
                    {totalScoreAtual} / 30
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>
                    Nota de Corte (Brucki):
                  </Text>
                  <Text style={styles.summaryValue}>
                    {notaDeCorteBase} pontos
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Sugestão do Sistema:</Text>
                  <Text
                    style={[
                      styles.summaryValue,
                      {
                        color:
                          classificacaoSugerida === CLASSIFICACAO_NORMAL
                            ? "#16A34A"
                            : "#DC2626",
                      },
                    ]}
                  >
                    {classificacaoSugerida}
                  </Text>
                </View>
              </View>

              {/* OVERRIDE CLINICO */}
              <View style={styles.overrideSection}>
                <TouchableOpacity
                  style={styles.overrideToggle}
                  onPress={() => setIsOverride(!isOverride)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={isOverride ? "checkbox" : "square-outline"}
                    size={24}
                    color={isOverride ? "#A824EE" : "#64748B"}
                  />
                  <Text style={styles.overrideToggleText}>
                    Alterar classificação sugerida (Exceção Clínica)
                  </Text>
                </TouchableOpacity>

                {isOverride && (
                  <View style={styles.overrideForm}>
                    <Text style={styles.inputLabel}>Nova Classificação:</Text>

                    <CustomSelect
                      placeholder="Selecione a classificação"
                      modalTitle="Nova Classificação"
                      value={manualClassification}
                      options={opcoesClassificacao}
                      onValueChange={setManualClassification}
                      icon={
                        <Feather name="activity" size={20} color="#732cad" />
                      }
                    />

                    <Text style={[styles.inputLabel, { marginTop: -4 }]}>
                      Justificativa Clínica (Opcional):
                    </Text>
                    <TextInput
                      style={styles.textArea}
                      placeholder="Ex: Paciente estava excessivamente ansioso..."
                      placeholderTextColor="#9CA3AF"
                      multiline={true}
                      numberOfLines={4}
                      value={justificativa}
                      onChangeText={setJustificativa}
                      textAlignVertical="top"
                      selectionColor="#A824EE"
                    />
                  </View>
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.btnOutline,
            !isReviewStep && currentStep === 0 && styles.btnOutlineDisabled,
          ]}
          onPress={handlePrevious}
          disabled={!isReviewStep && currentStep === 0}
          activeOpacity={0.7}
        >
          <Feather
            name="chevron-left"
            size={20}
            color={!isReviewStep && currentStep === 0 ? "#D1D5DB" : "#A824EE"}
          />
          <Text
            style={[
              styles.btnOutlineText,
              !isReviewStep && currentStep === 0 && styles.textDisabled,
            ]}
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
            {isReviewStep ? "Salvar Avaliação" : "Próxima"}
          </Text>
          <Feather
            name={isReviewStep ? "check" : "chevron-right"}
            size={20}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>

      <TestAbandonModal
        visible={showAbandonModal}
        patientName={patientName}
        instrumentName={instrumentName}
        currentStep={isReviewStep ? meemSteps.length + 1 : currentStep + 1}
        totalSteps={meemSteps.length + 1}
        onConfirmAbandon={() => {
          setShowAbandonModal(false);
          if (pendingNavigationRoute)
            router.push(pendingNavigationRoute as Href);
          else router.back();
        }}
        onCancel={() => {
          setShowAbandonModal(false);
          setPendingNavigationRoute(null);
        }}
      />
    </KeyboardAvoidingView>
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
  reviewDescription: {
    fontSize: 16,
    color: "#4B5563",
    lineHeight: 24,
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 24,
    gap: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
  },
  summaryValue: {
    fontSize: 16,
    color: "#0F172A",
    fontWeight: "700",
    flexShrink: 1,
    textAlign: "right",
    marginLeft: 8,
  },
  summaryLabel: {
    fontSize: 15,
    color: "#64748B",
    fontWeight: "500",
  },
  overrideSection: {
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 20,
  },
  overrideToggle: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  overrideToggleText: {
    fontSize: 15,
    color: "#334155",
    fontWeight: "600",
    marginLeft: 12,
  },
  overrideForm: {
    backgroundColor: "#FAF5FF",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E9D5FF",
    gap: 12,
  },
  inputLabel: {
    fontSize: 14,
    color: "#4B5563",
    fontWeight: "600",
  },
  textArea: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: "#0F172A",
    minHeight: 100,
  },
});
