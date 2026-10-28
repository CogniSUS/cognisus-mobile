import { database } from "@/database/database";
import { DcntRepository } from "./DcntRepository";
import { EscolaridadeRepository } from "./EscolaridadeRepository";
import { UnidadeSaudeRepository } from "./UnidadeSaude";

jest.mock("@/database/database", () => ({
  database: { collections: { get: jest.fn() } },
}));

describe("repositórios de domínio simples", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(database.collections.get).mockImplementation(((table: string) => ({
      query: () => ({ fetch: async () => [{ id: `${table}-1` }] }),
    })) as never);
  });

  it.each([
    ["dcnt", DcntRepository],
    ["escolaridade", EscolaridadeRepository],
    ["unidade_saude", UnidadeSaudeRepository],
  ])("lista itens da coleção %s", async (table, repository) => {
    await expect(repository.listarTodos()).resolves.toEqual([
      { id: `${table}-1` },
    ]);
    expect(database.collections.get).toHaveBeenCalledWith(table);
  });
});
