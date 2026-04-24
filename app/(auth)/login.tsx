import { supabase } from "@/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Logo from "../../assets/images/file.jpg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function getLogin() {
    try {
      const emailTratado = email.trim().toLowerCase();
      const passwordTratado = password.trim();

      setLoading(true);

      if (!emailTratado || !passwordTratado) {
        setLoading(false);
        return Alert.alert("Atenção", "Informe os campos obrigatórios!");
      }

      // Tenta fazer o login no Supabase
      const { error } = await supabase.auth.signInWithPassword({
        email: emailTratado,
        password: passwordTratado,
      });

      if (error) {
        setLoading(false);
        // Tradução simples de erros comuns
        if (error.message.includes("Invalid login credentials")) {
          return Alert.alert("Erro", "Email ou senha incorretos.");
        }
        return Alert.alert("Erro", error.message);
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Erro ao conectar ao servidor.");
      setLoading(false);
    }
  }

  return (
    <View style={style.container}>
      <View style={style.boxTop}>
        <Image source={Logo} style={style.image} />
      </View>
      <View style={style.boxMid}>
        <Text></Text>
        <View style={style.boxInput}>
          <TextInput
            placeholder="E-mail"
            style={style.input}
            value={email}
            onChangeText={setEmail}
          />
          <Ionicons style={style.icons} name="mail" size={24} />
        </View>

        <View style={style.boxInput}>
          <TextInput
            placeholder="Senha"
            style={style.input}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <Pressable onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              style={style.icons}
              name={showPassword ? "eye-off" : "eye"}
              size={24}
            />
          </Pressable>
        </View>
        <View style={style.boxBotton}>
          <TouchableOpacity style={style.button} onPress={() => getLogin()}>
            {loading ? (
              <ActivityIndicator color={"white"} size={"small"} />
            ) : (
              <Text style={style.textButton}>Entrar</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity>
            <Text
              style={style.secondaryButton}
              onPress={() => router.push("/cadastro")}
            >
              Cadastrar novo usuário
            </Text>
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
  boxTop: {
    height: Dimensions.get("window").height / 3,
    width: "100%",
    marginTop: -100,
    alignItems: "center",
  },
  boxMid: {
    height: Dimensions.get("window").height / 2.5,
    width: "100%",
    marginTop: -100,
    backgroundColor: "#e3deff",
    borderRadius: 20,
  },
  boxBotton: {
    height: 50,
    width: "100%",
    alignSelf: "center",
    borderRadius: 10,
    marginTop: 10,
  },
  boxInput: {
    height: 50,
    width: "85%",
    alignSelf: "center",
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 30,
    flexDirection: "row-reverse",
    paddingHorizontal: -20,
  },
  button: {
    height: 50,
    width: "85%",
    marginTop: 10,
    alignSelf: "center",
    backgroundColor: "#732cad",
    borderRadius: 20,
  },
  secondaryButton: {
    fontSize: 20,
    fontWeight: "800",
    color: "#4d62da",
    alignSelf: "center",
    marginTop: 20,
  },

  image: {
    width: 150,
    height: 150,
    borderRadius: 75, // metade de 150
  },

  textButton: {
    fontSize: 20,
    fontWeight: "800",
    color: "#ffffff",
    alignSelf: "center",
    marginTop: 12,
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
});
