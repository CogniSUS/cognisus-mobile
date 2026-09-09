import { Model } from "@nozbe/watermelondb";
import { date, field, relation, text } from "@nozbe/watermelondb/decorators";

export class AvaliacaoTesteMeem extends Model {
  static table = "avaliacao_teste_meem";

  @text("data_inicio") dataInicio!: string;
  @text("data_fim") dataFim?: string;

  @field("score_orientacao_espacial") scoreOrientacaoEspacial!: number;
  @field("score_atencao") scoreAtencao!: number;
  @field("score_linguagem") scoreLinguagem!: number;
  @field("score_visuoespacial") scoreVisuoespacial!: number;
  @field("score_memoria_recente") scoreMemoriaRecente!: number;
  @field("score_memoria_imediata") scoreMemoriaImediata!: number;
  @field("score_orientacao_temporal") scoreOrientacaoTemporal!: number;
  @field("score_total") scoreTotal!: number;

  @text("classificacao") classificacao!: string;

  @date("created_at") createdAt!: Date;
  @date("updated_at") updatedAt?: Date;
  @date("deleted_at") deletedAt?: Date;

  // Relacionamentos
  @relation("paciente", "id_paciente") paciente!: any;
  @relation("profissional", "id_profissional") profissional!: any;
  @relation("instrumento_avaliacao", "id_instrumento") instrumento!: any;
  @relation("unidade_saude", "unidade_saude") unidadeSaude!: any;
}
