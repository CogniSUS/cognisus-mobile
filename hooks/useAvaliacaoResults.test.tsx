import { renderHook, waitFor } from "@testing-library/react-native";
import { AvaliacaoTestMeemRepository } from "@/database/repositories/AvaliacaoTestMeemRepository";
import { useAvaliacaoResult } from "./useAvaliacaoResults";

jest.mock("@/database/repositories/AvaliacaoTestMeemRepository", () => ({
  AvaliacaoTestMeemRepository: { buscarAvaliacaoPorId: jest.fn() },
}));

describe("useAvaliacaoResult", () => {
  beforeEach(() => jest.clearAllMocks());

  it("não consulta o repositório sem um ID e encerra o carregamento", async () => {
    const { result } = renderHook(() => useAvaliacaoResult(""));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.resultado).toBeNull();
    expect(AvaliacaoTestMeemRepository.buscarAvaliacaoPorId).not.toHaveBeenCalled();
  });

  it("carrega e expõe o resultado encontrado", async () => {
    const resultado = {
      id: "av-1",
      data_inicio: "2025-06-15",
      score_total: 27,
      classificacao: "Normal",
      score_orientacao_espacial: 5,
      score_orientacao_temporal: 5,
      score_memoria_recente: 3,
      score_memoria_imediata: 3,
      score_atencao: 4,
      score_linguagem: 6,
      score_visuoespacial: 1,
      paciente_nome: "Maria",
      instrumento_nome: "MEEM",
      unidade_nome: "Central",
      justificativa_alteracao: null,
    };
    jest
      .mocked(AvaliacaoTestMeemRepository.buscarAvaliacaoPorId)
      .mockResolvedValue(resultado);

    const { result } = renderHook(() => useAvaliacaoResult("av-1"));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.resultado).toEqual(resultado);
    expect(AvaliacaoTestMeemRepository.buscarAvaliacaoPorId).toHaveBeenCalledWith(
      "av-1",
    );
  });

  it("mantém resultado vazio e encerra o loading quando a busca falha", async () => {
    jest
      .mocked(AvaliacaoTestMeemRepository.buscarAvaliacaoPorId)
      .mockRejectedValue(new Error("banco indisponível"));
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const { result } = renderHook(() => useAvaliacaoResult("av-inexistente"));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.resultado).toBeNull();
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
