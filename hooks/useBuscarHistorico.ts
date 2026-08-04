import buscarPorCpf from "@/database/repositories/pacienteRepository";
import { router } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

export function useBuscaHistorico(){
    const [cpfBusca, setCpfBusca] = useState("");
        const [loading, setLoading] = useState(false);
        async function getBuscarHistorico(){
          try {
            setLoading(true)
            const cpfLimpo = cpfBusca.replace(/\D/g, "")
            if(cpfLimpo.length!==11){
              return Alert.alert("Aviso", "CPF precisa ter 11 números")
            }
    
            const paciente = await buscarPorCpf(cpfLimpo)
            
            if(!paciente){
              return Alert.alert("Paciente não encontrado");
            }
            //funcionalidade ainda não implementada
            //é necessario a tela de histórico do paciente
            router.push("/(app)/informations")
          } catch (error) {
            console.log(error)
            Alert.alert("Ocorreu um erro ")
          } finally{
            setLoading(false)
          }
        }

        return{
            cpfBusca,
            setCpfBusca,
            loading,
            getBuscarHistorico
        }
}