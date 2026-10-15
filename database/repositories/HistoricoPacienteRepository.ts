import { AvaliacaoTesteMeem } from "@/database/models/AvaliacaoTesteMeem";
import { CognitiveResult } from "@/types/result";
import { Q } from "@nozbe/watermelondb";
import { BaseRepository } from "./BaseRepository";

function normalizeStatus(classification: string): "normal" | "alterado" {
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

class HistoricoPacienteRepositoryImpl extends BaseRepository<AvaliacaoTesteMeem> {
  constructor() {
    super("avaliacao_teste_meem");
  }

  // O patientId agora é string
  async buscarHistorico(patientId: string): Promise<CognitiveResult[]> {
    try {
      // Busca todas as avaliações do paciente usando a query nativa do WatermelonDB
      const avaliacoes = await this.collection
        .query(Q.where("id_paciente", patientId))
        .fetch();

      const historico: CognitiveResult[] = [];

      for (const avaliacao of avaliacoes) {
        // Resolve o relacionamento com o instrumento (antigo INNER JOIN)
        let nomeInstrumento = "Desconhecido";
        let abreviacao = "MEEM";
        let instrumentoId = "";

        if (avaliacao.instrumento) {
          try {
            const instrumento = await avaliacao.instrumento.fetch();
            if (instrumento) {
              nomeInstrumento = instrumento.nome;
              abreviacao = instrumento.abreviacao || "MEEM";
              instrumentoId = instrumento.id;
            }
          } catch (e) {
            console.warn("Instrumento não encontrado localmente.");
          }
        }

        historico.push({
          id: avaliacao.id,
          patientId: patientId,
          instrumentId: instrumentoId,
          testName: nomeInstrumento,
          testAbbreviation: abreviacao,
          date: avaliacao.dataFim || avaliacao.dataInicio, // COALESCE simulado
          score: avaliacao.scoreTotal,
          maxScore: 30,
          classification: avaliacao.classificacao,
          status: normalizeStatus(avaliacao.classificacao),
        } as unknown as CognitiveResult); // Evita erro se a tipagem ainda tiver 'number'
      }

      // Replicando a ordenação exata do seu SQL (ORDER BY datetime(...) DESC)
      historico.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );

      return historico;
    } catch (error) {
      console.error("Erro ao buscar histórico do paciente:", error);
      return [];
    }
  }
}

export const HistoricoPacienteRepository =
  new HistoricoPacienteRepositoryImpl();
