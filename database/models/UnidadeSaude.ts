import { Model } from "@nozbe/watermelondb";
import { date, text } from "@nozbe/watermelondb/decorators";

export class UnidadeSaude extends Model {
  static table = "unidade_saude";

  @text("nome") nome!: string;
  @text("endereco") endereco!: string;
  @text("cnes") cnes!: string;

  @date("created_at") createdAt!: Date;
  @date("updated_at") updatedAt!: Date;
  @date("deleted_at") deletedAt?: Date;
}
