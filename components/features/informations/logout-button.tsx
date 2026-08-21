import { useLogout } from "@/hooks/useLogout";
import { Ionicons } from "@expo/vector-icons";
import {
  Pressable,
  StyleSheet,
  Text,
} from "react-native";

export function LogoutButton() {
  const { logout, isLoggingOut } = useLogout();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
      ]}
      onPress={logout}
      disabled={isLoggingOut}
    >
      <Ionicons
        name="log-out-outline"
        size={19}
        color="#EF4444"
      />

      <Text style={styles.text}>
        {isLoggingOut
          ? "Saindo..."
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

  pressed: {
    opacity: 0.8,
  },

  text: {
    color: "#EF4444",
    fontSize: 14,
    fontWeight: "500",
  },
});
