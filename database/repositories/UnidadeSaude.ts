import { UnidadeSaude } from "../models/UnidadeSaude";
import { BaseRepository } from "./BaseRepository";

class UnidadeSaudeRepositoryImpl extends BaseRepository<UnidadeSaude> {
  constructor() {
    super("unidade_saude");
  }
}

export const UnidadeSaudeRepository = new UnidadeSaudeRepositoryImpl();
