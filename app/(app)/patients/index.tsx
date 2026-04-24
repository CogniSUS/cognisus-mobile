import { StyleSheet, Text, View } from "react-native";

export default function PatientsPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pacientes</Text>
      <Text style={styles.text}>Lista local de pacientes.</Text>
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