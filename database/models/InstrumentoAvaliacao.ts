import { Model } from "@nozbe/watermelondb";
import { date, field, text } from "@nozbe/watermelondb/decorators";

export class InstrumentoAvaliacao extends Model {
  static table = "instrumento_avaliacao";

  @text("nome") nome!: string;
  @field("status") status!: boolean;
  @text("versao") versao?: string;
  @text("abreviacao") abreviacao?: string;
  @field("tempo_estimado_min") tempoEstimadoMin?: number;

  @date("created_at") createdAt!: Date;
  @date("updated_at") updatedAt?: Date;
  @date("deleted_at") deletedAt?: Date;
}
