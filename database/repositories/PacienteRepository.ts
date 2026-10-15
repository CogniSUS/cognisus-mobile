import { database } from "@/database/database";
import { Paciente } from "@/database/models/Paciente";
import { PacienteDcnt } from "@/database/models/PacienteDcnt";
import { Q } from "@nozbe/watermelondb";
import { BaseRepository } from "./BaseRepository";

// 1. DTOs e Interfaces atualizadas (IDs mudaram de number para string)
type CriarPacienteDTO = {
  nome: string;
  cpf: string;
  dataNascimento: string;
  sexo: string;
  escolaridade: string;
  dcntsIds: string[]; // <-- Alterado de number[] para string[]
};

type PacienteBusca = {
  id: string; // <-- string
  nome_completo: string;
  cpf: string;
  data_nascimento: string;
  sexo: "masculino" | "feminino" | "outro" | string;
  escolaridade_nome: string | null;
  ultima_avaliacao: string | null;
};

export interface AvaliacaoResult {
  id: string; // <-- string
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
  id: string; // <-- string
  nome_completo: string;
  cpf: string;
};

export type PacienteDetalhes = {
  id: string; // <-- string
  nome_completo: string;
  cpf: string;
  data_nascimento: string;
  sexo: "masculino" | "feminino" | "outro" | string;
  escolaridade_nome: string | null;
  dcnts: string | null;
  ultima_avaliacao: string | null;
};

class PacienteRepositoryImpl extends BaseRepository<Paciente> {
  constructor() {
    super("paciente");
  }

  // ==========================================
  // BUSCA SIMPLES POR CPF
  // ==========================================
  async buscarPorCpf(cpfNumeros: string): Promise<PacienteResumo | null> {
    const resultados = await this.collection
      .query(Q.where("cpf", cpfNumeros))
      .fetch();

    if (resultados.length === 0) return null;
    const paciente = resultados[0];

    return {
      id: paciente.id,
      nome_completo: paciente.nomeCompleto,
      cpf: paciente.cpf,
    };
  }

  // ==========================================
  // BUSCA COM RELACIONAMENTOS (Escolaridade e Última Avaliação)
  // ==========================================
  async buscarPorCpfComEscolaridadeEAvaliacao(
    cpfNumeros: string,
  ): Promise<PacienteBusca | null> {
    const resultados = await this.collection
      .query(Q.where("cpf", cpfNumeros))
      .fetch();

    if (resultados.length === 0) return null;
    const paciente = resultados[0];

    // Busca a escolaridade relacionada
    let escolaridadeNome = null;
    if (paciente.nivelEscolaridade) {
      try {
        const esc = await paciente.nivelEscolaridade.fetch();
        escolaridadeNome = esc ? esc.tipo : null;
      } catch (e) {}
    }

    // Busca apenas a última avaliação baseada na data de criação
    const avaliacoes = await paciente.avaliacoes
      .extend(Q.sortBy("created_at", Q.desc), Q.take(1))
      .fetch();

    let ultimaAvaliacaoData = null;
    if (avaliacoes.length > 0) {
      const a = avaliacoes[0];
      ultimaAvaliacaoData =
        a.dataFim || a.dataInicio || a.createdAt?.toISOString();
    }

    return {
      id: paciente.id,
      nome_completo: paciente.nomeCompleto,
      cpf: paciente.cpf,
      data_nascimento: paciente.dataNascimento,
      sexo: paciente.sexo,
      escolaridade_nome: escolaridadeNome,
      ultima_avaliacao: ultimaAvaliacaoData,
    };
  }

  // ==========================================
  // BUSCA COMPLETA DE DETALHES (Com DCNTs)
  // ==========================================
  async buscarPorIdComDetalhes(
    pacienteId: string,
  ): Promise<PacienteDetalhes | null> {
    const paciente = await this.buscarPorId(pacienteId);
    if (!paciente) return null;

    let escolaridadeNome = null;
    if (paciente.nivelEscolaridade) {
      try {
        const esc = await paciente.nivelEscolaridade.fetch();
        escolaridadeNome = esc ? esc.tipo : null;
      } catch (e) {}
    }

    // Busca as DCNTs do paciente
    const pdCollection =
      database.collections.get<PacienteDcnt>("paciente_dcnt");
    const relacoesDcnt = await pdCollection
      .query(Q.where("id_paciente", paciente.id))
      .fetch();

    const dcntNomes = [];
    for (const relacao of relacoesDcnt) {
      const dcnt = await relacao.dcnt.fetch();
      if (dcnt) dcntNomes.push(dcnt.tipo);
    }
    const dcntsString = dcntNomes.length > 0 ? dcntNomes.join(", ") : null;

    // Busca a última avaliação
    const avaliacoes = await paciente.avaliacoes
      .extend(Q.sortBy("created_at", Q.desc), Q.take(1))
      .fetch();

    let ultimaAvaliacaoData = null;
    if (avaliacoes.length > 0) {
      const a = avaliacoes[0];
      ultimaAvaliacaoData =
        a.dataFim || a.dataInicio || a.createdAt?.toISOString();
    }

    return {
      id: paciente.id,
      nome_completo: paciente.nomeCompleto,
      cpf: paciente.cpf,
      data_nascimento: paciente.dataNascimento,
      sexo: paciente.sexo,
      escolaridade_nome: escolaridadeNome,
      dcnts: dcntsString,
      ultima_avaliacao: ultimaAvaliacaoData,
    };
  }

  // ==========================================
  // VERIFICAÇÃO SIMPLES
  // ==========================================
  async verificarCpfExistente(cpfNumeros: string): Promise<boolean> {
    const count = await this.collection
      .query(Q.where("cpf", cpfNumeros))
      .fetchCount();

    return count > 0;
  }

  // ==========================================
  // CRIAÇÃO COM TRANSAÇÃO (BATCH)
  // ==========================================
  async criarComTransacao(dados: CriarPacienteDTO): Promise<void> {
    await database.write(async () => {
      const novoPaciente = await this.collection.create((p) => {
        p.nomeCompleto = dados.nome;
        p.cpf = dados.cpf;
        p.dataNascimento = dados.dataNascimento;
        p.sexo = dados.sexo;

        if (dados.escolaridade) {
          p.nivelEscolaridade.id = dados.escolaridade;
        }
      });

      if (dados.dcntsIds && dados.dcntsIds.length > 0) {
        const pdCollection =
          database.collections.get<PacienteDcnt>("paciente_dcnt");

        for (const dcntId of dados.dcntsIds) {
          await pdCollection.create((pd) => {
            // Relacionando as chaves estrangeiras
            pd.paciente.id = novoPaciente.id;
            pd.dcnt.id = dcntId;
          });
        }
      }
    });
  }
}

export const PacienteRepository = new PacienteRepositoryImpl();
