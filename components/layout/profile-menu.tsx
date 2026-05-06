import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface ProfileMenuProps {
  isVisible: boolean;
  onClose: () => void;
  onLogout: () => Promise<void>;
  isLoggingOut: boolean;
}

export function ProfileMenu({
  isVisible,
  onClose,
  onLogout,
  isLoggingOut,
}: ProfileMenuProps) {
  if (!isVisible) return null;

  return (
    <View style={styles.container}>
      <Pressable style={styles.overlay} onPress={onClose} />
      <View style={styles.menu}>
        <Pressable 
          style={styles.menuItem}
          disabled={isLoggingOut}
        >
          <Ionicons name="person-outline" size={18} color="#6E34B5" />
          <Text style={styles.menuItemText}>Perfil</Text>
        </Pressable>

        <View style={styles.divider} />

        <Pressable
          style={[
            styles.menuItem,
            isLoggingOut && styles.menuItemDisabled,
          ]}
          onPress={onLogout}
          disabled={isLoggingOut}
        >
          <Ionicons 
            name="exit-outline" 
            size={18} 
            color={isLoggingOut ? "#CBD5E1" : "#DC2626"}
          />
          <Text style={[
            styles.menuItemText,
            { color: isLoggingOut ? "#CBD5E1" : "#DC2626" }
          ]}>
            {isLoggingOut ? "Desconectando..." : "Sair"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    zIndex: 1000,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  menu: {
    position: "absolute",
    top: 85,
    right: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1001,
    minWidth: 160,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuItemDisabled: {
    opacity: 0.6,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0F172A",
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
  },
});
