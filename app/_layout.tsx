import { database } from "@/database/database";
import { AuthProvider, useAuth } from "@/providers/AuthProvider";
import { ToastProvider } from "@/providers/ToastProvider";
import { syncData } from "@/services/sync/initialSync";
import { Q } from "@nozbe/watermelondb";
import NetInfo from "@react-native-community/netinfo";
import { Href, Slot, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

function RootLayoutNav() {
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!session?.user?.id) return;

    const unsubscribe = NetInfo.addEventListener((state) => {
      // Se a conexão voltou e tiver internet, roda o sync em background
      if (state.isConnected && state.isInternetReachable) {
        console.log("Internet detectada! Rodando sync em background...");
        syncData().catch((err) =>
          console.error("Erro no background sync:", err),
        );
      }
    });

    return () => unsubscribe();
  }, [session]);

  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    async function runSync() {
      if (session?.user?.id) {
        try {
          const profissionalCollection =
            database.collections.get("profissional");
          const count = await profissionalCollection
            .query(Q.where("user_id", session.user.id))
            .fetchCount();

          if (count === 0) {
            setIsSyncing(true);
          }

          console.log("Sincronizando dados...");
          await syncData();
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
      router.replace("/(auth)/sign-in" as Href);
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
  return (
    <AuthProvider>
      <ToastProvider>
        <RootLayoutNav />
      </ToastProvider>
    </AuthProvider>
  );
}
