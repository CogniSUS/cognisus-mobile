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
        setLoading(false);
        info("CPF precisa ter 11 números");
        return;
      }

      const paciente = await PacienteRepository.buscarPorCpf(cpfLimpo);

      if (!paciente) {
        setLoading(false);
        error("Paciente não encontrado");
        return;
      }
      //funcionalidade ainda não implementada
      //é necessario a tela de histórico do paciente
      router.push("/(app)/informations");
    } catch (err) {
      console.log(err);
      error("Ocorreu um erro ");
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
