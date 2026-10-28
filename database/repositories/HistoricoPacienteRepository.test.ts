import { database } from "@/database/database";
import { HistoricoPacienteRepository } from "./HistoricoPacienteRepository";

jest.mock("@/database/database", () => ({
  database: { collections: { get: jest.fn() } },
}));

describe("HistoricoPacienteRepository", () => {
  const fetch = jest.fn();
  const query = jest.fn(() => ({ fetch }));
  const collection = { query };

  beforeEach(() => {
    jest.clearAllMocks();
    query.mockReturnValue({ fetch });
    jest.mocked(database.collections.get).mockReturnValue(collection as never);
  });

  it("mapeia relações, escolhe datas e ordena avaliações da mais recente", async () => {
    fetch.mockResolvedValue([
      {
        id: "av-mais-antiga",
        instrumento: null,
        dataFim: null,
        dataInicio: "2025-01-01T10:00:00.000Z",
        scoreTotal: 20,
        classificacao: "Sem alteração",
      },
      {
        id: "av-mais-recente",
        instrumento: {
          fetch: jest.fn().mockResolvedValue({
            id: "instrumento-1",
            nome: "Mini Exame do Estado Mental",
            abreviacao: "",
          }),
        },
        dataFim: "2025-03-01T10:00:00.000Z",
        dataInicio: "2025-02-28T10:00:00.000Z",
        scoreTotal: 28,
        classificacao: "Normal",
      },
      {
        id: "av-meio",
        instrumento: {
          fetch: jest.fn().mockResolvedValue(null),
        },
        dataFim: "2025-02-01T10:00:00.000Z",
        dataInicio: "2025-01-31T10:00:00.000Z",
        scoreTotal: 10,
        classificacao: "Possível Déficit Cognitivo",
      },
    ]);

    await expect(
      HistoricoPacienteRepository.buscarHistorico("paciente-1"),
    ).resolves.toEqual([
      {
        id: "av-mais-recente",
        patientId: "paciente-1",
        instrumentId: "instrumento-1",
        testName: "Mini Exame do Estado Mental",
        testAbbreviation: "MEEM",
        date: "2025-03-01T10:00:00.000Z",
        score: 28,
        maxScore: 30,
        classification: "Normal",
        status: "normal",
      },
      {
        id: "av-meio",
        patientId: "paciente-1",
        instrumentId: "",
        testName: "Desconhecido",
        testAbbreviation: "MEEM",
        date: "2025-02-01T10:00:00.000Z",
        score: 10,
        maxScore: 30,
        classification: "Possível Déficit Cognitivo",
        status: "alterado",
      },
      {
        id: "av-mais-antiga",
        patientId: "paciente-1",
        instrumentId: "",
        testName: "Desconhecido",
        testAbbreviation: "MEEM",
        date: "2025-01-01T10:00:00.000Z",
        score: 20,
        maxScore: 30,
        classification: "Sem alteração",
        status: "normal",
      },
    ]);
    expect(database.collections.get).toHaveBeenCalledWith("avaliacao_teste_meem");
  });

  it.each(["Sem alteração", "Sem alteracao", "NORMAL"]) (
    "normaliza a classificação %s para status normal",
    async (classificacao) => {
      fetch.mockResolvedValue([
        {
          id: "av-1",
          instrumento: null,
          dataFim: "2025-01-01T10:00:00.000Z",
          dataInicio: "2025-01-01T09:00:00.000Z",
          scoreTotal: 20,
          classificacao,
        },
      ]);

      const historico = await HistoricoPacienteRepository.buscarHistorico(
        "paciente-1",
      );

      expect(historico[0].status).toBe("normal");
    },
  );

  it("usa nome padrão e segue retornando histórico se a relação falhar", async () => {
    fetch.mockResolvedValue([
      {
        id: "av-1",
        instrumento: { fetch: jest.fn().mockRejectedValue(new Error("ausente")) },
        dataFim: "2025-01-01T10:00:00.000Z",
        dataInicio: "2025-01-01T09:00:00.000Z",
        scoreTotal: 20,
        classificacao: "Normal",
      },
    ]);
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    const historico = await HistoricoPacienteRepository.buscarHistorico(
      "paciente-1",
    );

    expect(historico[0]).toMatchObject({
      testName: "Desconhecido",
      testAbbreviation: "MEEM",
      instrumentId: "",
    });
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it("retorna lista vazia quando a consulta local falha", async () => {
    fetch.mockRejectedValue(new Error("banco indisponível"));
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    await expect(
      HistoricoPacienteRepository.buscarHistorico("paciente-1"),
    ).resolves.toEqual([]);
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
