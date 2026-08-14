import { getDB } from "@/database/database";
import { CognitiveResult } from "@/types/result";

type MeemResultRow = {
  id: number;
  id_paciente: number;
  id_instrumento: number;
  nome_instrumento: string;
  abreviacao: string | null;
  data_inicio: string;
  data_fim: string | null;
  score_total: number;
  classificacao: string;
};

function normalizeStatus(
  classification: string,
): "normal" | "alterado" {
  const value = classification.toLowerCase();

  if (
    value.includes("normal") ||
    value.includes("sem alteração") ||
    value.includes("sem alteracao")
  ) {
    return "normal";
  }

  return "alterado";
}

export async function getPatientHistory(
  patientId: number,
): Promise<CognitiveResult[]> {
  const db = await getDB();

  const meemRows = await db.getAllAsync<MeemResultRow>(
    `
      SELECT
        a.id,
        a.id_paciente,
        a.id_instrumento,
        i.nome AS nome_instrumento,
        i.abreviacao,
        a.data_inicio,
        a.data_fim,
        a.score_total,
        a.classificacao
      FROM avaliacao_teste_meem a
      INNER JOIN instrumento_avaliacao i
        ON i.id = a.id_instrumento
      WHERE a.id_paciente = ?
        AND a.deleted_at IS NULL
      ORDER BY datetime(
        COALESCE(a.data_fim, a.data_inicio, a.created_at)
      ) DESC
    `,
    [patientId],
  );

  return meemRows.map((row) => ({
    id: row.id,
    patientId: row.id_paciente,
    instrumentId: row.id_instrumento,

    testName: row.nome_instrumento,
    testAbbreviation: row.abreviacao || "MEEM",

    date: row.data_fim || row.data_inicio,

    score: row.score_total,
    maxScore: 30,

    classification: row.classificacao,

    status: normalizeStatus(row.classificacao),
  }));
}