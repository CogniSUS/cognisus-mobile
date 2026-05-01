import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { ProfileMenu } from "./profile-menu";
import { useLogout } from "@/hooks/useLogout";

export function AppHeader() {
  const [menuVisible, setMenuVisible] = useState(false);
  const { logout, isLoggingOut } = useLogout();

  const handleProfilePress = () => {
    setMenuVisible(!menuVisible);
  };

  const handleLogout = async () => {
    await logout();
    setMenuVisible(false);
  };

  return (
    <>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <LinearGradient
          colors={["#FCFAFE", "#F0E5FB", "#E4D4F6"]}
          locations={[0, 0.5, 1]}
          start={{ x: 0, y: 1 }}
          end={{ x: 0, y: 0 }}
          style={styles.container}
        >
          <View style={styles.leftSection}>
            <View style={styles.logoWrapper}>
              <Image
                source={require("@/assets/images/logo-img.png")}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.title}>
              <Text style={styles.titleLight}>COGNI</Text>
              <Text style={styles.titleBold}>SUS</Text>
            </Text>
          </View>

          <View style={styles.rightSection}>
            <Pressable style={styles.iconButton}>
              <Ionicons name="notifications" size={20} color="#6E34B5" />
            </Pressable>

            <Pressable style={styles.iconButton}>
              <Ionicons name="settings-outline" size={21} color="#6E34B5" />
            </Pressable>

            <Pressable style={styles.profileButton} onPress={handleProfilePress}>
              <Ionicons name="person-outline" size={16} color="#FFFFFF" />
            </Pressable>
          </View>
        </LinearGradient>
      </SafeAreaView>
      <ProfileMenu
        isVisible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
      />
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "transparent",
  },
  container: {
    minHeight: 88,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexShrink: 1,
  },
  logoWrapper: {
    width: 58,
    height: 58,
    borderRadius: 27,
    backgroundColor: "#6E34B5",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  logoImage: {
    width: 54,
    height: 54,
  },
  title: {
    fontSize: 28,
    letterSpacing: 0.2,
  },
  titleLight: {
    color: "#6E34B5",
    fontWeight: "400",
  },
  titleBold: {
    color: "#6E34B5",
    fontWeight: "800",
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginLeft: 10,
  },
  iconButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  profileButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#6E34B5",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 2,
  },
});