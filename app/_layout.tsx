import { initDB } from "@/database/database";
import { AuthProvider, useAuth } from "@/providers/AuthProvider";
import { ToastProvider } from "@/providers/ToastProvider";
import { initialSync } from "@/services/sync/initialSync";
import { Href, Slot, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

function RootLayoutNav() {
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    async function runSync() {
      if (session?.user?.id) {
        try {
          setIsSyncing(true);
          console.log("Iniciando sincronização de dados...");

          await initialSync(session.user.id);

          console.log("Sincronização concluída com sucesso!");
        } catch (error) {
          console.error("Erro crítico na sincronização:", error);
        } finally {
          setIsSyncing(false);
        }
      }
    }

    if (!isLoading) {
      runSync();
    }
  }, [session, isLoading]);

  useEffect(() => {
    if (isLoading || isSyncing) return;

    const inAuthGroup = segments[0] === ("(auth)" as any);

    if (!session && !inAuthGroup) {
      router.replace("/(auth)/login" as Href);
    } else if (session && inAuthGroup) {
      router.replace("/(app)" as Href);
    }
  }, [session, isLoading, isSyncing, segments, router]);

  if (isLoading || isSyncing) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator
          size="large"
          color="#2563EB"
          style={{ marginBottom: 16 }}
        />
        <Text>
          {isSyncing
            ? "Sincronizando seus dados para uso offline..."
            : "Carregando..."}
        </Text>
      </View>
    );
  }

  return <Slot />;
}

export default function AppLayout() {
  const [isDbReady, setIsDbReady] = useState(false);

  useEffect(() => {
    const initializeDB = async () => {
      await initDB();
      setIsDbReady(true);
    };

    initializeDB();
  }, []);

  if (!isDbReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Preparando o aplicativo...</Text>
      </View>
    );
  }

  return (
    <AuthProvider>
      <ToastProvider>
        <RootLayoutNav />
      </ToastProvider>
    </AuthProvider>
  );
}
