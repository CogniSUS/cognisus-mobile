import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { database } from "@/database/database";
import { InstrumentoAvaliacaoRepository } from "@/database/repositories/InstrumentoAvaliacaoRepository";
import { useToast } from "@/hooks/useToast";
import { router, useLocalSearchParams } from "expo-router";
import TestSelectInstrumentPage from "./(app)/tests/select-instrument";
import TestSelectUnitPage from "./(app)/tests/select-unit";

jest.mock("@expo/vector-icons", () => ({
  Feather: ({ name }: { name: string }) => {
    const { Text: NativeText } = require("react-native");
    return <NativeText>{name}</NativeText>;
  },
  Ionicons: ({ name }: { name: string }) => {
    const { Text: NativeText } = require("react-native");
    return <NativeText>{name}</NativeText>;
  },
}));
jest.mock("expo-router", () => ({
  router: { back: jest.fn(), push: jest.fn() },
  useLocalSearchParams: jest.fn(),
}));
jest.mock("@react-navigation/native", () => {
  const ReactRuntime = require("react");
  return {
    useFocusEffect: (callback: () => void | (() => void)) =>
      ReactRuntime.useEffect(callback, [callback]),
  };
});
jest.mock("@/database/database", () => ({
  database: { collections: { get: jest.fn() } },
}));
jest.mock("@/database/repositories/InstrumentoAvaliacaoRepository", () => ({
  InstrumentoAvaliacaoRepository: { listarAtivos: jest.fn() },
}));
jest.mock("@/hooks/useToast", () => ({ useToast: jest.fn() }));

const instrument = {
  id: "meem",
  nome: "Mini Exame do Estado Mental",
  abreviacao: "MEEM",
  tempo_estimado_min: 10,
  versao: "1",
  status: 1,
};
const patientParams = {
  patientId: "patient-1",
  nome: "Maria da Silva",
  cpf: "12345678901",
  dataNascimento: "1990-05-04",
  sexo: "feminino",
  escolaridade: "Ensino médio",
};

describe("rotas de seleção de avaliação", () => {
  const fetch = jest.fn();
  const showError = jest.fn();
  const showInfo = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useLocalSearchParams).mockReturnValue({
      ...patientParams,
      instrumentId: "meem",
      instrumentNome: instrument.nome,
    } as never);
    jest.mocked(InstrumentoAvaliacaoRepository.listarAtivos).mockResolvedValue([
      instrument,
    ]);
    jest.mocked(database.collections.get).mockReturnValue({
      query: () => ({ fetch }),
    } as never);
    fetch.mockResolvedValue([{ id: "unit-1", nome: "UBS CENTRAL" }]);
    jest.mocked(useToast).mockReturnValue({
      error: showError,
      info: showInfo,
    } as never);
  });

  it("carrega instrumentos e passa os dados normalizados do paciente", async () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({
      ...patientParams,
      sexo: "valor inválido",
    } as never);
    const { getByText } = render(<TestSelectInstrumentPage />);

    expect(getByText("Carregando instrumentos...")).toBeTruthy();
    await waitFor(() =>
      expect(getByText("Mini Exame do Estado Mental")).toBeTruthy(),
    );
    expect(getByText("Maria da Silva")).toBeTruthy();
    fireEvent.press(getByText("Mini Exame do Estado Mental"));
    expect(router.push).toHaveBeenCalledWith({
      pathname: "/tests/select-unit",
      params: {
        patientId: "patient-1",
        nome: "Maria da Silva",
        cpf: "12345678901",
        dataNascimento: "1990-05-04",
        sexo: "outro",
        escolaridade: "Ensino médio",
        instrumentId: "meem",
        instrumentNome: "Mini Exame do Estado Mental",
      },
    });
  });

  it("exibe estado vazio e retorna à página inicial sem instrumentos", async () => {
    jest.mocked(InstrumentoAvaliacaoRepository.listarAtivos).mockResolvedValue(
      [],
    );
    const { getByText } = render(<TestSelectInstrumentPage />);

    await waitFor(() =>
      expect(
        getByText("Nenhum instrumento disponível no momento."),
      ).toBeTruthy(),
    );
    fireEvent.press(getByText("Voltar ao Início"));
    expect(router.push).toHaveBeenCalledWith("/");
  });

  it("recupera falha ao carregar instrumentos e exibe estado vazio", async () => {
    jest.mocked(InstrumentoAvaliacaoRepository.listarAtivos).mockRejectedValue(
      new Error("banco indisponível"),
    );
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const { getByText } = render(<TestSelectInstrumentPage />);

    await waitFor(() =>
      expect(
        getByText("Nenhum instrumento disponível no momento."),
      ).toBeTruthy(),
    );
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it("carrega unidades, aplica capitalização e inicia avaliação selecionada", async () => {
    const { getByText } = render(<TestSelectUnitPage />);

    await waitFor(() => expect(getByText("Ubs Central")).toBeTruthy());
    fireEvent.press(getByText("Ubs Central"));
    fireEvent.press(getByText("Iniciar Teste"));

    expect(showInfo).toHaveBeenCalledWith(
      'Teste "Mini Exame do Estado Mental" confirmado para Maria da Silva.',
    );
    expect(router.push).toHaveBeenCalledWith({
      pathname: "/tests/execute",
      params: {
        unidadeId: "unit-1",
        patientId: "patient-1",
        instrumentId: "meem",
      },
    });
  });

  it("fecha a seleção da unidade e mantém a ação bloqueada sem escolha", async () => {
    const { getByText } = render(<TestSelectUnitPage />);

    await waitFor(() => expect(getByText("Ubs Central")).toBeTruthy());
    fireEvent.press(getByText("Iniciar Teste"));
    expect(showError).not.toHaveBeenCalled();
    fireEvent.press(getByText("close"));
    expect(router.back).toHaveBeenCalledTimes(1);
  });

  it("registra falha ao buscar unidades e continua sem opções", async () => {
    fetch.mockRejectedValue(new Error("banco indisponível"));
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const { getByText, queryByText } = render(<TestSelectUnitPage />);

    await waitFor(() => expect(logSpy).toHaveBeenCalled());
    expect(queryByText("Ubs Central")).toBeNull();
    expect(getByText("Iniciar Teste")).toBeTruthy();
    logSpy.mockRestore();
  });
});
