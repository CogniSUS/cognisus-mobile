import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

export function SupportCard() {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Suporte e Contato</Text>

      <View style={styles.row}>
        <Ionicons
          name="call-outline"
          size={17}
          color="#A824EE"
        />

        <Text style={styles.text}>(91) 3201-0000</Text>
      </View>

      <View style={styles.row}>
        <Ionicons
          name="mail-outline"
          size={17}
          color="#A824EE"
        />

        <Text style={styles.text}>
          suporte@cognisus.com.br
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  title: {
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 14,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },

  text: {
    color: "#475569",
    fontSize: 12,
  },
});
