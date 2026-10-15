import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

export function AboutCard() {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.icon}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color="#A824EE"
          />
        </View>

        <Text style={styles.title}>Sobre o COGNISUS</Text>
      </View>

      <Text style={styles.text}>
        Plataforma de triagem cognitiva desenvolvida para profissionais de
        saúde realizarem avaliações preventivas e identificarem precocemente
        possíveis alterações cognitivas em pacientes.
      </Text>

      <View style={styles.divider} />

      <Text style={styles.version}>Versão 1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  icon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: "#F3E8FF",
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "600",
  },

  text: {
    color: "#475569",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 14,
  },

  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 14,
  },

  version: {
    color: "#64748B",
    fontSize: 11,
  },
});
