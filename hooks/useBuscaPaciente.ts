import { PacienteRepository } from "@/database/repositories/PatientRepository";
import { useToast } from "@/hooks/useToast";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useRef, useState } from "react";

type PacienteBusca = {
  id: number;
  nome_completo: string;
  cpf: string;
  data_nascimento: string;
  sexo: "masculino" | "feminino" | "outro";
  escolaridade_nome: string | null;
  ultima_avaliacao: string | null;
};

export function useBuscaPaciente() {
  const [cpfBusca, setCpfBusca] = useState("");
  const [buscandoPaciente, setBuscandoPaciente] = useState(false);
  const [pacienteEncontrado, setPacienteEncontrado] =
    useState<PacienteBusca | null>(null);
  const [pacienteNaoEncontrado, setPacienteNaoEncontrado] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { success: showError } = useToast();

  const limparBuscaPaciente = useCallback(() => {
    setCpfBusca("");
    setPacienteEncontrado(null);
    setPacienteNaoEncontrado(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      limparBuscaPaciente();
    }, [limparBuscaPaciente]),
  );

  useEffect(() => {
    const cpfNumeros = cpfBusca.replace(/\D/g, "");

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!cpfNumeros || cpfNumeros.length < 11) {
      setPacienteEncontrado(null);
      setPacienteNaoEncontrado(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        setBuscandoPaciente(true);
        setPacienteEncontrado(null);
        setPacienteNaoEncontrado(false);

        const paciente =
          await PacienteRepository.buscarPorCpfComEscolaridadeEAvaliacao(
            cpfNumeros,
          );

        if (!paciente) {
          setPacienteNaoEncontrado(true);
        } else {
          setPacienteEncontrado(paciente);
        }
      } catch (error) {
        console.log("Erro ao buscar paciente:", error);
        showError("Erro ao buscar paciente.");
      } finally {
        setBuscandoPaciente(false);
      }
    }, 350);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [cpfBusca, showError]);

  return {
    cpfBusca,
    setCpfBusca,
    buscandoPaciente,
    pacienteEncontrado,
    pacienteNaoEncontrado,
    limparBuscaPaciente,
  };
}
