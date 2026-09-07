import { Model } from "@nozbe/watermelondb";
import { date, text } from "@nozbe/watermelondb/decorators";

export class Profissional extends Model {
  static table = "profissional";

  @text("user_id") userId!: string;
  @text("nome_completo") nomeCompleto!: string;
  @text("cpf") cpf!: string;
  @text("email") email!: string;

  @date("created_at") createdAt!: Date;
  @date("updated_at") updatedAt!: Date;
  @date("deleted_at") deletedAt?: Date;
}
