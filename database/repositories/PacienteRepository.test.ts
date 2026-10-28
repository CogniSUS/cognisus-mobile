import { database } from "@/database/database";
import { PacienteRepository } from "./PacienteRepository";

jest.mock("@/database/database", () => ({
  database: {
    collections: { get: jest.fn() },
    write: jest.fn(),
  },
}));

describe("PacienteRepository", () => {
  const patientFetch = jest.fn();
  const patientFetchCount = jest.fn();
  const patientFind = jest.fn();
  const patientCreate = jest.fn();
  const patientQuery = jest.fn();
  const dcntFetch = jest.fn();
  const dcntCreate = jest.fn();
  const dcntQuery = jest.fn();

  const patientCollection = {
    query: patientQuery,
    find: patientFind,
    create: patientCreate,
  };
  const dcntCollection = { query: dcntQuery, create: dcntCreate };

  beforeEach(() => {
    jest.clearAllMocks();
    patientQuery.mockReturnValue({
      fetch: patientFetch,
      fetchCount: patientFetchCount,
    });
    dcntQuery.mockReturnValue({ fetch: dcntFetch });
    jest.mocked(database.collections.get).mockImplementation((name) => {
      return (name === "paciente" ? patientCollection : dcntCollection) as never;
    });
    jest.mocked(database.write).mockImplementation(async (operation) => {
      await (operation as () => Promise<void>)();
    });
  });

  it("retorna nulo ou um resumo ao buscar paciente por CPF", async () => {
    patientFetch.mockResolvedValueOnce([]);
    await expect(PacienteRepository.buscarPorCpf("12345678901")).resolves.toBeNull();

    patientFetch.mockResolvedValueOnce([
      { id: "p-1", nomeCompleto: "Maria", cpf: "12345678901" },
    ]);
    await expect(
      PacienteRepository.buscarPorCpf("12345678901"),
    ).resolves.toEqual({
      id: "p-1",
      nome_completo: "Maria",
      cpf: "12345678901",
    });
  });

  it("mapeia escolaridade e data da última avaliação na busca por CPF", async () => {
    const patient = {
      id: "p-1",
      nomeCompleto: "Maria",
      cpf: "12345678901",
      dataNascimento: "1990-05-04",
      sexo: "feminino",
      nivelEscolaridade: {
        fetch: jest.fn().mockResolvedValue({ tipo: "5 a 8 anos" }),
      },
      avaliacoes: {
        extend: jest.fn().mockReturnValue({
          fetch: jest.fn().mockResolvedValue([
            { dataFim: "2025-02-01", dataInicio: "2025-01-30" },
          ]),
        }),
      },
    };
    patientFetch.mockResolvedValue([patient]);

    await expect(
      PacienteRepository.buscarPorCpfComEscolaridadeEAvaliacao("12345678901"),
    ).resolves.toEqual({
      id: "p-1",
      nome_completo: "Maria",
      cpf: "12345678901",
      data_nascimento: "1990-05-04",
      sexo: "feminino",
      escolaridade_nome: "5 a 8 anos",
      ultima_avaliacao: "2025-02-01",
    });
  });

  it("trata relações de escolaridade ausentes ou com erro e sem avaliações", async () => {
    const patient = {
      id: "p-2",
      nomeCompleto: "João",
      cpf: "00000000000",
      dataNascimento: "1980-01-01",
      sexo: "masculino",
      nivelEscolaridade: { fetch: jest.fn().mockRejectedValue(new Error("ausente")) },
      avaliacoes: {
        extend: jest.fn().mockReturnValue({ fetch: jest.fn().mockResolvedValue([]) }),
      },
    };
    patientFetch.mockResolvedValue([patient]);

    await expect(
      PacienteRepository.buscarPorCpfComEscolaridadeEAvaliacao("00000000000"),
    ).resolves.toMatchObject({ escolaridade_nome: null, ultima_avaliacao: null });

    patient.nivelEscolaridade = null as never;
    patient.avaliacoes.extend.mockReturnValue({
      fetch: jest.fn().mockResolvedValue([
        { dataFim: null, dataInicio: null, createdAt: new Date("2025-01-01") },
      ]),
    });
    await expect(
      PacienteRepository.buscarPorCpfComEscolaridadeEAvaliacao("00000000000"),
    ).resolves.toMatchObject({ ultima_avaliacao: "2025-01-01T00:00:00.000Z" });
  });

  it("retorna nulo quando a busca completa não encontra o paciente", async () => {
    patientFind.mockRejectedValue(new Error("não encontrado"));

    await expect(
      PacienteRepository.buscarPorIdComDetalhes("ausente"),
    ).resolves.toBeNull();
    expect(database.collections.get).not.toHaveBeenCalledWith("paciente_dcnt");
  });

  it("agrega DCNTs e a data da avaliação mais recente nos detalhes", async () => {
    const patient = {
      id: "p-3",
      nomeCompleto: "Ana",
      cpf: "11122233344",
      dataNascimento: "1975-08-12",
      sexo: "feminino",
      nivelEscolaridade: { fetch: jest.fn().mockResolvedValue({ tipo: "Analfabeto" }) },
      avaliacoes: {
        extend: jest.fn().mockReturnValue({
          fetch: jest.fn().mockResolvedValue([
            { dataFim: null, dataInicio: "2025-03-02" },
          ]),
        }),
      },
    };
    patientFind.mockResolvedValue(patient);
    dcntFetch.mockResolvedValue([
      { dcnt: { fetch: jest.fn().mockResolvedValue({ tipo: "Diabetes" }) } },
      { dcnt: { fetch: jest.fn().mockResolvedValue(null) } },
      { dcnt: { fetch: jest.fn().mockResolvedValue({ tipo: "Hipertensão" }) } },
    ]);

    await expect(
      PacienteRepository.buscarPorIdComDetalhes("p-3"),
    ).resolves.toEqual({
      id: "p-3",
      nome_completo: "Ana",
      cpf: "11122233344",
      data_nascimento: "1975-08-12",
      sexo: "feminino",
      escolaridade_nome: "Analfabeto",
      dcnts: "Diabetes, Hipertensão",
      ultima_avaliacao: "2025-03-02",
    });
  });

  it("retorna DCNT nulo e data de criação como fallback nos detalhes", async () => {
    patientFind.mockResolvedValue({
      id: "p-4",
      nomeCompleto: "Lucas",
      cpf: "99999999999",
      dataNascimento: "2000-01-01",
      sexo: "masculino",
      nivelEscolaridade: null,
      avaliacoes: {
        extend: jest.fn().mockReturnValue({
          fetch: jest.fn().mockResolvedValue([
            { dataFim: null, dataInicio: null, createdAt: new Date("2024-02-03") },
          ]),
        }),
      },
    });
    dcntFetch.mockResolvedValue([]);

    await expect(
      PacienteRepository.buscarPorIdComDetalhes("p-4"),
    ).resolves.toMatchObject({
      escolaridade_nome: null,
      dcnts: null,
      ultima_avaliacao: "2024-02-03T00:00:00.000Z",
    });
  });

  it.each([
    [0, false],
    [1, true],
  ])("indica se a contagem de CPFs é %s", async (count, exists) => {
    patientFetchCount.mockResolvedValue(count);

    await expect(
      PacienteRepository.verificarCpfExistente("12345678901"),
    ).resolves.toBe(exists);
  });

  it("cria paciente e vínculos DCNT dentro de uma escrita", async () => {
    const patientRecord = {
      id: "p-novo",
      nivelEscolaridade: { id: "" },
    };
    patientCreate.mockImplementation(async (build) => {
      build(patientRecord);
      return patientRecord;
    });
    const dcntRecords: unknown[] = [];
    dcntCreate.mockImplementation(async (build) => {
      const record = { paciente: { id: "" }, dcnt: { id: "" } };
      build(record);
      dcntRecords.push(record);
      return record;
    });

    await PacienteRepository.criarComTransacao({
      nome: "Maria",
      cpf: "12345678901",
      dataNascimento: "1990-05-04",
      sexo: "feminino",
      escolaridade: "esc-1",
      dcntsIds: ["dcnt-1", "dcnt-2"],
    });

    expect(database.write).toHaveBeenCalledTimes(1);
    expect(patientRecord.nivelEscolaridade.id).toBe("esc-1");
    expect(dcntRecords).toEqual([
      { paciente: { id: "p-novo" }, dcnt: { id: "dcnt-1" } },
      { paciente: { id: "p-novo" }, dcnt: { id: "dcnt-2" } },
    ]);
  });

  it("cria paciente sem escolaridade nem registros DCNT", async () => {
    patientCreate.mockImplementation(async (build) => {
      const record = { id: "p-simples", nivelEscolaridade: { id: "" } };
      build(record);
      return record;
    });

    await PacienteRepository.criarComTransacao({
      nome: "João",
      cpf: "12345678901",
      dataNascimento: "1980-01-01",
      sexo: "masculino",
      escolaridade: "",
      dcntsIds: [],
    });

    expect(database.collections.get).toHaveBeenCalledTimes(1);
    expect(dcntCreate).not.toHaveBeenCalled();
  });
});
