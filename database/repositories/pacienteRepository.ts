import { getDB } from "../database";

export default async function buscarPorCpf(cpf:string){


    const db = await getDB();
    const paciente = await db.getFirstAsync<{
          id: number
          nome_completo: string
          cpf: string
        }>(
          `SELECT id, nome_completo,cpf
          FROM paciente
          WHERE cpf =?`,
          [cpf]
        )

        return paciente ?? null

}