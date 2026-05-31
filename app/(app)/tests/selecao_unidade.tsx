import {
  FontAwesome5
} from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
export default function SelecaoUnidade(){
  const [unidadeSaude, setUnidadeSaude] = useState("");
  const [loading, setLoading] = useState(false);

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

                    <Picker.Item label="Unidade de saúde" value="" />

                    <Picker.Item label="Hospital São José" value="hsaojose" />

                    <Picker.Item label="Hospital São Lucas" value="hsaolucas" />


                  </Picker>
                  <FontAwesome5 style={style.icons} name="hospital" size={24} />
                </View>
                <View style={style.boxBotton}>

                        <TouchableOpacity style={style.button}>
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
    marginBottom: 10,
    marginTop: 20,
    marginLeft: 10, 
  },
  secondarytext: {
    fontSize: 16,
    alignSelf: "center",
    justifyContent: "center",
    marginLeft: 10,
    marginBottom: 10,
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