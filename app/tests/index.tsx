import { StyleSheet, Text, View } from "react-native";

export default function TestsPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Testes</Text>
      <Text style={styles.text}>
        Área dos testes de triagem cognitiva.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    color: "#64748B",
  },
});