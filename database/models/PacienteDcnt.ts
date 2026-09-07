import { Model } from "@nozbe/watermelondb";
import { date, relation } from "@nozbe/watermelondb/decorators";

export class PacienteDcnt extends Model {
  static table = "paciente_dcnt";

  @date("created_at") createdAt!: Date;
  @date("updated_at") updatedAt?: Date;
  @date("deleted_at") deletedAt?: Date;

  // Relacionamentos para as chaves estrangeiras
  @relation("paciente", "id_paciente") paciente!: any;
  @relation("dcnt", "id_dcnt") dcnt!: any;
}
