import { initDB } from "@/database/database";
import { AuthProvider, useAuth } from "@/providers/AuthProvider";
import { Href, Slot, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

function RootLayoutNav() {
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === ("(auth)" as any);

    if (!session && !inAuthGroup) {
      router.replace("/(auth)/login" as Href);
    } else if (session && inAuthGroup) {
      router.replace("/(app)" as Href);
    }
  }, [session, isLoading, segments, router]);

  if (isLoading) return null;

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

  // Envolvemos o app no AuthProvider
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
