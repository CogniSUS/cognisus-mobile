import { getDB } from "@/database/database";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Dimensions, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function ResultsPage(){
    const [cpfBusca, setCpfBusca] = useState("");
    const [loading, setLoading] = useState(false);
    async function getBuscarHistorico(){
      try {
        setLoading(true)
        const cpfLimpo = cpfBusca.replace(/\D/g, "")
        if(cpfLimpo.length!==11){
          return Alert.alert("Aviso", "CPF precisa ter 11 números")
        }

        const db = await getDB();
        const paciente = await db.getFirstAsync<{
          id: number
          nome_completo: string
          cpf: string
        }>(
          `SELECT id, nome_completo,cpf
          FROM paciente
          WHERE cpf =?`,
          [cpfLimpo]
        )
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
    return(
        <View style={styles.container}>
            <View style={styles.boxTop}>
              <Text style={styles.title}>Histórico do Paciente</Text>
              <Text style={styles.text}>Digite o CPF para acessar o histórico completo de avaliações</Text>  
            </View>
            <View style={styles.boxMid}>
              <View style={styles.boxInput}>
                <Ionicons name="search-outline" size={20} color="#94A3B8" />
                <TextInput
                  placeholder="Digite o CPF do paciente"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  value={cpfBusca}
                  style={styles.input}
                  maxLength={14}
                  onChangeText={
                    (text) => { let cpf = text.replace(/\D/g, ""); 
                    if (cpf.length > 3) {
                       cpf = cpf.replace(/(\d{3})(\d)/, "$1.$2"); 
                    } 
                    if (cpf.length > 7) { 
                      cpf = cpf.replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3");
                    } 
                    if (cpf.length > 11) { 
                      cpf = cpf.replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
                    } 
                    setCpfBusca(cpf); 
                    }}
                />
              </View>
              <TouchableOpacity style={styles.button} onPress={getBuscarHistorico}>
                {loading ?(
                  <ActivityIndicator color={"white"} size={"small"} />
                ):(
                  <Text style={styles.textButton}>Buscar Histórico</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.secundaryButton} onPress={()=>router.back()}>
                <Text style={styles.secundaryTextButton}>Voltar</Text>
              </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 24,
  },
  boxTop: {
    height: Dimensions.get("window").height / 4,
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-end"
  },
  boxMid: {
    height: Dimensions.get("window").height / 3,
    width: "100%",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },
  text: {
    fontSize: 12,
    color: "#64748B",
  },
  boxInput: {
    height: 50,
    width: "85%",
    alignSelf: "center",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 30,
    borderColor: "#732cad",
    flexDirection: "row",
    paddingHorizontal: -20,
  },
  input: {
    flex: 1,
    height: "100%",
    color: "#172033",
    fontSize: 16,
  },
  button: {
    height: 50,
    width: "85%",
    marginTop: 10,
    alignSelf: "center",
    backgroundColor: "#732cad",
    borderRadius: 20,
  },
  secundaryButton: {
    height: 50,
    width: "85%",
    marginTop: 10,
    alignSelf: "center",
    borderRadius: 20,
    borderColor: "#7a7a7a",
    borderWidth:1,
  },
  textButton: {
    fontSize: 20,
    fontWeight: "500",
    color: "#ffffff",
    alignSelf: "center",
    marginTop: 12,
  },
  secundaryTextButton: {
    fontSize: 20,
    fontWeight: "500",
    color: "#2e2d2d",
    alignSelf: "center",
    marginTop: 12,
  }
 
});