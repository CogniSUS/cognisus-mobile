import { useLogout } from "@/hooks/useLogout";
import { Ionicons } from "@expo/vector-icons";
import { useNetInfo } from "@react-native-community/netinfo";
import { Pressable, StyleSheet, Text } from "react-native";

export function LogoutButton() {
  const { logout, isLoggingOut } = useLogout();
  const netInfo = useNetInfo();

  const isOffline = netInfo.isConnected === false;
  const isDisabled = isLoggingOut || isOffline;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        isOffline && styles.buttonDisabled,
        pressed && !isDisabled && styles.pressed,
      ]}
      onPress={logout}
      disabled={isDisabled}
    >
      <Ionicons
        name="log-out-outline"
        size={19}
        color={isOffline ? "#9CA3AF" : "#EF4444"}
      />

      <Text style={[styles.text, isOffline && styles.textDisabled]}>
        {isLoggingOut
          ? "Saindo..."
          : isOffline
            ? "Sair (Sem conexão)"
            : "Sair do Aplicativo"}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    marginTop: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    backgroundColor: "#FEF2F2",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonDisabled: {
    borderColor: "#E5E7EB",
    backgroundColor: "#F3F4F6",
  },
  pressed: {
    opacity: 0.8,
  },
  text: {
    color: "#EF4444",
    fontSize: 14,
    fontWeight: "500",
  },
  textDisabled: {
    color: "#9CA3AF",
  },
});
