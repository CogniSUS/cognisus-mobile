import { Q } from "@nozbe/watermelondb";
import { Instrument } from "../../types/instrument";
import { InstrumentoAvaliacao } from "../models/InstrumentoAvaliacao";
import { BaseRepository } from "./BaseRepository";

class InstrumentoAvaliacaoRepositoryImpl extends BaseRepository<InstrumentoAvaliacao> {
  constructor() {
    super("instrumento_avaliacao");
  }

  async listarAtivos(): Promise<Instrument[]> {
    try {
      const instrumentos = await this.collection
        .query(Q.where("status", true), Q.sortBy("nome", Q.asc))
        .fetch();

      return instrumentos.map((inst) => ({
        id: inst.id,
        nome: inst.nome,
        abreviacao: inst.abreviacao,
        tempo_estimado_min: inst.tempoEstimadoMin,
        versao: inst.versao,
        status: inst.status ? 1 : 0,
      })) as unknown as Instrument[];
    } catch (error) {
      console.error("Erro ao buscar instrumentos ativos:", error);
      return [];
    }
  }

  async buscarInstrumentoPorId(id: string): Promise<Instrument | null> {
    try {
      const inst = await this.collection.find(id);

      return {
        id: inst.id,
        nome: inst.nome,
        abreviacao: inst.abreviacao,
        tempo_estimado_min: inst.tempoEstimadoMin,
        versao: inst.versao,
        status: inst.status ? 1 : 0,
      } as unknown as Instrument;
    } catch (error) {
      console.error("Erro ao buscar instrumento por ID:", error);
      return null;
    }
  }
}

export const InstrumentoAvaliacaoRepository =
  new InstrumentoAvaliacaoRepositoryImpl();
