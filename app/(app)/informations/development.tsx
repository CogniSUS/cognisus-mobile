import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function TestHistoryPage() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.replace("/(app)")}
          activeOpacity={0.7}
        >
          <Feather
            name="arrow-left"
            size={24}
            color="#A824EE"
          />
        </TouchableOpacity>

        <Text style={styles.title}>Voltar para o início</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Feather
            name="tool"
            size={42}
            color="#A824EE"
          />
        </View>

        <Text style={styles.heading}>
          Funcionalidade em desenvolvimento
        </Text>

        <Text style={styles.description}>
          Estamos trabalhando para disponibilizar esta
          funcionalidade em breve.
        </Text>


      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 16,
  },

  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
  },

  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },

  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F3E8FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },

  heading: {
    fontSize: 22,
    fontWeight: "600",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 12,
  },

  description: {
    fontSize: 15,
    lineHeight: 22,
    color: "#6B7280",
    textAlign: "center",
    maxWidth: 320,
    marginBottom: 28,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});