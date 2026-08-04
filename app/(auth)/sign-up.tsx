import Logo from "@/assets/images/file.jpg";
import { useToast } from "@/hooks/useToast";
import { supabase } from "@/utils/supabase";
import { AntDesign, FontAwesome, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { success: showSuccess, error: showError, info: showInfo } = useToast();

  async function getCadastro() {
    try {
      setLoading(true);

      if (!email || !password || !confirmPassword || !cpf || !name) {
        setLoading(false);
        return showInfo("Informe os campos obrigatórios!");
      } else if (!email.includes("@")) {
        setLoading(false);
        return showError("Email inválido");
      } else if (cpf.length !== 11) {
        setLoading(false);
        return showError("CPF deve conter exatamente 11 dígitos");
      } else if (password.length < 6) {
        setLoading(false);
        return showError("Senha deve ter pelo menos 6 caracteres");
      } else if (password !== confirmPassword) {
        setLoading(false);
        return showError("Senha e confirmar senha estão diferentes");
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome_completo: name,
            cpf,
          },
        },
      });

      if (error) {
        setLoading(false);
        return showError(error.message);
      }

      if (data.user) {
        const userId = data.user.id;

        if (!userId) {
          setLoading(false);
          return showError("Não foi possível obter o ID do usuário");
        }

        showSuccess("Cadastro realizado com sucesso!");
        showInfo("Verifique seu e-mail para confirmar a conta.");
        router.replace("/(app)");
      }
    } catch (err) {
      console.error(err);
      showError("Ocorreu um erro ao realizar o cadastro.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={style.container}>
      <View style={style.boxTop}>
        <Image source={Logo} style={style.image} />
      </View>
      <View style={style.boxMid}>
        <View style={style.boxInput}>
          <TextInput
            placeholder="Digite seu Nome"
            autoCapitalize="words"
            style={style.input}
            value={name}
            onChangeText={setName}
          />
          <AntDesign style={style.icons} name="smile" size={24} />
        </View>
        <View style={style.boxInput}>
          <TextInput
            placeholder="Digite seu CPF (somente numeros)"
            keyboardType="numeric"
            style={style.input}
            value={cpf}
            maxLength={11}
            onChangeText={setCpf}
          />
          <FontAwesome style={style.icons} name="id-card-o" size={24} />
        </View>
        <View style={style.boxInput}>
          <TextInput
            placeholder="Digite seu E-mail"
            keyboardType="email-address"
            autoCapitalize="none"
            style={style.input}
            value={email}
            onChangeText={setEmail}
          />
          <Ionicons style={style.icons} name="mail" size={24} />
        </View>
        <View style={style.boxInput}>
          <TextInput
            placeholder="Digite sua senha"
            autoCapitalize="none"
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
        <View style={style.boxInput}>
          <TextInput
            placeholder="Confirmar Senha"
            autoCapitalize="none"
            style={style.input}
            secureTextEntry={!showPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <Pressable onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              style={style.icons}
              name={showPassword ? "eye-off" : "eye"}
              size={24}
            />
          </Pressable>
        </View>
      </View>
      <View style={style.boxBotton}>
        <TouchableOpacity style={style.button} onPress={() => router.back()}>
          <Text style={style.textButton}> voltar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={style.button} onPress={getCadastro}>
          {loading ? (
            <ActivityIndicator color={"white"} size={"small"} />
          ) : (
            <Text style={style.textButton}>confirmar</Text>
          )}
        </TouchableOpacity>
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
  boxInput: {
    height: 50,
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
    alignSelf: "center",
    marginTop: 30,
    justifyContent: "space-between",
    flexDirection: "row",
  },
  button: {
    height: 50,
    width: "47%",
    backgroundColor: "#732cad",
    borderRadius: 20,
    justifyContent: "center",
    alignSelf: "center",
    marginHorizontal: 10,
  },
  textButton: {
    fontSize: 20,
    fontWeight: "800",
    color: "#ffffff",
    alignSelf: "center",
    justifyContent: "center",
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 75,
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
