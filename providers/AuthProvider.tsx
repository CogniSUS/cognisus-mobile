import { database } from "@/database/database";
import { syncData } from "@/services/sync/initialSync";
import { supabase } from "@/utils/supabase";
import { hasUnsyncedChanges } from "@nozbe/watermelondb/sync";
import { Session, User } from "@supabase/supabase-js";
import React, { createContext, useContext, useEffect, useState } from "react";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isLoading: true,
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    try {
      setIsLoading(true);

      // 1. A Trava de Segurança: Checa se há algo para subir
      const dadosPendentes = await hasUnsyncedChanges({ database });

      if (dadosPendentes) {
        console.log(
          "Dados offline detectados. Forçando sincronização antes do logout...",
        );
        await syncData(); // Espera o PUSH terminar!
      }

      // 2. Só depois desloga
      await supabase.auth.signOut();

      // 3. E por último destrói o banco local
      await database.write(async () => {
        await database.unsafeResetDatabase();
      });
    } catch (error) {
      console.error("Erro ao tentar deslogar:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
