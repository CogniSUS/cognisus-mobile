import { useAuth } from "@/providers/AuthProvider";
import { Alert } from "react-native";
import { useState } from "react";

export const useLogout = () => {
  const { logout: logoutFromAuth } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutFromAuth();
    } catch (error) {
      Alert.alert(
        "Erro ao desconectar",
        "Falha ao fazer logout. Tente novamente."
      );
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return { logout, isLoggingOut };
};
