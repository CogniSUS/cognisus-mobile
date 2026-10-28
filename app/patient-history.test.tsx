import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { HistoricoPacienteRepository } from "@/database/repositories/HistoricoPacienteRepository";
import { PacienteRepository } from "@/database/repositories/PacienteRepository";
import { router, useLocalSearchParams } from "expo-router";
import PatientHistoryPage from "./(app)/results/history";

jest.mock("@expo/vector-icons", () => ({
  Feather: () => null,
  Ionicons: () => null,
}));
jest.mock("react-native-svg", () => {
  const React = require("react");
  const { Text, View } = require("react-native");
  const Svg = ({ children }: { children: React.ReactNode }) =>
    React.createElement(View, null, children);
  const SvgText = ({ children }: { children: React.ReactNode }) =>
    React.createElement(Text, null, children);
  const SvgShape = ({ children }: { children?: React.ReactNode }) =>
    React.createElement(View, null, children);
  return {
    __esModule: true,
    default: Svg,
    Circle: SvgShape,
    G: SvgShape,
    Line: SvgShape,
    Path: SvgShape,
    Text: SvgText,
  };
});
jest.mock("@react-navigation/native", () => {
  const React = require("react");
  return {
    useFocusEffect: (callback: () => void | (() => void)) =>
      React.useEffect(callback, [callback]),
  };
});
jest.mock("expo-router", () => ({
  router: { push: jest.fn() },
  useLocalSearchParams: jest.fn(),
}));
jest.mock("@/database/repositories/PacienteRepository", () => ({
  PacienteRepository: { buscarPorId: jest.fn() },
}));
jest.mock("@/database/repositories/HistoricoPacienteRepository", () => ({
  HistoricoPacienteRepository: { buscarHistorico: jest.fn() },
}));

const patient = {
  nomeCompleto: "Maria da Silva",
  cpf: "12345678901",
};
const results = [
  {
    id: "meem-1",
    patientId: "patient-1",
    instrumentId: "meem",
    testName: "Mini Exame",
    testAbbreviation: "MEEM",
    date: "2025-06-15T12:00:00.000Z",
    score: 25,
    maxScore: 30,
    classification: "Resultado MEEM",
    status: "normal" as const,
  },
  {
    id: "moca-1",
    patientId: "patient-1",
    instrumentId: "moca",
    testName: "Montreal Cognitive Assessment",
    testAbbreviation: " MoCA ",
    date: "2025-06-16T12:00:00.000Z",
    score: 20,
    maxScore: 30,
    classification: "Resultado MoCA",
    status: "alterado" as const,
  },
  {
    id: "fluencia-1",
    patientId: "patient-1",
    instrumentId: "fluencia",
    testName: "Fluência verbal",
    testAbbreviation: "Fluência",
    date: "2025-06-17T12:00:00.000Z",
    score: 12,
    maxScore: 20,
    classification: "Resultado fluência acentuada",
    status: "normal" as const,
  },
  {
    id: "fluencia-2",
    patientId: "patient-1",
    instrumentId: "fluencia",
    testName: "Fluência verbal",
    testAbbreviation: "fluencia",
    date: "2025-06-18T12:00:00.000Z",
    score: 10,
    maxScore: 20,
    classification: "Resultado fluencia sem acento",
    status: "normal" as const,
  },
];

describe("PatientHistoryPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useLocalSearchParams).mockReturnValue({
      patientId: "patient-1",
    } as never);
    jest.mocked(PacienteRepository.buscarPorId).mockResolvedValue(
      patient as never,
    );
    jest.mocked(HistoricoPacienteRepository.buscarHistorico).mockResolvedValue(
      results as never,
    );
  });

  it("carrega dados, filtra instrumentos e abre o resultado escolhido", async () => {
    const { getByText, getAllByText, queryByText } = render(
      <PatientHistoryPage />,
    );

    await waitFor(() => expect(getByText("Histórico de Avaliações")).toBeTruthy());
    await waitFor(() => expect(getByText("Maria da Silva")).toBeTruthy());
    expect(getByText("Resultado MEEM")).toBeTruthy();
    expect(getByText("Resultado MoCA")).toBeTruthy();

    fireEvent.press(getAllByText("MEEM")[0]!);
    expect(getByText("Resultado MEEM")).toBeTruthy();
    expect(queryByText("Resultado MoCA")).toBeNull();
    fireEvent.press(getAllByText("MEEM").at(-1)!);
    expect(router.push).toHaveBeenCalledWith({
      pathname: "/results/[id]",
      params: {
        id: "meem-1",
        type: "MEEM",
        patientId: "patient-1",
      },
    });

    fireEvent.press(getByText("MoCA"));
    expect(getByText("Resultado MoCA")).toBeTruthy();
    expect(queryByText("Resultado MEEM")).toBeNull();

    fireEvent.press(getByText("Fluência"));
    expect(getByText("Resultado fluência acentuada")).toBeTruthy();
    expect(getByText("Resultado fluencia sem acento")).toBeTruthy();
    expect(queryByText("Resultado MEEM")).toBeNull();
  });

  it("exibe o estado vazio e omite o cartão quando o paciente não existe", async () => {
    jest.mocked(PacienteRepository.buscarPorId).mockResolvedValue(null);
    jest.mocked(HistoricoPacienteRepository.buscarHistorico).mockResolvedValue(
      [] as never,
    );
    const { getByText, queryByText } = render(<PatientHistoryPage />);

    await waitFor(() =>
      expect(
        getByText("Nenhuma avaliação encontrada para este filtro."),
      ).toBeTruthy(),
    );
    expect(getByText("Histórico de Avaliações")).toBeTruthy();
    expect(queryByText("Maria da Silva")).toBeNull();
    expect(
      getByText("Nenhuma avaliação disponível para o gráfico."),
    ).toBeTruthy();
  });

  it("registra falha ao carregar histórico e mantém a tela utilizável", async () => {
    jest.mocked(HistoricoPacienteRepository.buscarHistorico).mockRejectedValue(
      new Error("banco indisponível"),
    );
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const { getByText } = render(<PatientHistoryPage />);

    await waitFor(() =>
      expect(getByText("Nenhuma avaliação encontrada para este filtro.")).toBeTruthy(),
    );
    expect(errorSpy).toHaveBeenCalledWith(
      "Erro ao carregar histórico:",
      expect.any(Error),
    );
    errorSpy.mockRestore();
  });
});
