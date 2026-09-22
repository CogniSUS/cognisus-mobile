import { useTestProtection } from "@/providers/TestProtectionProvider";
import { Ionicons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ValidRoute =
  | "/(app)"
  | "/(app)/patients"
  | "/(app)/results"
  | "/(app)/informations";

type MenuSection = "home" | "patients" | "results" | "informations";
export function MenuApp() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { isTestInProgress, onMenuNavigationAttempt } = useTestProtection();

  const isActive = (section: MenuSection) => {
    switch (section) {
      case "home":
        return pathname === "/" || pathname === "/(app)" || pathname === "/development";

      case "patients":
        return pathname.startsWith("/patients");

      case "results":
        return pathname.startsWith("/results");

      case "informations":
        return pathname.startsWith("/informations");

      default:
        return false;
    }
  };

  const handleNavigation = (route: ValidRoute) => {
    if (isTestInProgress && onMenuNavigationAttempt) {
      onMenuNavigationAttempt(route);
      return;
    }

    router.push(route);
  };

  return (
    <View
      style={[
        styles.wrapper,
        {
          paddingBottom: Math.max(insets.bottom, 10),
        },
      ]}
    >
      <View style={styles.container}>
        <Pressable
          style={[styles.item, isActive("home") && styles.activeItem]}
          onPress={() => handleNavigation("/(app)")}
        >
          <Ionicons name="home-outline" size={30} color="#B7A5D9" />
          <Text
            style={[styles.label, isActive("home") && styles.activeLabel]}
          >
            Início
          </Text>
        </Pressable>

        <Pressable
          style={[styles.item, isActive("patients") && styles.activeItem]}
          onPress={() => handleNavigation("/(app)/patients")}
        >
          <Ionicons name="people-outline" size={30} color="#B7A5D9" />
          <Text
            style={[styles.label, isActive("patients") && styles.activeLabel]}
          >
            Pacientes
          </Text>
        </Pressable>

        <Pressable
          style={[styles.item, isActive("results") && styles.activeItem]}
          onPress={() => handleNavigation("/(app)/results")}
        >
          <Ionicons name="clipboard-outline" size={30} color="#B7A5D9" />
          <Text
            style={[styles.label, isActive("results") && styles.activeLabel]}
          >
            Resultados
          </Text>
        </Pressable>

        <Pressable
          style={[styles.item, isActive("informations") && styles.activeItem]}
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
              isActive("informations") && styles.activeLabel,
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
