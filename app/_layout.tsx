import { Slot } from "expo-router";
import { StyleSheet, View } from "react-native";
import { AppHeader } from "@/components/layout/app-header";
import { MenuApp } from "@/components/layout/menu-app";

export default function AppLayout() {
  return (
    <View style={styles.container}>
      <AppHeader />
      <View style={styles.content}>
        <Slot />
      </View>
      <MenuApp />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F4FA",
  },
  content: {
    flex: 1,
  },
});