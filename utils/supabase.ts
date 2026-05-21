import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";
import "react-native-url-polyfill/auto";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";
const supabasePublishableKey =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

// Proteção para o erro de "window is not defined" na Web (SSR)
const isWebSSR = Platform.OS === "web" && typeof window === "undefined";

const customStorage = isWebSSR
  ? {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    }
  : AsyncStorage;

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: customStorage as any, // 'as any' para o TypeScript não reclamar dos tipos exatos
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
