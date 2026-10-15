import { StyleSheet, Text, View } from "react-native";


export function SkillBarComponent({
  label,
  score,
  max,
}: Readonly<{
  label: string;
  score: number;
  max: number;
}>) {
  const percentage = Math.min(100, Math.max(0, (score / max) * 100));

  return (
    <View style={styles.skillContainer}>
      <View style={styles.skillHeader}>
        <Text style={styles.skillLabel}>{label}</Text>
        <Text style={styles.skillScore}>
          {score}/{max}
        </Text>
      </View>
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${percentage}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skillContainer: {
    marginBottom: 16,
  },
  skillHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  skillLabel: {
    fontSize: 14,
    color: "#4B5563",
  },
  skillScore: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  progressBarBg: {
    height: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#A824EE",
    borderRadius: 4,
  },
});
