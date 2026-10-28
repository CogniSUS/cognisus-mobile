import { database } from "@/database/database";
import { supabase } from "@/utils/supabase";
import { synchronize } from "@nozbe/watermelondb/sync";
import { syncData } from "./initialSync";

jest.mock("@/database/database", () => ({ database: {} }));
jest.mock("@/utils/supabase", () => ({ supabase: { from: jest.fn() } }));
jest.mock("@nozbe/watermelondb/sync", () => ({ synchronize: jest.fn() }));

const tables = [
  "profissional",
  "escolaridade",
  "dcnt",
  "unidade_saude",
  "instrumento_avaliacao",
  "paciente",
  "paciente_dcnt",
  "avaliacao_teste_meem",
];

const synchronizeMock = synchronize as jest.Mock<any, any>;

let activeTable = "";
let pullResponse: { data: any[]; error: { message: string } | null } = {
  data: [],
  error: null,
};

const queryBuilder: any = {
  select: jest.fn(() => queryBuilder),
  gt: jest.fn(() => queryBuilder),
  insert: jest.fn(),
  upsert: jest.fn(),
  update: jest.fn(),
  then: (resolve: (value: typeof pullResponse) => unknown, reject: (error: unknown) => unknown) =>
    Promise.resolve(pullResponse).then(resolve, reject),
};

const eq = jest.fn();

describe("syncData", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    pullResponse = { data: [], error: null };
    activeTable = "";
    queryBuilder.select.mockImplementation(() => queryBuilder);
    queryBuilder.gt.mockImplementation(() => queryBuilder);
    queryBuilder.insert.mockResolvedValue({ error: null });
    queryBuilder.upsert.mockResolvedValue({ error: null });
    eq.mockResolvedValue({ error: null });
    queryBuilder.update.mockImplementation(() => ({ eq }));
    jest.mocked(supabase.from).mockImplementation(((table: string) => {
      activeTable = table;
      return queryBuilder;
    }) as never);
  });

  it("faz pull inicial e separa registros ativos de exclusões", async () => {
    let pullResultado:
      | { changes: Record<string, unknown>; timestamp: number }
      | undefined;
    synchronizeMock.mockImplementation(async (options: any) => {
      pullResultado = await options.pullChanges({ lastPulledAt: null });
    });
    jest.mocked(supabase.from).mockImplementation(((table: string) => {
      activeTable = table;
      pullResponse = {
        data: [
          { id: `${table}-ativo`, deleted_at: null, nome: "registro" },
          { id: `${table}-excluido`, deleted_at: "2025-01-01T00:00:00.000Z" },
        ],
        error: null,
      };
      return queryBuilder;
    }) as never);

    await syncData();

    expect(synchronize).toHaveBeenCalledWith(
      expect.objectContaining({ database, sendCreatedAsUpdated: true }),
    );
    expect(supabase.from).toHaveBeenCalledTimes(tables.length);
    expect(queryBuilder.gt).not.toHaveBeenCalled();
    expect(pullResultado).toMatchObject({
      changes: Object.fromEntries(
        tables.map((table) => [
          table,
          {
            created: [],
            updated: [{ id: `${table}-ativo`, deleted_at: null, nome: "registro" }],
            deleted: [`${table}-excluido`],
          },
        ]),
      ),
      timestamp: expect.any(Number),
    });
  });

  it("filtra alterações pelo horário do último pull", async () => {
    const lastPulledAt = Date.parse("2025-01-01T00:00:00.000Z");
    synchronizeMock.mockImplementation(async (options: any) => {
      await options.pullChanges({ lastPulledAt });
    });
    jest.mocked(supabase.from).mockImplementation(((table: string) => {
      activeTable = table;
      pullResponse = { data: [], error: null };
      return queryBuilder;
    }) as never);

    await syncData();

    expect(queryBuilder.gt).toHaveBeenCalledTimes(tables.length);
    expect(queryBuilder.gt).toHaveBeenCalledWith(
      "updated_at",
      "2025-01-01T00:00:00.000Z",
    );
  });

  it("lança erro contextual quando uma tabela falha no pull", async () => {
    synchronizeMock.mockImplementation(async (options: any) => {
      await options.pullChanges({ lastPulledAt: null });
    });
    jest.mocked(supabase.from).mockImplementation(((table: string) => {
      activeTable = table;
      pullResponse = {
        data: [],
        error: table === "dcnt" ? { message: "indisponível" } : null,
      };
      return queryBuilder;
    }) as never);
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    await expect(syncData()).rejects.toThrow(
      "Falha no Pull da tabela dcnt: indisponível",
    );
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it("limpa metadados locais, converte timestamps e envia criações, alterações e exclusões", async () => {
    const changes = {
      paciente: {
        created: [
          {
            id: "p-novo",
            nome: "Maria",
            _status: "created",
            _changed: "nome",
            sync_status: "pending",
            sync_error: null,
            created_at: 1735689600000,
            updated_at: "2025-01-02T00:00:00.000Z",
            deleted_at: null,
          },
        ],
        updated: [
          {
            id: "p-alterado",
            nome: "João",
            _status: "updated",
            _changed: "nome",
            sync_status: "pending",
            sync_error: "retry",
            created_at: "2025-01-01T00:00:00.000Z",
            updated_at: 1735776000000,
            deleted_at: 1735862400000,
          },
        ],
        deleted: ["p-excluido-1", "p-excluido-2"],
      },
    };
    synchronizeMock.mockImplementation(async (options: any) => {
      await options.pushChanges({ changes, lastPulledAt: null });
    });

    await syncData();

    expect(supabase.from).toHaveBeenCalledWith("paciente");
    expect(queryBuilder.insert).toHaveBeenCalledWith([
      {
        id: "p-novo",
        nome: "Maria",
        created_at: new Date(1735689600000).toISOString(),
        updated_at: "2025-01-02T00:00:00.000Z",
        deleted_at: null,
      },
    ]);
    expect(queryBuilder.upsert).toHaveBeenCalledWith([
      {
        id: "p-alterado",
        nome: "João",
        created_at: "2025-01-01T00:00:00.000Z",
        updated_at: new Date(1735776000000).toISOString(),
        deleted_at: new Date(1735862400000).toISOString(),
      },
    ]);
    expect(queryBuilder.update).toHaveBeenCalledTimes(2);
    expect(queryBuilder.update).toHaveBeenCalledWith({ deleted_at: expect.any(String) });
    expect(eq).toHaveBeenNthCalledWith(1, "id", "p-excluido-1");
    expect(eq).toHaveBeenNthCalledWith(2, "id", "p-excluido-2");
  });

  it("não chama o Supabase no push quando as listas estão vazias", async () => {
    synchronizeMock.mockImplementation(async (options: any) => {
      await options.pushChanges({
        changes: { paciente: { created: [], updated: [], deleted: [] } },
        lastPulledAt: null,
      });
    });

    await syncData();

    expect(supabase.from).not.toHaveBeenCalled();
  });

  it.each([
    ["insert", "Insert Falhou (paciente): rejeitado"],
    ["upsert", "Upsert Falhou (paciente): rejeitado"],
  ])("propaga falha de %s no push", async (operation, message) => {
    const changes = {
      paciente: {
        created: operation === "insert" ? [{ id: "p-1" }] : [],
        updated: operation === "upsert" ? [{ id: "p-1" }] : [],
        deleted: [],
      },
    };
    queryBuilder[operation as "insert" | "upsert"].mockResolvedValue({
      error: { message: "rejeitado" },
    });
    synchronizeMock.mockImplementation(async (options: any) => {
      await options.pushChanges({ changes, lastPulledAt: null });
    });
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    await expect(syncData()).rejects.toThrow(message);
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it("propaga falha ao marcar exclusão", async () => {
    eq.mockResolvedValue({ error: { message: "rejeitado" } });
    synchronizeMock.mockImplementation(async (options: any) => {
      await options.pushChanges({
        changes: { paciente: { created: [], updated: [], deleted: ["p-1"] } },
        lastPulledAt: null,
      });
    });
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    await expect(syncData()).rejects.toThrow("Delete Falhou (paciente): rejeitado");
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it("ignora uma segunda chamada enquanto outra sincronização está em andamento", async () => {
    let liberarSincronizacao: (() => void) | undefined;
    synchronizeMock.mockImplementation(
      () => new Promise<void>((resolve) => { liberarSincronizacao = resolve; }),
    );
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    const primeira = syncData();
    await Promise.resolve();
    await syncData();

    expect(synchronize).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith(
      "Sincronização já em andamento. Ignorando.",
    );
    liberarSincronizacao?.();
    await primeira;
    logSpy.mockRestore();
  });
});
