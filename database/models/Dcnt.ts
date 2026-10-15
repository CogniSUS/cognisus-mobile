import { Model } from "@nozbe/watermelondb";
import { date, text } from "@nozbe/watermelondb/decorators";

export class Dcnt extends Model {
  static table = "dcnt";
  @text("tipo") tipo!: string;

  @date("created_at") createdAt!: Date;
  @date("updated_at") updatedAt!: Date;
  @date("deleted_at") deletedAt?: Date;
}
