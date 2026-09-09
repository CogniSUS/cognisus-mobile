import { Model, Query } from "@nozbe/watermelondb";
import { children, date, relation, text } from "@nozbe/watermelondb/decorators";

export class Paciente extends Model {
  static table = "paciente";

  static associations = {
    avaliacao_teste_meem: { type: "has_many", foreignKey: "id_paciente" },
  } as const;

  @text("nome_completo") nomeCompleto!: string;
  @text("cpf") cpf!: string;
  @text("data_nascimento") dataNascimento!: string;
  @text("sexo") sexo!: string;

  @date("created_at") createdAt!: Date;
  @date("updated_at") updatedAt!: Date;
  @date("deleted_at") deletedAt?: Date;

  // Relação de Chave Estrangeira
  @relation("escolaridade", "escolaridade") nivelEscolaridade!: any;

  @children("avaliacao_teste_meem") avaliacoes!: Query<any>;
}
