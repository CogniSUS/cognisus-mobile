import { AvaliacaoTesteMeem } from "@/database/models/AvaliacaoTesteMeem";
import { BaseRepository } from "./BaseRepository";

export interface AvaliacaoResult {
  id: string;
  data_inicio: string;
  score_total: number;
  classificacao: string;
  score_orientacao_espacial: number;
  score_orientacao_temporal: number;
  score_memoria_recente: number;
  score_memoria_imediata: number;
  score_atencao: number;
  score_linguagem: number;
  score_visuoespacial: number;
  paciente_nome: string;
  instrumento_nome: string;
  unidade_nome: string;
}

class AvaliacaoTestMeemRepositoryImpl extends BaseRepository<AvaliacaoTesteMeem> {
  constructor() {
    super("avaliacao_teste_meem");
  }

  async buscarAvaliacaoPorId(id: string): Promise<AvaliacaoResult | null> {
    try {
      // Usando diretamente o getter herdado do BaseRepository
      const avaliacao = await this.collection.find(id);

      const paciente = await avaliacao.paciente.fetch();
      const instrumento = await avaliacao.instrumento.fetch();

      let unidadeNome = "Não informada";
      if (avaliacao.unidadeSaude) {
        try {
          const unidade = await avaliacao.unidadeSaude.fetch();
          unidadeNome = unidade ? unidade.nome : unidadeNome;
        } catch (e) {}
      }

      return {
        id: avaliacao.id,
        data_inicio: avaliacao.dataInicio,
        score_total: avaliacao.scoreTotal,
        classificacao: avaliacao.classificacao,
        score_orientacao_espacial: avaliacao.scoreOrientacaoEspacial,
        score_orientacao_temporal: avaliacao.scoreOrientacaoTemporal,
        score_memoria_recente: avaliacao.scoreMemoriaRecente,
        score_memoria_imediata: avaliacao.scoreMemoriaImediata,
        score_atencao: avaliacao.scoreAtencao,
        score_linguagem: avaliacao.scoreLinguagem,
        score_visuoespacial: avaliacao.scoreVisuoespacial,
        paciente_nome: paciente.nomeCompleto,
        instrumento_nome: instrumento.nome,
        unidade_nome: unidadeNome,
      };
    } catch (error) {
      console.error(
        `Avaliação com ID ${id} não encontrada no banco local:`,
        error,
      );
      return null;
    }
  }
}

export const AvaliacaoTestMeemRepository =
  new AvaliacaoTestMeemRepositoryImpl();
