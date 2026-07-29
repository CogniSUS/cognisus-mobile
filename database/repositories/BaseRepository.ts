import { getDB } from "@/database/database";

export abstract class BaseRepository<T> {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  async listarTodos(): Promise<T[]> {
    const db = await getDB();
    return await db.getAllAsync<T>(`SELECT * FROM ${this.tableName}`);
  }

  async buscarPorId(id: number): Promise<T | null> {
    const db = await getDB();
    return await db.getFirstAsync<T>(
      `SELECT * FROM ${this.tableName} WHERE id = ? LIMIT 1`,
      [id],
    );
  }
}
