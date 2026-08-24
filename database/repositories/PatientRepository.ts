import { getDB } from "@/database/database";
import { BaseRepository } from "./BaseRepository";

type CriarPacienteDTO = {
  nome: string;
  cpf: string;
  dataNascimento: string;
  sexo: string;
  escolaridade: string;
  dcntsIds: number[];
};

type PacienteBusca = {
  id: number;
  nome_completo: string;
  cpf: string;
  data_nascimento: string;
  sexo: "masculino" | "feminino" | "outro";
  escolaridade_nome: string | null;
  ultima_avaliacao: string | null;
};
export interface AvaliacaoResult {
  id: number;
  data_inicio: string;
  score_total: number;
  classificacao: string;
  score_orientacao_espacial: number;
  score_orientacao_temporal: number;
  score_memoria_recente: number;
  score_memoria_imediata: number;
  score_atencao: number;
  score_linguagem: number;
  score_visuoespacial: number;
  paciente_nome: string;
  instrumento_nome: string;
}

type PacienteResumo = {
  id: number;
  nome_completo: string;
  cpf: string;
};

export type PacienteDetalhes = {
  id: number;
  nome_completo: string;
  cpf: string;
  data_nascimento: string;
  sexo: "masculino" | "feminino" | "outro";
  escolaridade_nome: string | null;
  dcnts: string | null;
  ultima_avaliacao: string | null;
};

class PacienteRepositoryImpl extends BaseRepository<PacienteBusca> {
  constructor() {
    super("paciente");
  }

  async buscarPorCpf(cpfNumeros: string): Promise<PacienteResumo | null> {
    const db = await getDB();
    const paciente = await db.getFirstAsync<PacienteResumo>(
      `SELECT id, nome_completo, cpf
       FROM paciente
       WHERE cpf = ?`,
      [cpfNumeros],
    );
    return paciente ?? null;
  }

  async buscarPorCpfComEscolaridadeEAvaliacao(
    cpfNumeros: string,
  ): Promise<PacienteBusca | null> {
    const db = await getDB();

    return await db.getFirstAsync<PacienteBusca>(
      `
      SELECT
        p.id, p.nome_completo, p.cpf, p.data_nascimento, p.sexo,
        e.tipo AS escolaridade_nome,
        (
          SELECT COALESCE(a.data_fim, a.data_inicio, a.created_at)
          FROM avaliacao_teste_meem a
          WHERE a.id_paciente = p.id AND a.deleted_at IS NULL
          ORDER BY datetime(COALESCE(a.data_fim, a.data_inicio, a.created_at)) DESC
          LIMIT 1
        ) AS ultima_avaliacao
      FROM paciente p
      LEFT JOIN escolaridade e ON e.id = p.escolaridade
      WHERE p.cpf = ? AND p.deleted_at IS NULL
      LIMIT 1
      `,
      [cpfNumeros],
    );
  }

  async buscarPorIdComDetalhes(
    pacienteId: number,
  ): Promise<PacienteDetalhes | null> {
    const db = await getDB();

    return await db.getFirstAsync<PacienteDetalhes>(
      `
      SELECT
        p.id,
        p.nome_completo,
        p.cpf,
        p.data_nascimento,
        p.sexo,

        e.tipo AS escolaridade_nome,

        (
          SELECT GROUP_CONCAT(d.tipo, ', ')
          FROM paciente_dcnt pd
          INNER JOIN dcnt d
            ON d.id = pd.id_dcnt
          WHERE pd.id_paciente = p.id
        ) AS dcnts,

        (
          SELECT COALESCE(
            a.data_fim,
            a.data_inicio,
            a.created_at
          )
          FROM avaliacao_teste_meem a
          WHERE a.id_paciente = p.id
            AND a.deleted_at IS NULL
          ORDER BY datetime(
            COALESCE(
              a.data_fim,
              a.data_inicio,
              a.created_at
            )
          ) DESC
          LIMIT 1
        ) AS ultima_avaliacao

      FROM paciente p

      LEFT JOIN escolaridade e
        ON e.id = p.escolaridade

      WHERE p.id = ?
        AND p.deleted_at IS NULL

      LIMIT 1
      `,
      [pacienteId],
    );
  }

  async verificarCpfExistente(cpfNumeros: string): Promise<boolean> {
    const db = await getDB();
    const result = await db.getFirstAsync<{ id: number }>(
      "SELECT id FROM paciente WHERE cpf = ? LIMIT 1",
      [cpfNumeros],
    );
    return !!result;
  }

  async criarComTransacao(dados: CriarPacienteDTO): Promise<void> {
    const db = await getDB();
    const dataAtual = new Date().toISOString();

    await db.withTransactionAsync(async () => {
      const resultado = await db.runAsync(
        `INSERT INTO paciente (created_at, sync_status, nome_completo, cpf, data_nascimento, sexo, escolaridade)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          dataAtual,
          "pending",
          dados.nome,
          dados.cpf,
          dados.dataNascimento,
          dados.sexo,
          dados.escolaridade,
        ],
      );

      const pacienteId = resultado.lastInsertRowId;

      for (const dcntId of dados.dcntsIds) {
        await db.runAsync(
          `INSERT INTO paciente_dcnt (created_at, sync_status, id_paciente, id_dcnt)
           VALUES (?, ?, ?, ?)`,
          [dataAtual, "pending", pacienteId, dcntId],
        );
      }
    });
  }
}

export const PacienteRepository = new PacienteRepositoryImpl();
