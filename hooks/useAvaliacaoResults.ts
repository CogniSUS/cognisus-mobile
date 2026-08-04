import { getDB } from "@/database/database";
import { useEffect, useState } from "react";

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

export function useAvaliacaoResult(id: string) {
  const [loading, setLoading] = useState(true);
  const [resultado, setResultado] = useState<AvaliacaoResult | null>(null);

  useEffect(() => {
    async function fetchResultado() {
      try {
        const db = await getDB();

        const query = `
          SELECT 
            a.*, 
            p.nome_completo as paciente_nome, 
            i.nome as instrumento_nome 
          FROM avaliacao_teste_meem a
          JOIN paciente p ON a.id_paciente = p.id
          JOIN instrumento_avaliacao i ON a.id_instrumento = i.id
          WHERE a.id = ? 
          LIMIT 1
        `;

        const data = await db.getFirstAsync<AvaliacaoResult>(query, [
          Number(id),
        ]);
        setResultado(data);
      } catch (error) {
        console.error("Erro ao carregar resultado:", error);
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchResultado();
  }, [id]);

  return { resultado, loading };
}
