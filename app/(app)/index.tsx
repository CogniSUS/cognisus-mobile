import { initDB } from "@/database/database";
import { AntDesign, FontAwesome, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { Picker } from '@react-native-picker/picker';
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Dimensions, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function HomePage() {
  const [isDbReady, setIsDbReady] = useState(false)
  const [mostrarCadastro, setMostrarCadastro] = useState(false)
  const [nome, setNome] = useState('')
  const [cpf,setCpf] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')
  const [sexo, setSexo] = useState('')
  const [escolaridade, setEscolaridade] = useState('')
  const [dcnt, setDCNT] = useState('')
  const [unidadeSaude, setUnidadeSaude] = useState('')
  const [loading, setLoading] = useState(false);

  async function cadastrarPaciente(){
    try{
      setLoading(true)
      if (!nome ||!cpf|| !dataNascimento || sexo=="" || dcnt=="" || unidadeSaude=="" || escolaridade=="") {
        setLoading(false)
        return Alert.alert(
          "Erro",
          "Preencha os campos"
        )
      
      } else if (cpf.length != 11) {
              setLoading(false);
              return Alert.alert("Erro", "CPF deve conter exatamente 11 dígitos");}
              
      setTimeout(()=>{
          Alert.alert("Sucesso", "Cadastro de paciente realizado!")
          setMostrarCadastro(false)
          setLoading(false)
          

        },3000)

    }
    catch(error){
      console.log(error);
      Alert.alert("Erro", "Erro ao conectar ao servidor.");
      setLoading(false);
    }
  }
  useEffect(() => {
    const initializeDB = async () => {
      await initDB();
      setIsDbReady(true);
    };

    initializeDB();
  }, []);

  if (!isDbReady) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Cognisus Mobile</Text>
        <Text style={styles.subtitle}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {
        mostrarCadastro
        ?
        <View>
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
                          placeholder="Digite seu CPF (somente numeros)"
                          keyboardType="numeric"
                          style={styles.input}
                          value={cpf}
                          maxLength={11}
                          onChangeText={setCpf}
                        />
                        <FontAwesome style={styles.icons} name="id-card-o" size={24} />
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


                  <View style={styles.boxInput}>

                  <Picker
                    selectedValue={unidadeSaude}
                    onValueChange={(itemValue) => setUnidadeSaude(itemValue)}
                    style={styles.picker}
                  >

                    <Picker.Item label="Unidade de saúde" value="" />

                    <Picker.Item label="A definir" value="aDefinir" />


                  </Picker>
                  <FontAwesome5 style={styles.icons} name="hospital" size={24} />
                </View>
                <View style={styles.boxBotton}>
                  <TouchableOpacity
                    style={[styles.button, styles.tertiaryButton]}
                    onPress={() => setMostrarCadastro(false)}
                  >
                    <Text style={styles.tertiaryButtonText}>Voltar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.tertiaryButton]} onPress={cadastrarPaciente}
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
        :

        <View>
          <Text style={styles.title}>Cognisus Mobile</Text>

          <Text style={styles.subtitle}>Aplicativo de triagem cognitiva</Text>

          <Pressable
            style={[styles.button, styles.secondaryButton]}
            onPress={() => router.push("/tests")}
          >
            <Text style={styles.secondaryButtonText}>Testes</Text>
          </Pressable>
            <Pressable
              style={[styles.button, styles.secondaryButton]}
              onPress={() => setMostrarCadastro(true)}
          >
            <Text style={styles.secondaryButtonText}>Cadastro de paciente</Text>
          </Pressable>
        </View>
    }
    </View>
    
  );
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
      marginTop: -43,
      alignItems: "center",
    },
    boxMid: {
      height: Dimensions.get("window").height / 1.4,
      width: "100%",
      marginTop: -100,
      backgroundColor: "#e3deff",
      borderRadius: 20,
    },
    boxBotton:{
    height: 62,
    width: "85%",
    alignSelf: "center",
    marginTop: 15,
    },
    tertiaryButton: {
      backgroundColor: "#732cad"
    },
    boxInput: {
      height: 51,
      width: "85%",
      alignSelf: "center",
      borderWidth: 1,
      borderRadius: 10,
      marginTop: 13,
      flexDirection: "row-reverse",
      paddingHorizontal: 10,
  },
    title: {
      fontSize: 30,
      fontWeight: "700",
      color: "#0F172A",
      textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    marginTop: 12,
    marginBottom: 32,
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
  },
  picker: {
    flex: 1,
}
});
