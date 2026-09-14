import { useTestProtection } from "@/providers/TestProtectionProvider";
import { Ionicons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

type ValidRoute =
  | "/(app)"
  | "/(app)/patients"
  | "/(app)/results"
  | "/(app)/informations";

export function MenuApp() {
  const pathname = usePathname();
  const { isTestInProgress, onMenuNavigationAttempt } = useTestProtection();

  const isActive = (route: string) => pathname === route;

  const handleNavigation = (route: ValidRoute) => {
    // Se teste está em progresso, chama callback de interceptação
    if (isTestInProgress && onMenuNavigationAttempt) {
      onMenuNavigationAttempt(route);
      return;
    }
    // Caso contrário, navega normalmente
    router.push(route);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <Pressable
          style={[styles.item, isActive("/(app)") && styles.activeItem]}
          onPress={() => handleNavigation("/(app)")}
        >
          <Ionicons name="home-outline" size={30} color="#B7A5D9" />
          <Text
            style={[styles.label, isActive("/(app)") && styles.activeLabel]}
          >
            Início
          </Text>
        </Pressable>

        <Pressable
          style={[styles.item, isActive("/patients") && styles.activeItem]}
          onPress={() => handleNavigation("/(app)/patients")}
        >
          <Ionicons name="people-outline" size={30} color="#B7A5D9" />
          <Text
            style={[styles.label, isActive("/patients") && styles.activeLabel]}
          >
            Pacientes
          </Text>
        </Pressable>

        <Pressable
          style={[styles.item, isActive("/results") && styles.activeItem]}
          onPress={() => handleNavigation("/(app)/results")}
        >
          <Ionicons name="clipboard-outline" size={30} color="#B7A5D9" />
          <Text
            style={[styles.label, isActive("/results") && styles.activeLabel]}
          >
            Resultados
          </Text>
        </Pressable>

        <Pressable
          style={[styles.item, isActive("/informations") && styles.activeItem]}
          onPress={() => handleNavigation("/(app)/informations")}
        >
          <Ionicons
            name="information-circle-outline"
            size={30}
            color="#B7A5D9"
          />
          <Text
            style={[
              styles.label,
              isActive("/informations") && styles.activeLabel,
            ]}
          >
            Informações
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E9E1F4",
    paddingTop: 8,
    paddingBottom: 10,
    paddingHorizontal: 10,
  },
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    borderRadius: 18,
    marginHorizontal: 4,
  },
  activeItem: {
    backgroundColor: "#F8F6FC",
    borderWidth: 1,
    borderColor: "#E7DFF3",
  },
  label: {
    marginTop: 2,
    fontSize: 12,
    color: "#B7A5D9",
    fontWeight: "500",
  },
  activeLabel: {
    color: "#B7A5D9",
  },
});
