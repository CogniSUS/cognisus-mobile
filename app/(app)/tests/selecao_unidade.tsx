import { getDB } from "@/database/database";
import {
  FontAwesome5
} from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
export default function SelecaoUnidade(){
  const [unidadeSaude, setUnidadeSaude] = useState("");
  const [listaUnidades, setListaUnidades] = useState<
  { id: number; nome: string }[]
  >([]);
  const [loading, setLoading] = useState(false);

  async function getUnidade(){
    try{
      setLoading(true);

      if (!unidadeSaude) {
        setLoading(false);
        return Alert.alert("Informe a unidade!");
      }

      await setTimeout(()=>{
        Alert.alert("Logado com sucesso")
        router.push("/tests/selection")
        setLoading(false)
      },3000)
    }
    catch(error){
      console.log(error)
      setLoading(false)
    }
  }

  async function carregarUnidade(){
    const db = await getDB();

    const dados = await db.getAllAsync<{
      id:number;
      nome:string;
    }>(
      "SELECT * FROM unidade_saude"
    )

    setListaUnidades(dados);
  }

  useEffect(() => {carregarUnidade();}, []);

    return(
        <View style = {style.container}>
            <View style = {style.boxMid}>
                <Text style = {style.primarytext }>
                  Confirmação de Local de Atendimento
                  </Text>
                  <Text style = {style.secondarytext}>
                      Por favor, confirme em qual unidade o teste será realizado.
                  </Text>
                  <View style={style.boxInput}>

                  <Picker
                    selectedValue={unidadeSaude}
                    onValueChange={(itemValue) => setUnidadeSaude(itemValue)}
                    style={style.picker}
                  >
                    <Picker.Item
                      label="Selecione uma unidade"
                      value=""
                    />

                    {
                      listaUnidades.map((item) => (
                        <Picker.Item
                          key={item.id}
                          label={item.nome}
                          value={item.id}
                        />
                      ))
                    }
                  </Picker>
                  <FontAwesome5 style={style.icons} name="hospital" size={24} />
                </View>
                <View style={style.boxBotton}>

                        <TouchableOpacity style={style.button} onPress={getUnidade}>
                          {loading ? (
                            <ActivityIndicator color={"white"} size={"small"} />
                          ) : (
                            <Text style={style.textButton}>Prosseguir para o teste</Text>
                          )}
                        </TouchableOpacity>
                        <TouchableOpacity>
                          <Text style={style.secondaryButton}
                           onPress={() => router.back()}
                          > voltar para a seleção do teste</Text>
                          
                        </TouchableOpacity>
                      </View>
            </View>
        </View>
    );


}

const style = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#c1b6ff",
    justifyContent: "center",  
    padding: 24,
  },

  boxMid: {
    height: Dimensions.get("window").height / 1.5,
    width: "100%",
    marginTop: -10,
    backgroundColor: "#e3deff",
    borderRadius: 20,
    
  },
  boxInput: {
    height: 60,
    width: "85%",
    alignSelf: "center",
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 13,
    flexDirection: "row-reverse",
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  boxBotton: {
    height: 50,
    width: "100%",
    alignSelf: "center",
    borderRadius: 10,
    marginTop: 10,
    
    
  },
  button: {
    height: 50,
    width: "85%",
    marginTop: 10,
    alignSelf: "center",
    justifyContent: "center",
    backgroundColor: "#732cad",
    borderRadius: 20,
    marginBottom: 10,
  },
  secondaryButton: {
    fontSize: 15,
    fontWeight: "500",
    color: "#4d62da",
    alignSelf: "center",
    marginTop: 20,
  },
  textButton: {
    fontSize: 15,
    fontWeight: "800",
    color: "#ffffff",
    alignSelf: "center",
    justifyContent: "center",
  },
  primarytext: {
    fontSize: 20,
    fontWeight: "bold",
    alignSelf: "center",
    justifyContent: "center",
    marginBottom: 15,
    marginTop: 20,
    marginLeft: 10, 
  },
  secondarytext: {
    fontSize: 16,
    alignSelf: "center",
    justifyContent: "center",
    marginLeft: 10,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    height: "100%",
    width: "100%",
  },
  icons: {
    marginTop: 11,
    marginLeft: 5,
  },
  picker: {
    flex: 1,
}
});