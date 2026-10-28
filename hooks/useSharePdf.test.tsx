import { act, renderHook } from "@testing-library/react-native";
import { useToast } from "@/hooks/useToast";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { gerarHtmlResultadoMeem } from "@/utils/pdfTemplates";
import { useSharePdf } from "./useSharePdf";

jest.mock("@/hooks/useToast", () => ({ useToast: jest.fn() }));
jest.mock("expo-print", () => ({ printToFileAsync: jest.fn() }));
jest.mock("expo-sharing", () => ({
  isAvailableAsync: jest.fn(),
  shareAsync: jest.fn(),
}));
jest.mock("@/utils/pdfTemplates", () => ({ gerarHtmlResultadoMeem: jest.fn() }));

const showError = jest.fn();
const input = {
  avaliacao: {
    id: "avaliacao-1",
    data_inicio: "2025-06-15T12:00:00.000Z",
    score_total: 27,
    classificacao: "Normal",
    score_orientacao_espacial: 5,
    score_orientacao_temporal: 5,
    score_memoria_recente: 3,
    score_memoria_imediata: 3,
    score_atencao: 4,
    score_linguagem: 6,
    score_visuoespacial: 1,
    paciente_nome: "Maria da Silva",
    instrumento_nome: "MEEM",
    unidade_nome: "Unidade Central",
    justificativa_alteracao: null,
  },
  unidadeNome: "Unidade Central",
  profissionalNome: "Dra. Ana Souza",
  dataAvaliacao: "15/06/2025",
};

describe("useSharePdf", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useToast).mockReturnValue({ error: showError } as never);
    jest.mocked(gerarHtmlResultadoMeem).mockReturnValue("<html>resultado</html>");
    jest.mocked(Print.printToFileAsync).mockResolvedValue({
      uri: "file:///resultado.pdf",
      numberOfPages: 1,
    });
    jest.mocked(Sharing.isAvailableAsync).mockResolvedValue(true);
    jest.mocked(Sharing.shareAsync).mockResolvedValue(undefined);
  });

  it("gera o PDF e abre o compartilhamento nativo", async () => {
    const { result } = renderHook(() => useSharePdf());

    await act(async () => {
      await result.current.shareAvaliacaoPdf(input);
    });

    expect(gerarHtmlResultadoMeem).toHaveBeenCalledWith(input);
    expect(Print.printToFileAsync).toHaveBeenCalledWith({
      html: "<html>resultado</html>",
      base64: false,
    });
    expect(Sharing.shareAsync).toHaveBeenCalledWith("file:///resultado.pdf", {
      mimeType: "application/pdf",
      dialogTitle: "Compartilhar Resultado do Rastreio",
      UTI: "com.adobe.pdf",
    });
    expect(result.current.isSharing).toBe(false);
    expect(showError).not.toHaveBeenCalled();
  });

  it("informa quando o compartilhamento não está disponível", async () => {
    jest.mocked(Sharing.isAvailableAsync).mockResolvedValue(false);
    const { result } = renderHook(() => useSharePdf());

    await act(async () => {
      await result.current.shareAvaliacaoPdf(input);
    });

    expect(showError).toHaveBeenCalledWith(
      "Compartilhamento nativo não disponível neste dispositivo.",
    );
    expect(Sharing.shareAsync).not.toHaveBeenCalled();
    expect(result.current.isSharing).toBe(false);
  });

  it("informa e finaliza o estado de loading quando a geração falha", async () => {
    jest.mocked(Print.printToFileAsync).mockRejectedValue(new Error("falha PDF"));
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const { result } = renderHook(() => useSharePdf());

    await act(async () => {
      await result.current.shareAvaliacaoPdf(input);
    });

    expect(showError).toHaveBeenCalledWith(
      "Não foi possível gerar o PDF para compartilhamento.",
    );
    expect(result.current.isSharing).toBe(false);
    errorSpy.mockRestore();
  });

  it("trata falhas ao abrir a gaveta de compartilhamento", async () => {
    jest.mocked(Sharing.shareAsync).mockRejectedValue(new Error("falha share"));
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const { result } = renderHook(() => useSharePdf());

    await act(async () => {
      await result.current.shareAvaliacaoPdf(input);
    });

    expect(showError).toHaveBeenCalledWith(
      "Não foi possível gerar o PDF para compartilhamento.",
    );
    expect(result.current.isSharing).toBe(false);
    errorSpy.mockRestore();
  });
});
