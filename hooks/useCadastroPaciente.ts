import { PacienteRepository } from "@/database/repositories/PatientRepository";
import { useToast } from "@/hooks/useToast";
import { useState } from "react";

export function useCadastroPaciente(onSucesso: (cpf: string) => void) {
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [sexo, setSexo] = useState("");
  const [escolaridade, setEscolaridade] = useState("");
  const [dcntsSelecionadas, setDcntsSelecionadas] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const { success: showSuccess, error: showError, info: showInfo } = useToast();

  function limparCampos() {
    setNome("");
    setCpf("");
    setDataNascimento("");
    setSexo("");
    setEscolaridade("");
    setDcntsSelecionadas([]);
  }

  function toggleDcnt(id: number) {
    setDcntsSelecionadas((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      return [...prev, id];
    });
  }

  async function cadastrarPaciente() {
    try {
      setLoading(true);

      const cpfNumeros = cpf.replace(/\D/g, "");

      if (
        !nome ||
        !cpfNumeros ||
        !dataNascimento ||
        sexo === "" ||
        escolaridade === ""
      ) {
        setLoading(false);
        return showInfo("Preencha os campos obrigatórios");
      } else if (cpfNumeros.length !== 11) {
        setLoading(false);
        return showError("O CPF deve conter exatamente 11 dígitos");
      }

      const partesData = dataNascimento.split("/");

      if (partesData.length !== 3) {
        setLoading(false);
        return showError("Data de nascimento inválida");
      }

      const dia = partesData[0];
      const mes = partesData[1];
      const ano = partesData[2];

      if (dia.length !== 2 || mes.length !== 2 || ano.length !== 4) {
        setLoading(false);
        return showError("Data de nascimento inválida");
      }

      const dataFormatada = `${ano}-${mes}-${dia}`;

      if (Number(dia) > 31 || Number(mes) > 12) {
        setLoading(false);
        return showError("Data de nascimento inválida");
      }

      try {
        const pacienteExistente =
          await PacienteRepository.verificarCpfExistente(cpfNumeros);

        if (pacienteExistente) {
          setLoading(false);
          return showError("Este CPF já está cadastrado no sistema.");
        }

        await PacienteRepository.criarComTransacao({
          nome: nome,
          cpf: cpfNumeros,
          dataNascimento: dataFormatada,
          sexo: sexo,
          escolaridade: String(escolaridade),
          dcntsIds: dcntsSelecionadas,
        });

        showSuccess("Paciente cadastrado com sucesso!");
        limparCampos();

        onSucesso(cpf);
      } catch (dbError) {
        console.log("Erro no repositório:", dbError);
        showError("Erro interno ao salvar dados no banco local.");
      }
    } catch (err) {
      console.log("Erro inesperado:", err);
      showError("Ocorreu um erro inesperado ao cadastrar.");
    } finally {
      setLoading(false);
    }
  }

  return {
    nome,
    setNome,
    cpf,
    setCpf,
    dataNascimento,
    setDataNascimento,
    sexo,
    setSexo,
    escolaridade,
    setEscolaridade,
    dcntsSelecionadas,
    loading,
    limparCampos,
    toggleDcnt,
    cadastrarPaciente,
  };
}
