import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import { PacienteRepository } from "@/database/repositories/PacienteRepository";
import { useAvaliacaoResult } from "@/hooks/useAvaliacaoResults";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/providers/AuthProvider";
import { router, useLocalSearchParams, useRouter } from "expo-router";
import ResultsPage from "./(app)/results/index";
import ResultsDetailsPage from "./(app)/results/[id]";

jest.mock("@expo/vector-icons", () => ({
  Feather: ({ name }: { name: string }) => {
    const { Text } = require("react-native");
    return <Text>{name}</Text>;
  },
  Ionicons: () => null,
}));
jest.mock("@react-navigation/native", () => {
  const React = require("react");
  return {
    useFocusEffect: (callback: () => void | (() => void)) =>
      React.useEffect(callback, [callback]),
  };
});
jest.mock("expo-router", () => ({
  router: { push: jest.fn() },
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
}));
jest.mock("@nozbe/watermelondb", () => ({
  Q: {
    sortBy: jest.fn((...args) => ({ sortBy: args })),
    take: jest.fn((...args) => ({ take: args })),
  },
}));
jest.mock("@/database/repositories/PacienteRepository", () => ({
  PacienteRepository: { listarTodos: jest.fn() },
}));
jest.mock("@/hooks/useToast", () => ({ useToast: jest.fn() }));
jest.mock("@/hooks/useAvaliacaoResults", () => ({
  useAvaliacaoResult: jest.fn(),
}));
jest.mock("@/providers/AuthProvider", () => ({ useAuth: jest.fn() }));
jest.mock("@/components/ui/SharePdfButton", () => ({
  SharePdfButton: ({ profissionalNome }: { profissionalNome: string }) => {
    const { Text } = require("react-native");
    return <Text>PDF por {profissionalNome}</Text>;
  },
}));

function makePatient(
  id: string,
  nomeCompleto: string,
  cpf: string,
  dataFim: string | null,
  fetchEvaluations = jest.fn().mockResolvedValue(
    dataFim ? [{ dataFim }] : [],
  ),
) {
  return {
    id,
    nomeCompleto,
    cpf,
    avaliacoes: { extend: () => ({ fetch: fetchEvaluations }) },
  };
}

const result = {
  id: "result-1",
  paciente_nome: "Maria da Silva",
  instrumento_nome: "Mini Exame do Estado Mental",
  data_inicio: "2025-06-15T12:00:00.000Z",
  classificacao: "Normal",
  score_total: 25,
  score_orientacao_espacial: 4,
  score_orientacao_temporal: 5,
  score_memoria_recente: 2,
  score_memoria_imediata: 3,
  score_atencao: 4,
  score_linguagem: 6,
  score_visuoespacial: 1,
  justificativa_alteracao: null,
  unidade_nome: "UBS Central",
};

describe("ResultsPage", () => {
  const showError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useToast).mockReturnValue({ error: showError } as never);
    jest.mocked(PacienteRepository.listarTodos).mockResolvedValue([
      makePatient("old", "Paciente Antigo", "11122233344", "2024-01-01"),
      makePatient("none", "Sem avaliação", "99988877766", null),
      makePatient("recent", "Paciente Recente", "55566677788", "2025-01-01"),
    ] as never);
  });

  it("lista avaliações recentes ordenadas e abre o histórico do paciente", async () => {
    const { getByText, queryByText } = render(<ResultsPage />);

    expect(getByText("Histórico do Paciente")).toBeTruthy();
    expect(PacienteRepository.listarTodos).toHaveBeenCalledTimes(1);
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });
    await waitFor(() => expect(getByText("Paciente Recente")).toBeTruthy());
    expect(queryByText("Sem avaliação")).toBeNull();
    fireEvent.press(getByText("Paciente Recente"));
    expect(router.push).toHaveBeenCalledWith({
      pathname: "/(app)/results/history",
      params: { patientId: "recent" },
    });
  });

  it("busca pacientes por nome ou CPF e apresenta vazio quando não encontra", async () => {
    const { getByPlaceholderText, getByText, queryByText } = render(
      <ResultsPage />,
    );
    await waitFor(() => expect(getByText("Paciente Recente")).toBeTruthy());

    fireEvent.changeText(getByPlaceholderText("Digite o Nome ou CPF"), "999");
    expect(getByText("Sem avaliação")).toBeTruthy();
    fireEvent.changeText(getByPlaceholderText("Digite o Nome ou CPF"), "ninguém");
    expect(getByText("Paciente não encontrado")).toBeTruthy();
    expect(queryByText("Sem avaliação")).toBeNull();
  });

  it("inclui paciente sem data na busca por nome e mostra avaliações indisponíveis", async () => {
    jest.mocked(PacienteRepository.listarTodos).mockResolvedValue([
      makePatient(
        "broken",
        "Paciente com relação inválida",
        "12312312399",
        null,
        jest.fn().mockRejectedValue(new Error("relação ausente")),
      ),
    ] as never);
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const { getByPlaceholderText, getByText } = render(<ResultsPage />);
    await waitFor(() => expect(warnSpy).toHaveBeenCalled());
    fireEvent.changeText(
      getByPlaceholderText("Digite o Nome ou CPF"),
      "relação inválida",
    );
    expect(getByText("Paciente com relação inválida")).toBeTruthy();
    expect(getByText(/Nenhuma avaliação/)).toBeTruthy();
    warnSpy.mockRestore();
  });

  it("notifica erro geral ao carregar pacientes", async () => {
    jest.mocked(PacienteRepository.listarTodos).mockRejectedValue(
      new Error("banco indisponível"),
    );
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const { getByText } = render(<ResultsPage />);

    await waitFor(() =>
      expect(showError).toHaveBeenCalledWith(
        "Não foi possível carregar a lista de pacientes.",
      ),
    );
    expect(getByText("Nenhum histórico recente encontrado.")).toBeTruthy();
    errorSpy.mockRestore();
  });
});

describe("ResultsDetailsPage", () => {
  const pageRouter = { push: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useLocalSearchParams).mockReturnValue({
      id: "result-1",
      patientId: "patient-1",
    } as never);
    jest.mocked(useRouter).mockReturnValue(pageRouter as never);
    jest.mocked(useAuth).mockReturnValue({
      user: { user_metadata: { nome_completo: "Ana Profissional" } },
    } as never);
    jest.mocked(useAvaliacaoResult).mockReturnValue({
      resultado: result,
      loading: false,
    } as never);
  });

  it("mostra carregamento enquanto busca o resultado", () => {
    jest.mocked(useAvaliacaoResult).mockReturnValue({
      resultado: null,
      loading: true,
    } as never);
    const { getByText } = render(<ResultsDetailsPage />);

    expect(useAvaliacaoResult).toHaveBeenCalledWith("result-1");
    expect(getByText("Carregando resultados...")).toBeTruthy();
  });

  it("apresenta resultado normal, áreas pontuadas, PDF e histórico", () => {
    const { getByText, queryByText } = render(<ResultsDetailsPage />);

    expect(getByText("Maria da Silva")).toBeTruthy();
    expect(getByText("Cognição Normal")).toBeTruthy();
    expect(getByText("Nível de Risco: Baixo")).toBeTruthy();
    expect(getByText("Orientação")).toBeTruthy();
    expect(getByText("PDF por Ana Profissional")).toBeTruthy();
    expect(queryByText("Justificativa da Exceção Clínica")).toBeNull();

    fireEvent.press(getByText("Ver Todos os Resultados"));
    expect(pageRouter.push).toHaveBeenCalledWith({
      pathname: "/results/history",
      params: { patientId: "patient-1" },
    });
  });

  it("apresenta classificação alterada, justificativa e profissional padrão", () => {
    jest.mocked(useAuth).mockReturnValue({ user: null } as never);
    jest.mocked(useAvaliacaoResult).mockReturnValue({
      loading: false,
      resultado: {
        ...result,
        classificacao: "Alterado",
        justificativa_alteracao: "Contexto clínico registrado",
      },
    } as never);
    const { getByText } = render(<ResultsDetailsPage />);

    expect(getByText("Possível Déficit Cognitivo")).toBeTruthy();
    expect(getByText("Nível de Risco: Alto")).toBeTruthy();
    expect(getByText("Contexto clínico registrado")).toBeTruthy();
    expect(getByText("PDF por Profissional não identificado")).toBeTruthy();
    expect(getByText(/Encaminhar para avaliação médica especializada/)).toBeTruthy();
  });

  it("oferece retorno quando não encontra o resultado", () => {
    jest.mocked(useAvaliacaoResult).mockReturnValue({
      resultado: null,
      loading: false,
    } as never);
    const { getByText } = render(<ResultsDetailsPage />);

    expect(getByText("Nenhum resultado encontrado.")).toBeTruthy();
    fireEvent.press(getByText("Voltar"));
    expect(pageRouter.push).toHaveBeenCalledWith("/");
  });
});
