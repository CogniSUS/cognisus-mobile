import { BaseRepository } from "./BaseRepository";

export type Escolaridade = { id: number; tipo: string };

class EscolaridadeRepositoryImpl extends BaseRepository<Escolaridade> {
  constructor() {
    super("escolaridade");
  }
}

export const EscolaridadeRepository = new EscolaridadeRepositoryImpl();
