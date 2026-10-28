import React from "react";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import { Text } from "react-native";
import { InstrumentoAvaliacaoRepository } from "@/database/repositories/InstrumentoAvaliacaoRepository";
import { router } from "expo-router";
import InformationDevelopmentPage from "./(app)/informations/development";
import AppDevelopmentPage from "./(app)/development";
import InformationsPage from "./(app)/informations/index";
import SelectInstrumentGuidePage from "./(app)/informations/select-instruments";

jest.mock("@expo/vector-icons", () => ({
  Feather: ({ name }: { name: string }) => {
    const { Text: NativeText } = require("react-native");
    return <NativeText>{name}</NativeText>;
  },
  Ionicons: () => null,
}));
jest.mock("expo-router", () => ({
  router: { back: jest.fn(), push: jest.fn(), replace: jest.fn() },
}));
jest.mock("@react-navigation/native", () => {
  const ReactRuntime = require("react");
  return {
    useFocusEffect: (callback: () => void | (() => void)) =>
      ReactRuntime.useEffect(callback, [callback]),
  };
});
jest.mock("@/database/repositories/InstrumentoAvaliacaoRepository", () => ({
  InstrumentoAvaliacaoRepository: { listarAtivos: jest.fn() },
}));
jest.mock("@/components/features/informations/logout-button", () => ({
  LogoutButton: () => {
    const { Text: NativeText } = require("react-native");
    return <NativeText>Sair do Aplicativo</NativeText>;
  },
}));

const instrument = {
  id: "meem",
  nome: "Mini Exame do Estado Mental",
  abreviacao: "MEEM",
  tempo_estimado_min: 10,
  versao: "1",
  status: 1,
};

describe("rotas de informações", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(InstrumentoAvaliacaoRepository.listarAtivos).mockResolvedValue([]);
  });

  it.each([
    ["informações", InformationDevelopmentPage, "/(app)/informations"],
    ["desenvolvimento", AppDevelopmentPage, "/(app)"],
  ])("renderiza a página de %s e retorna à rota correspondente", (_label, Page, route) => {
    const { getByText } = render(<Page />);

    expect(getByText("Funcionalidade em desenvolvimento")).toBeTruthy();
    fireEvent.press(getByText("arrow-left"));
    expect(router.replace).toHaveBeenCalledWith(route);
  });

  it("exibe conteúdo informativo e navega para guias, dúvidas e configurações", () => {
    const { getByText } = render(<InformationsPage />);

    expect(getByText("Hábitos Saudáveis para o Cérebro")).toBeTruthy();
    expect(getByText("Controle de DCNT")).toBeTruthy();
    expect(getByText("Suporte e Contato")).toBeTruthy();
    fireEvent.press(getByText("Guia de Testes"));
    expect(router.push).toHaveBeenCalledWith(
      "/(app)/informations/select-instruments",
    );
    fireEvent.press(getByText("Perguntas Frequentes"));
    fireEvent.press(getByText("Configurações"));
    expect(router.replace).toHaveBeenNthCalledWith(
      1,
      "/(app)/informations/development",
    );
    expect(router.replace).toHaveBeenNthCalledWith(
      2,
      "/(app)/informations/development",
    );
  });

  it("mostra o carregamento, lista instrumentos e envia parâmetros do guia", async () => {
    let resolveList!: (items: typeof instrument[]) => void;
    jest.mocked(InstrumentoAvaliacaoRepository.listarAtivos).mockReturnValue(
      new Promise((resolve) => { resolveList = resolve; }),
    );
    const { getByText } = render(<SelectInstrumentGuidePage />);

    expect(getByText("Carregando guias...")).toBeTruthy();
    await act(async () => resolveList([instrument]));
    await waitFor(() => expect(getByText("Mini Exame do Estado Mental")).toBeTruthy());
    fireEvent.press(getByText("Mini Exame do Estado Mental"));

    expect(router.push).toHaveBeenCalledWith({
      pathname: "/(app)/informations/guide-test-meem",
      params: {
        instrumentId: "meem",
        instrumentNome: "Mini Exame do Estado Mental",
      },
    });
  });

  it("apresenta estado vazio após erro ou lista vazia e permite voltar", async () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    jest.mocked(InstrumentoAvaliacaoRepository.listarAtivos).mockRejectedValue(
      new Error("banco indisponível"),
    );
    const { getByText, rerender } = render(<SelectInstrumentGuidePage />);
    await waitFor(() =>
      expect(getByText("Nenhum guia disponível no momento.")).toBeTruthy(),
    );
    fireEvent.press(getByText("Voltar ao Início"));
    expect(router.back).toHaveBeenCalledTimes(1);

    jest.mocked(InstrumentoAvaliacaoRepository.listarAtivos).mockResolvedValue([]);
    rerender(<SelectInstrumentGuidePage />);
    await waitFor(() =>
      expect(getByText("Nenhum guia disponível no momento.")).toBeTruthy(),
    );
    errorSpy.mockRestore();
  });
});
