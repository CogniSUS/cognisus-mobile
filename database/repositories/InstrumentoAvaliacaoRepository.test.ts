import { database } from "@/database/database";
import { InstrumentoAvaliacaoRepository } from "./InstrumentoAvaliacaoRepository";

jest.mock("@/database/database", () => ({
  database: { collections: { get: jest.fn() } },
}));

describe("InstrumentoAvaliacaoRepository", () => {
  const fetch = jest.fn();
  const find = jest.fn();
  const collection = {
    query: jest.fn(() => ({ fetch })),
    find,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(database.collections.get).mockReturnValue(collection as never);
  });

  it("mapeia os instrumentos ativos para o formato público", async () => {
    fetch.mockResolvedValue([
      {
        id: "meem",
        nome: "MEEM",
        abreviacao: "MEEM",
        tempoEstimadoMin: 15,
        versao: "1",
        status: true,
      },
      {
        id: "moca",
        nome: "MoCA",
        abreviacao: "MoCA",
        tempoEstimadoMin: 20,
        versao: "2",
        status: false,
      },
    ]);

    await expect(InstrumentoAvaliacaoRepository.listarAtivos()).resolves.toEqual([
      {
        id: "meem",
        nome: "MEEM",
        abreviacao: "MEEM",
        tempo_estimado_min: 15,
        versao: "1",
        status: 1,
      },
      {
        id: "moca",
        nome: "MoCA",
        abreviacao: "MoCA",
        tempo_estimado_min: 20,
        versao: "2",
        status: 0,
      },
    ]);
  });

  it("retorna lista vazia e registra falha ao listar", async () => {
    fetch.mockRejectedValue(new Error("banco indisponível"));
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    await expect(InstrumentoAvaliacaoRepository.listarAtivos()).resolves.toEqual(
      [],
    );
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it("mapeia um instrumento encontrado pelo ID", async () => {
    find.mockResolvedValue({
      id: "meem",
      nome: "MEEM",
      abreviacao: "MEEM",
      tempoEstimadoMin: 15,
      versao: "1",
      status: false,
    });

    await expect(
      InstrumentoAvaliacaoRepository.buscarInstrumentoPorId("meem"),
    ).resolves.toEqual({
      id: "meem",
      nome: "MEEM",
      abreviacao: "MEEM",
      tempo_estimado_min: 15,
      versao: "1",
      status: 0,
    });
  });

  it("retorna nulo e registra falha ao buscar por ID", async () => {
    find.mockRejectedValue(new Error("não encontrado"));
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    await expect(
      InstrumentoAvaliacaoRepository.buscarInstrumentoPorId("ausente"),
    ).resolves.toBeNull();
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
