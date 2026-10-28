import { database } from "@/database/database";
import { AvaliacaoTestMeemRepository } from "./AvaliacaoTestMeemRepository";

jest.mock("@/database/database", () => ({
  database: { collections: { get: jest.fn() } },
}));

describe("AvaliacaoTestMeemRepository", () => {
  const collection = { find: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(database.collections.get).mockReturnValue(collection as never);
  });

  it("mapeia os dados e relacionamentos da avaliação", async () => {
    collection.find.mockResolvedValue({
      id: "avaliacao-1",
      dataInicio: "2025-06-15",
      scoreTotal: 27,
      classificacao: "Normal",
      scoreOrientacaoEspacial: 5,
      scoreOrientacaoTemporal: 5,
      scoreMemoriaRecente: 3,
      scoreMemoriaImediata: 3,
      scoreAtencao: 4,
      scoreLinguagem: 6,
      scoreVisuoespacial: 1,
      justificativaAlteracao: "",
      paciente: { fetch: jest.fn().mockResolvedValue({ nomeCompleto: "Maria" }) },
      instrumento: { fetch: jest.fn().mockResolvedValue({ nome: "MEEM" }) },
      unidadeSaude: { fetch: jest.fn().mockResolvedValue({ nome: "Central" }) },
    });

    await expect(
      AvaliacaoTestMeemRepository.buscarAvaliacaoPorId("avaliacao-1"),
    ).resolves.toEqual({
      id: "avaliacao-1",
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
    });
  });

  it("usa unidade padrão quando a relação de unidade não existe", async () => {
    collection.find.mockResolvedValue({
      id: "avaliacao-2",
      dataInicio: "2025-06-15",
      scoreTotal: 0,
      classificacao: "Possível Déficit Cognitivo",
      scoreOrientacaoEspacial: 0,
      scoreOrientacaoTemporal: 0,
      scoreMemoriaRecente: 0,
      scoreMemoriaImediata: 0,
      scoreAtencao: 0,
      scoreLinguagem: 0,
      scoreVisuoespacial: 0,
      justificativaAlteracao: "revisão clínica",
      paciente: { fetch: jest.fn().mockResolvedValue({ nomeCompleto: "João" }) },
      instrumento: { fetch: jest.fn().mockResolvedValue({ nome: "MEEM" }) },
      unidadeSaude: null,
    });

    const resultado = await AvaliacaoTestMeemRepository.buscarAvaliacaoPorId(
      "avaliacao-2",
    );

    expect(resultado?.unidade_nome).toBe("Não informada");
    expect(resultado?.justificativa_alteracao).toBe("revisão clínica");
  });

  it("conserva unidade padrão se a relação retorna nulo ou falha", async () => {
    const avaliacao = {
      id: "avaliacao-3",
      dataInicio: "2025-06-15",
      scoreTotal: 10,
      classificacao: "Possível Déficit Cognitivo",
      scoreOrientacaoEspacial: 1,
      scoreOrientacaoTemporal: 1,
      scoreMemoriaRecente: 1,
      scoreMemoriaImediata: 1,
      scoreAtencao: 1,
      scoreLinguagem: 1,
      scoreVisuoespacial: 1,
      justificativaAlteracao: null,
      paciente: { fetch: jest.fn().mockResolvedValue({ nomeCompleto: "João" }) },
      instrumento: { fetch: jest.fn().mockResolvedValue({ nome: "MEEM" }) },
      unidadeSaude: { fetch: jest.fn().mockResolvedValue(null) },
    };
    collection.find.mockResolvedValue(avaliacao);

    await expect(
      AvaliacaoTestMeemRepository.buscarAvaliacaoPorId("avaliacao-3"),
    ).resolves.toMatchObject({ unidade_nome: "Não informada" });

    avaliacao.unidadeSaude.fetch.mockRejectedValue(new Error("relação ausente"));
    await expect(
      AvaliacaoTestMeemRepository.buscarAvaliacaoPorId("avaliacao-3"),
    ).resolves.toMatchObject({ unidade_nome: "Não informada" });
  });

  it("retorna nulo e registra o erro quando a avaliação não existe", async () => {
    collection.find.mockRejectedValue(new Error("não encontrado"));
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    await expect(
      AvaliacaoTestMeemRepository.buscarAvaliacaoPorId("inexistente"),
    ).resolves.toBeNull();
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
