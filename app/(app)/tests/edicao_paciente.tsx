import { AntDesign, FontAwesome, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { Picker } from '@react-native-picker/picker';
import { useState } from "react";
import { ActivityIndicator, Alert, Dimensions, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";


export default function editarPaciente(){
  const [nome, setNome] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')
  const [sexo, setSexo] = useState('')
  const [escolaridade, setEscolaridade] = useState('')
  const [dcnt, setDCNT] = useState('')
  const [loading, setLoading] = useState(false);

  async function getEditarPaciente() {
    try{
      setLoading(true)
      if (!nome || !dataNascimento || sexo=="" || dcnt=="" || escolaridade=="") {
        setLoading(false)
        return Alert.alert(
          "Erro",
          "Preencha os campos"
        )
      
      }
              
      setTimeout(()=>{
          Alert.alert("Sucesso", "Cadastro de paciente realizado!")
          setLoading(false)
          

        },3000)

    }
    catch(error){
      console.log(error);
      Alert.alert("Erro", "Erro ao conectar ao servidor.");
      setLoading(false);
    }
  
  }
  
  
    return(
        <View style={styles.container}>
        <View  style={styles.boxTop}>
          <Text style={styles.text}>Cadastro de Paciente</Text>
        </View>
            <View style = {styles.boxMid}>
                <View style={styles.boxInput}>
                  <TextInput
                    placeholder="Nome completo"
                    value={nome}
                    onChangeText={setNome}
                    autoCapitalize="words"
                    style={styles.input}
                  />
                  <AntDesign style={styles.icons} name="smile" size={24} />
              </View>
                      
                <View style={styles.boxInput}>
                  <TextInput
                    placeholder="Data de nascimento"
                    value={dataNascimento}
                    onChangeText={(text) => {
                        let formatted = text.replace(/\D/g, '')

                        if (formatted.length > 2) {
                          formatted =
                            formatted.slice(0, 2) +
                            '/' +
                            formatted.slice(2)
                        }

                        if (formatted.length > 5) {
                          formatted =
                            formatted.slice(0, 5) +
                            '/' +
                            formatted.slice(5)
                        }

                        setDataNascimento(formatted)
                      }}
                    keyboardType="numeric"
                     maxLength={10}
                    style={styles.input}
                  />
                  <FontAwesome5 style={styles.icons} name="calendar-alt" size={24} />
              </View>
              <View style={styles.boxInput}>

                  <Picker
                    selectedValue={sexo}
                    onValueChange={(itemValue) => setSexo(itemValue)}
                    style={styles.picker}
                  >

                    <Picker.Item label="Selecione o sexo" value="" />

                    <Picker.Item label="Masculino" value="masculino" />

                    <Picker.Item label="Feminino" value="feminino" />

                    <Picker.Item label="Outro" value="outro" />

                  </Picker>
                  <FontAwesome style={styles.icons} name="intersex" size={24} />
                </View>

                  <View style={styles.boxInput}>

                    <Picker
                      selectedValue={escolaridade}
                      onValueChange={(itemValue) => setEscolaridade(itemValue)}
                      style={styles.picker}
                    >

                      <Picker.Item label="Escolaridade" value="" />

                      <Picker.Item label="Ensino Fundamental Incompleto" value="ensinoFundamentalIncompleto" />

                      <Picker.Item label="Ensino Fundamental Completo" value="ensinoFundamentalCompleto" />

                      <Picker.Item label="Ensino Médio Incompleto" value="ensinoMedioIncompleto" />

                      <Picker.Item label="Ensino Médio Completo" value="ensinoMedioCompleto" />

                      <Picker.Item label="Ensino Superior Incompleto" value="ensinoSuperiorIncompleto" />

                      <Picker.Item label="Ensino Superior Completo" value="ensinoSuperiorCompleto" />

                      <Picker.Item label="Pós Graduação" value="posGraduacao" />

                    </Picker>
                    <Ionicons style={styles.icons} name="school" size={24} />
                </View>

                  <View style={styles.boxInput}>

                  <Picker
                    selectedValue={dcnt}
                    onValueChange={(itemValue) => setDCNT(itemValue)}
                    style={styles.picker}
                  >

                    <Picker.Item label="DCNT deferida (s)" value="" />

                    <Picker.Item label="A definir" value="aDefinir" />


                  </Picker>
                  <FontAwesome style={styles.icons} name="heartbeat" size={24} />
                </View>


                  
                <View style={styles.boxBotton}>
                  

                <TouchableOpacity

                    style={[styles.button, styles.tertiaryButton]} onPress={getEditarPaciente}
                  >
                    {loading ? (
                                <ActivityIndicator color={"white"} size={"small"} />
                              ) : (
                                <Text style={styles.tertiaryButtonText}>confirmar</Text>
                              )}
                </TouchableOpacity>
              </View>
            </View>
        </View>
    )
}





  const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    padding: 24,
  },
    boxTop: {
      height: Dimensions.get("window").height / 5.3,
      width: "100%",
      marginTop: -30,
      alignItems: "center",
    },
    boxMid: {
      height: Dimensions.get("window").height / 1.4,
      width: "100%",
      marginTop: -100,

      borderRadius: 20,
    },
    boxBotton:{
    height: 62,
    width: "100%",
    alignSelf: "center",
    marginTop: 15,
    },
    tertiaryButton: {
      backgroundColor: "#732cad"
    },
    boxInput: {

      height: 51,
      width: "100%",
      alignSelf: "center",
      borderWidth: 0.5,
      borderRadius: 10,
      marginTop: 13,
      flexDirection: "row-reverse",
      paddingHorizontal: 10,
  },
   

  text: {
    fontSize: 20,
    fontWeight: "bold",
    alignSelf: "flex-start",
    marginLeft: 12,
    color: "#0f0f0f",
    textAlign: "center",
    marginTop: 12,
  },
  input: {
    flex: 1,
    height: "100%",
    width: "100%",
  },
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: "#2563EB",
  },
  secondaryButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
  secondaryButtonText: {
    color: "#0F172A",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },

  tertiaryButtonText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#ffffff",
    alignSelf: "center",
    justifyContent: "center",
  },
    icons: {
      marginTop: 11,
      marginLeft: 5,
      color: "#732cad"
  },
  picker: {
    flex: 1,
}
});