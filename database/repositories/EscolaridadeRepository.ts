import { Escolaridade } from "@/database/models/Escolaridade";
import { BaseRepository } from "./BaseRepository";

class EscolaridadeRepositoryImpl extends BaseRepository<Escolaridade> {
  constructor() {
    super("escolaridade");
  }
}

export const EscolaridadeRepository = new EscolaridadeRepositoryImpl();
