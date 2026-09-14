import Logo from "@/assets/images/file.jpg";
import { useToast } from "@/hooks/useToast";
import { supabase } from "@/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { error: showError, info: showInfo } = useToast();

  async function getLogin() {
    try {
      const emailTratado = email.trim().toLowerCase();
      const passwordTratado = password.trim();

      setLoading(true);

      if (!emailTratado || !passwordTratado) {
        setLoading(false);
        return showInfo("Informe os campos obrigatórios!");
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: emailTratado,
        password: passwordTratado,
      });

      if (error) {
        setLoading(false);

        if (error.message.includes("Invalid login credentials")) {
          return showError("Email ou senha incorretos.");
        }

        return showError(error.message);
      }
    } catch (err) {
      console.log(err);
      showError("Erro ao conectar ao servidor.");
      setLoading(false);
    }
  }

  return (
    <View style={style.root}>
      <KeyboardAvoidingView
        style={style.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={style.content}>
          {/* BoxTop da Logo mantido intacto conforme solicitado */}
          <View style={style.boxTop}>
            <Image source={Logo} style={style.image} />
          </View>

          <View style={style.card}>
            <View style={style.inputWrapper}>
              <Ionicons
                name="mail-outline"
                size={20}
                color="#9CA3AF"
                style={style.iconLeft}
              />
              <TextInput
                placeholder="E-mail ou usuário"
                placeholderTextColor="#9CA3AF"
                style={style.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={[style.inputWrapper, style.passwordWrapper]}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#9CA3AF"
                style={style.iconLeft}
              />
              <TextInput
                placeholder="Senha"
                placeholderTextColor="#9CA3AF"
                style={style.input}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={10}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#9CA3AF"
                />
              </Pressable>
            </View>

            <TouchableOpacity
              style={[
                style.primaryButton,
                loading && style.primaryButtonDisabled,
              ]}
              onPress={getLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={style.primaryButtonText}>Entrar</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={style.secondaryButton}
              onPress={() => router.push("/sign-up")}
              activeOpacity={0.6}
            >
              <Text style={style.secondaryButtonText}>
                Cadastrar novo usuário
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const style = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#C1B6FF", // Design System: Auth (telas de login)
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  boxTop: {
    alignItems: "center",
    marginBottom: 32, // Substitui o marginTop negativo e posiciona a logo corretamente
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  card: {
    backgroundColor: "#FFFFFF", // Design System: Card Padrão
    borderRadius: 24,
    paddingTop: 32,
    paddingBottom: 32,
    paddingHorizontal: 24,
    shadowColor: "#000", // Design System: Default Shadow (5% opacity)
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    borderWidth: 1,
    borderColor: "#CBD5E1", // Design System: Cinza moderado (input borders)
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  passwordWrapper: {
    marginBottom: 32, // Distância maior (respiro) entre input final e botão
  },
  iconLeft: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: "100%",
    color: "#1F2937", // Design System: Cinza escuro (textos principais)
    fontSize: 15,
  },
  primaryButton: {
    height: 56,
    backgroundColor: "#A824EE", // Design System: Roxo Principal (Brand)
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  primaryButtonDisabled: {
    backgroundColor: "#D1D5DB", // Design System: Disabled states background
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  secondaryButton: {
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4D62DA", // Design System: Azul-roxo (textos de cadastro)
  },
});
