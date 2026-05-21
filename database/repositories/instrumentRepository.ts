import { Instrument } from "../../types/instrument";
import { getDB } from "../database";

export async function getAllInstruments(): Promise<Instrument[]> {
  try {
    const db = await getDB();

    const result = await db.getAllAsync<Instrument>(`
            SELECT id, nome, abreviacao, tempo_estimado_min, versao, status
            FROM instrumento_avaliacao
            WHERE deleted_at IS NULL AND status = 1 ORDER BY nome ASC  
        `);
    return result || [];
  } catch (error) {
    console.error("Error fetching instruments:", error);
    return [];
  }
}

export async function getInstrumentById(
  id: number,
): Promise<Instrument | null> {
  try {
    const db = await getDB();

    const result = await db.getFirstAsync<Instrument>(
      `SELECT id, nome, abreviacao, tempo_estimado_min, versao, status
       FROM instrumento_avaliacao
       WHERE id = ? AND deleted_at IS NULL`,
      [id],
    );

    return result || null;
  } catch (error) {
    console.error("Erro ao buscar instrumento:", error);
    return null;
  }
}
