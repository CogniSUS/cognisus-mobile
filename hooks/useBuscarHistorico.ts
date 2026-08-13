import { PacienteRepository } from "@/database/repositories/PatientRepository";
import { router } from "expo-router";
import { useState } from "react";
import { useToast } from "./useToast";

export function useBuscaHistorico() {
  const [cpfBusca, setCpfBusca] = useState("");
  const { info, error } = useToast();
  const [loading, setLoading] = useState(false);
  async function getBuscarHistorico() {
    try {
      setLoading(true);
      const cpfLimpo = cpfBusca.replace(/\D/g, "");

      if (cpfLimpo.length !== 11) {
        info("CPF precisa ter 11 números");
        return;
      }

      const paciente =
        await PacienteRepository.buscarPorCpf(cpfLimpo);

      if (!paciente) {
        error("Paciente não encontrado");
        return;
      }

      router.push({
        pathname: "/results/history",
        params: {
          patientId: String(paciente.id),
        },
      });
    } catch (err) {
      console.error("Erro ao buscar histórico:", err);
      error("Ocorreu um erro ao buscar o histórico");
    } finally {
      setLoading(false);
    }
  }

  return {
    cpfBusca,
    setCpfBusca,
    loading,
    getBuscarHistorico,
  };
}
