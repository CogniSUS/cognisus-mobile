import { getDB } from "@/database/database";
import { BaseRepository } from "./BaseRepository";

export interface AvaliacaoResult {
  id: number;
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

class AvaliacaoTestMeemRepositoryImpl extends BaseRepository<AvaliacaoResult> {
  constructor() {
    super("avaliacao_teste_meem");
  }

  async buscarAvaliacaoPorId(id: number): Promise<AvaliacaoResult | null> {
    const db = await getDB();

    const query = `
      SELECT 
        a.*, 
        p.nome_completo as paciente_nome, 
        i.nome as instrumento_nome,
        u.nome as unidade_nome
      FROM avaliacao_teste_meem a
      JOIN paciente p ON a.id_paciente = p.id
      JOIN instrumento_avaliacao i ON a.id_instrumento = i.id
      LEFT JOIN unidade_saude u ON a.unidade_saude = u.id
      WHERE a.id = ? 
      LIMIT 1
    `;

    const data = await db.getFirstAsync<AvaliacaoResult>(query, [id]);
    return data ?? null;
  }
}

export const AvaliacaoTestMeemRepository =
  new AvaliacaoTestMeemRepositoryImpl();
