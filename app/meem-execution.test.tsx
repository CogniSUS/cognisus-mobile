import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import { meemSteps } from "@/constants/meem";
import { database } from "@/database/database";
import { useProtectTestNavigation } from "@/hooks/useProtectTestNavigation";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/providers/AuthProvider";
import { useTestProtection } from "@/providers/TestProtectionProvider";
import { router, useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import TestExecutePage from "./(app)/tests/execute";

jest.mock("@expo/vector-icons", () => ({
  Feather: ({ name }: { name: string }) => {
    const { Text } = require("react-native");
    return <Text>{name}</Text>;
  },
  Ionicons: ({ name }: { name: string }) => {
    const { Text } = require("react-native");
    return <Text>{name}</Text>;
  },
}));
jest.mock("@nozbe/watermelondb", () => ({
  Q: { where: jest.fn((...args) => args) },
}));
jest.mock("expo-router", () => ({
  router: { push: jest.fn(), back: jest.fn() },
  useRouter: jest.fn(),
  useNavigation: jest.fn(),
  useLocalSearchParams: jest.fn(),
}));
jest.mock("@/components/ui/CustomSelect", () => ({
  CustomSelect: ({
    options,
    onValueChange,
  }: {
    options: { label: string; value: string }[];
    onValueChange: (value: string) => void;
  }) => {
    const { Text, TouchableOpacity, View } = require("react-native");
    return (
      <View>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            onPress={() => onValueChange(option.value)}
          >
            <Text>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  },
}));
jest.mock("@/components/ui/question-card", () => ({
  QuestionCard: ({ question, onAnswer }: any) => {
    const { Text, TouchableOpacity } = require("react-native");
    return (
      <TouchableOpacity
        testID={`answer-${question.id}`}
        onPress={() => onAnswer(question.id, question.points)}
      >
        <Text>{question.label}</Text>
      </TouchableOpacity>
    );
  },
}));
jest.mock("@/components/ui/test-abandon-modal", () => ({
  TestAbandonModal: ({ visible, onConfirmAbandon, onCancel }: any) => {
    const { Text, TouchableOpacity, View } = require("react-native");
    if (!visible) return null;
    return (
      <View>
        <TouchableOpacity onPress={onConfirmAbandon}>
          <Text>Confirmar abandono</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onCancel}>
          <Text>Continuar teste</Text>
        </TouchableOpacity>
      </View>
    );
  },
}));
jest.mock("@/components/ui/test-header", () => ({
  TestHeader: ({ patientName, instrumentName, currentStep, totalSteps }: any) => {
    const { Text } = require("react-native");
    return <Text>{`${patientName}|${instrumentName}|${currentStep}/${totalSteps}`}</Text>;
  },
}));
jest.mock("@/components/ui/test-instruction", () => ({
  TestInstruction: ({ instruction }: { instruction: string }) => {
    const { Text } = require("react-native");
    return <Text>{instruction}</Text>;
  },
}));
jest.mock("@/components/ui/time-card", () => ({
  TimerCard: ({ amountOfTime }: { amountOfTime: number }) => {
    const { Text } = require("react-native");
    return <Text>Tempo: {amountOfTime}</Text>;
  },
}));
jest.mock("@/database/database", () => ({
  database: {
    write: jest.fn(),
    collections: { get: jest.fn() },
  },
}));
jest.mock("@/hooks/useProtectTestNavigation", () => ({
  useProtectTestNavigation: jest.fn(),
}));
jest.mock("@/hooks/useToast", () => ({ useToast: jest.fn() }));
jest.mock("@/providers/AuthProvider", () => ({ useAuth: jest.fn() }));
jest.mock("@/providers/TestProtectionProvider", () => ({
  useTestProtection: jest.fn(),
}));

describe("TestExecutePage", () => {
  const showInfo = jest.fn();
  const showSuccess = jest.fn();
  const showError = jest.fn();
  const push = jest.fn();
  const back = jest.fn();
  const setOnMenuNavigationAttempt = jest.fn();
  const setListener = jest.fn();
  let beforeRemove: ((event: any) => void) | undefined;
  let savedAssessment: any;

  const patientWithEducation = {
    nomeCompleto: "Maria da Silva",
    nivelEscolaridade: {
      fetch: jest.fn().mockResolvedValue({ tipo: "Analfabeto" }),
    },
  };
  const instrument = { nome: "Mini Exame do Estado Mental" };
  const patientCollection = { find: jest.fn() };
  const instrumentCollection = { find: jest.fn() };
  const professionalCollection = {
    query: jest.fn(() => ({ fetch: jest.fn().mockResolvedValue([{ id: "professional-1" }]) })),
  };
  const assessmentCollection = {
    create: jest.fn(async (callback: (assessment: any) => void) => {
      savedAssessment = {
        paciente: { id: "" },
        profissional: { id: "" },
        instrumento: { id: "" },
        unidadeSaude: { id: "" },
      };
      callback(savedAssessment);
      return { id: "assessment-1" };
    }),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    savedAssessment = undefined;
    beforeRemove = undefined;
    jest.mocked(useAuth).mockReturnValue({ user: { id: "user-1" } } as never);
    jest.mocked(useToast).mockReturnValue({
      info: showInfo,
      success: showSuccess,
      error: showError,
    } as never);
    jest.mocked(useTestProtection).mockReturnValue({
      setOnMenuNavigationAttempt,
      isTestInProgress: false,
    } as never);
    jest.mocked(useLocalSearchParams).mockReturnValue({
      patientId: "patient-1",
      instrumentId: "instrument-1",
      unidadeId: "unit-1",
    } as never);
    jest.mocked(useRouter).mockReturnValue({ push, back } as never);
    jest.mocked(useNavigation).mockReturnValue({
      addListener: (event: string, callback: (event: any) => void) => {
        setListener(event);
        beforeRemove = callback;
        return jest.fn();
      },
    } as never);
    patientCollection.find.mockResolvedValue(patientWithEducation);
    instrumentCollection.find.mockResolvedValue(instrument);
    jest.mocked(database.collections.get).mockImplementation(((table: string) => {
      const collections: Record<string, unknown> = {
        paciente: patientCollection,
        instrumento_avaliacao: instrumentCollection,
        profissional: professionalCollection,
        avaliacao_teste_meem: assessmentCollection,
      };
      return collections[table] as never;
    }) as never);
    jest.mocked(database.write).mockImplementation((async (work: unknown) =>
      (work as () => Promise<void>)()) as never);
  });

  async function loadPage() {
    const screen = render(<TestExecutePage />);
    await waitFor(() => expect(patientCollection.find).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByText("Postura Profissional")).toBeTruthy());
    return screen;
  }

  it("conduz as etapas, exige respostas, permite revisão clínica e salva pontuações", async () => {
    const screen = await loadPage();
    expect(screen.getByText("Maria da Silva|Mini Exame do Estado Mental|1/13")).toBeTruthy();

    // A etapa introdutória não tem perguntas e pode avançar diretamente.
    fireEvent.press(screen.getByText("Próxima"));
    expect(screen.getByText("Orientação Temporal")).toBeTruthy();
    fireEvent.press(screen.getByText("Próxima"));
    expect(showInfo).toHaveBeenCalledWith(
      "Por favor, responda todas as perguntas desta etapa antes de avançar.",
    );

    // Percorre todas as perguntas; em atenção, usa o caminho alternativo MUNDO.
    for (let index = 1; index < meemSteps.length; index += 1) {
      const step = meemSteps[index];
      await waitFor(() => expect(screen.getByText(step.title)).toBeTruthy());

      if (step.id === "atencao_calculo") {
        fireEvent.press(screen.getByText("Soletração MUNDO"));
      }
      if (step.hasTimer) {
        expect(screen.getByText(/Tempo:/)).toBeTruthy();
      }
      if (step.referenceImage) {
        fireEvent.press(screen.getByText("Ampliar Imagem para o Paciente"));
        expect(screen.getByText("Vire a tela do dispositivo para o paciente copiar o desenho.")).toBeTruthy();
        fireEvent(screen.getByText("x"), "press");
      }

      const questions =
        step.id === "atencao_calculo" && step.alternativeQuestions
          ? step.alternativeQuestions
          : step.questions ?? [];
      for (const question of questions) {
        fireEvent.press(screen.getByTestId(`answer-${question.id}`));
      }
      fireEvent.press(screen.getByText("Próxima"));
    }

    await waitFor(() => expect(screen.getByText("Revisão e Veredito")).toBeTruthy());
    expect(screen.getByText("Nota de Corte (Brucki):")).toBeTruthy();
    expect(screen.getByText("30 / 30")).toBeTruthy();

    fireEvent.press(screen.getByText("Anterior"));
    expect(screen.getByText("Desenho (Praxia Construtiva)")).toBeTruthy();
    fireEvent.press(screen.getByText("Próxima"));
    await waitFor(() => expect(screen.getByText("Revisão e Veredito")).toBeTruthy());
    fireEvent.press(screen.getByText("Alterar classificação sugerida (Exceção Clínica)"));
    fireEvent.press(screen.getByText("Possível Déficit Cognitivo"));
    fireEvent.changeText(
      screen.getByPlaceholderText("Ex: Paciente estava excessivamente ansioso..."),
      "Justificativa clínica",
    );
    fireEvent.press(screen.getByText("Salvar Avaliação"));

    await waitFor(() =>
      expect(showSuccess).toHaveBeenCalledWith("Teste finalizado e salvo com sucesso!"),
    );
    expect(savedAssessment).toMatchObject({
      paciente: { id: "patient-1" },
      profissional: { id: "professional-1" },
      instrumento: { id: "instrument-1" },
      unidadeSaude: { id: "unit-1" },
      scoreTotal: 30,
      classificacao: "Possível Déficit Cognitivo",
      justificativaAlteracao: "Justificativa clínica",
    });
    expect(push).toHaveBeenCalledWith({
      pathname: "/(app)/results/[id]",
      params: { id: "assessment-1", patientId: "patient-1" },
    });
  }, 10000);

  it("usa escolaridade padrão quando a relação não existe ou falha ao carregar", async () => {
    patientCollection.find.mockResolvedValueOnce({ nomeCompleto: "Sem Escolaridade" });
    const screen = render(<TestExecutePage />);
    await waitFor(() => expect(screen.getByText("Postura Profissional")).toBeTruthy());
    expect(screen.getByText("Sem Escolaridade|Mini Exame do Estado Mental|1/13")).toBeTruthy();
    screen.unmount();

    patientCollection.find.mockResolvedValueOnce({
      nomeCompleto: "Escolaridade indisponível",
      nivelEscolaridade: { fetch: jest.fn().mockRejectedValue(new Error("não encontrado")) },
    });
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const failedRelation = render(<TestExecutePage />);
    await waitFor(() =>
      expect(failedRelation.getByText("Escolaridade indisponível|Mini Exame do Estado Mental|1/13")).toBeTruthy(),
    );
    expect(warnSpy).toHaveBeenCalledWith("Escolaridade não encontrada, usando padrão.");
    warnSpy.mockRestore();
  });

  it("protege navegação pelo menu e pelo evento beforeRemove e permite cancelar ou confirmar", async () => {
    jest.mocked(useTestProtection).mockReturnValue({
      setOnMenuNavigationAttempt,
      isTestInProgress: true,
    } as never);
    const screen = await loadPage();
    expect(setListener).toHaveBeenCalledWith("beforeRemove");
    const registerHandler = setOnMenuNavigationAttempt.mock.calls[0][0] as () => (route: string) => void;
    const attemptMenuNavigation = registerHandler();
    act(() => attemptMenuNavigation("/(app)/patients"));
    expect(screen.getByText("Confirmar abandono")).toBeTruthy();
    fireEvent.press(screen.getByText("Continuar teste"));

    let prevented = false;
    act(() => beforeRemove?.({ preventDefault: () => { prevented = true; } }));
    expect(prevented).toBe(true);
    fireEvent.press(screen.getByText("Confirmar abandono"));
    expect(router.push).not.toHaveBeenCalled();
    expect(back).toHaveBeenCalledTimes(1);

    act(() => attemptMenuNavigation("/(app)/results"));
    fireEvent.press(screen.getByText("Confirmar abandono"));
    expect(push).toHaveBeenCalledWith("/(app)/results");
  });

  it("mantém o fluxo quando falta ID e reporta falhas ao carregar ou salvar", async () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({} as never);
    const noIds = render(<TestExecutePage />);
    expect(noIds.getByText("Preparando...")).toBeTruthy();
    noIds.unmount();

    jest.mocked(useLocalSearchParams).mockReturnValue({
      patientId: "patient-1",
      instrumentId: "instrument-1",
    } as never);
    patientCollection.find.mockRejectedValueOnce(new Error("consulta falhou"));
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const loadError = render(<TestExecutePage />);
    await waitFor(() => expect(loadError.getByText("Postura Profissional")).toBeTruthy());
    expect(errorSpy).toHaveBeenCalledWith("Erro ao buscar dados do teste:", expect.any(Error));
    loadError.unmount();

    const screen = await loadPage();
    for (let index = 0; index < meemSteps.length; index += 1) {
      const step = meemSteps[index];
      if (step.id === "atencao_calculo") fireEvent.press(screen.getByText("Cálculo Subtração"));
      const questions = step.questions ?? [];
      for (const question of questions) {
        fireEvent.press(screen.getByTestId(`answer-${question.id}`));
      }
      fireEvent.press(screen.getByText("Próxima"));
    }
    await waitFor(() => expect(screen.getByText("Salvar Avaliação")).toBeTruthy());
    jest.mocked(database.write).mockRejectedValue(new Error("transação falhou"));
    fireEvent.press(screen.getByText("Salvar Avaliação"));
    await waitFor(() =>
      expect(showError).toHaveBeenCalledWith(
        "Não foi possível salvar o resultado do teste localmente.",
      ),
    );
    expect(errorSpy).toHaveBeenCalledWith("Erro ao persistir avaliação:", expect.any(Error));
    errorSpy.mockRestore();
  });
});
