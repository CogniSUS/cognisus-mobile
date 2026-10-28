import { database } from "@/database/database";
import { Model } from "@nozbe/watermelondb";
import { BaseRepository } from "./BaseRepository";

jest.mock("@/database/database", () => ({
  database: { collections: { get: jest.fn() } },
}));

class TestRepository extends BaseRepository<Model> {
  constructor() {
    super("items");
  }
}

describe("BaseRepository", () => {
  const repository = new TestRepository();
  const fetch = jest.fn();
  const find = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(database.collections.get).mockReturnValue({
      query: () => ({ fetch }),
      find,
    } as never);
  });

  it("lista todos os modelos da coleção", async () => {
    const items = [{ id: "1" }, { id: "2" }];
    fetch.mockResolvedValue(items);

    await expect(repository.listarTodos()).resolves.toBe(items);
    expect(database.collections.get).toHaveBeenCalledWith("items");
  });

  it("busca um modelo pelo ID", async () => {
    const item = { id: "item-1" };
    find.mockResolvedValue(item);

    await expect(repository.buscarPorId("item-1")).resolves.toBe(item);
    expect(find).toHaveBeenCalledWith("item-1");
  });

  it("retorna nulo quando a busca por ID falha", async () => {
    find.mockRejectedValue(new Error("não encontrado"));

    await expect(repository.buscarPorId("inexistente")).resolves.toBeNull();
  });

  it("propaga falhas da consulta de listagem", async () => {
    fetch.mockRejectedValue(new Error("banco indisponível"));

    await expect(repository.listarTodos()).rejects.toThrow(
      "banco indisponível",
    );
  });
});
