import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/hooks/useToast";
import { useState } from "react";

export const useLogout = () => {
  const { logout: logoutFromAuth } = useAuth();
  const { error, success } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = async () => {
    setIsLoggingOut(true);

    try {
      await logoutFromAuth();
      success("Logout realizado com sucesso.");
    } catch (err) {
      error("Falha ao fazer logout. Tente novamente.");
      console.error("Logout error:", err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return { logout, isLoggingOut };
};