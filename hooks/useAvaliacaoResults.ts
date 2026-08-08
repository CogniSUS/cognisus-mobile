import {
  AvaliacaoResult,
  AvaliacaoTestMeemRepository,
} from "@/database/repositories/AvaliacaoTestMeemRepository";
import { useEffect, useState } from "react";

export function useAvaliacaoResult(id: string) {
  const [loading, setLoading] = useState(true);
  const [resultado, setResultado] = useState<AvaliacaoResult | null>(null);

  useEffect(() => {
    async function fetchResultado() {
      try {
        setLoading(true);
        const data = await AvaliacaoTestMeemRepository.buscarAvaliacaoPorId(
          Number(id),
        );
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
