import { Dcnt } from "@/database/models/Dcnt";
import { Escolaridade } from "@/database/models/Escolaridade";
import { DcntRepository } from "@/database/repositories/DcntRepository";
import { EscolaridadeRepository } from "@/database/repositories/EscolaridadeRepository";
import { useEffect, useState } from "react";

export function useDominios() {
  const [listaEscolaridade, setListaEscolaridade] = useState<Escolaridade[]>(
    [],
  );
  const [listaDCNT, setListaDCNT] = useState<Dcnt[]>([]);

  useEffect(() => {
    async function carregarDados() {
      try {
        const escolaridades = await EscolaridadeRepository.listarTodos();
        const dcnts = await DcntRepository.listarTodos();
        setListaEscolaridade(escolaridades);
        setListaDCNT(dcnts);
      } catch (error) {
        console.error("Erro ao carregar domínios", error);
      }
    }
    carregarDados();
  }, []);

  return { listaEscolaridade, listaDCNT };
}
