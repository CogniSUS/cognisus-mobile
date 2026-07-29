import { BaseRepository } from "./BaseRepository";

export type Dcnt = { id: number; tipo: string };

class DcntRepositoryImpl extends BaseRepository<Dcnt> {
  constructor() {
    super("dcnt");
  }
}
export const DcntRepository = new DcntRepositoryImpl();
