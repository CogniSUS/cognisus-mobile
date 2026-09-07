import {
  PacienteDetalhes,
  PacienteRepository,
} from "@/database/repositories/PacienteRepository";
import { useEffect, useState } from "react";

export function usePacienteInformation(pacienteId: string | null) {
  const [paciente, setPaciente] = useState<PacienteDetalhes | null>(null);

  const [loading, setLoading] = useState(true);

  async function carregarPaciente() {
    if (!pacienteId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const resultado =
        await PacienteRepository.buscarPorIdComDetalhes(pacienteId);

      setPaciente(resultado);
    } catch (error) {
      console.error("Erro ao carregar paciente:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarPaciente();
  }, [pacienteId]);

  return {
    paciente,
    loading,
  };
}
