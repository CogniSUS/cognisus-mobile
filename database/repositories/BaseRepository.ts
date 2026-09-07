import { database } from "@/database/database";
import { Model } from "@nozbe/watermelondb";

export abstract class BaseRepository<T extends Model> {
  protected collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  protected get collection() {
    return database.collections.get<T>(this.collectionName);
  }

  async listarTodos(): Promise<T[]> {
    return await this.collection.query().fetch();
  }

  async buscarPorId(id: string): Promise<T | null> {
    try {
      return await this.collection.find(id);
    } catch (error) {
      return null;
    }
  }
}
