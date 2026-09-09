import { Dcnt } from "@/database/models/Dcnt";
import { BaseRepository } from "./BaseRepository";

class DcntRepositoryImpl extends BaseRepository<Dcnt> {
  constructor() {
    super("dcnt");
  }
}
export const DcntRepository = new DcntRepositoryImpl();
