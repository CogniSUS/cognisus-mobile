import Logo from "@/assets/images/file.jpg";
import { useToast } from "@/hooks/useToast";
import { formatCpf } from "@/utils/formatters"; // Importando do seu utils padrão
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
  ScrollView,
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

      // Remove a máscara para validação e envio para o banco
      const cleanCpf = cpf.replace(/\D/g, "");

      if (!email || !password || !confirmPassword || !cleanCpf || !name) {
        setLoading(false);
        return showInfo("Informe os campos obrigatórios!");
      } else if (!email.includes("@")) {
        setLoading(false);
        return showError("Email inválido");
      } else if (cleanCpf.length !== 11) {
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
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            nome_completo: name.trim(),
            cpf: cleanCpf, // Salvando no banco sem a máscara
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
    <View style={style.root}>
      <KeyboardAvoidingView
        style={style.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={style.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={style.content}>
            <View style={style.boxTop}>
              <Image source={Logo} style={style.image} />
              <Text style={style.subtitle}>Cadastro de Profissional</Text>
            </View>

            <View style={style.card}>
              <View style={style.inputWrapper}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color="#9CA3AF"
                  style={style.iconLeft}
                />
                <TextInput
                  placeholder="Nome Completo"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="words"
                  style={style.input}
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={style.inputWrapper}>
                <Ionicons
                  name="card-outline"
                  size={20}
                  color="#9CA3AF"
                  style={style.iconLeft}
                />
                <TextInput
                  placeholder="CPF"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  style={style.input}
                  value={cpf}
                  maxLength={14} // Aumentado para 14 para acomodar pontos e traço
                  onChangeText={(text) => setCpf(formatCpf(text))} // Aplicação da máscara
                />
              </View>

              <View style={style.inputWrapper}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color="#9CA3AF"
                  style={style.iconLeft}
                />
                <TextInput
                  placeholder="E-mail"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#9CA3AF"
                  style={style.input}
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <View style={style.inputWrapper}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#9CA3AF"
                  style={style.iconLeft}
                />
                <TextInput
                  placeholder="Senha"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="none"
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

              <View style={[style.inputWrapper, style.lastInputWrapper]}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#9CA3AF"
                  style={style.iconLeft}
                />
                <TextInput
                  placeholder="Confirmar Senha"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="none"
                  style={style.input}
                  secureTextEntry={!showPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
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
                onPress={getCadastro}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={style.primaryButtonText}>Criar Conta</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={style.secondaryButton}
                onPress={() => router.back()}
                activeOpacity={0.6}
              >
                <Text style={style.secondaryButtonText}>
                  Já tenho conta • Fazer Login
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const style = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#C1B6FF",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 40,
  },
  content: {
    paddingHorizontal: 24,
  },
  boxTop: {
    alignItems: "center",
    marginBottom: 24,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#42526B",
    fontWeight: "400",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingTop: 32,
    paddingBottom: 32,
    paddingHorizontal: 24,
    shadowColor: "#000",
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
    borderColor: "#CBD5E1",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  lastInputWrapper: {
    marginBottom: 32,
  },
  iconLeft: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: "100%",
    color: "#1F2937",
    fontSize: 15,
  },
  primaryButton: {
    height: 56,
    backgroundColor: "#A824EE",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  primaryButtonDisabled: {
    backgroundColor: "#D1D5DB",
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
    color: "#A824EE",
  },
});
