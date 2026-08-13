import { CognitiveResult } from "@/types/result";
import {
  Ionicons,
} from "@expo/vector-icons";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type HistoryResultCardProps = {
  result: CognitiveResult;
  onPress: (result: CognitiveResult) => void;
};

function formatDate(date: string) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("pt-BR");
}

export function HistoryResultCard({
  result,
  onPress,
}: HistoryResultCardProps) {
  const isNormal = result.status === "normal";

  const progress = Math.min(
    Math.max(result.score / result.maxScore, 0),
    1,
  );

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
      onPress={() => onPress(result)}
    >
      <View style={styles.header}>
        <View style={styles.testNameContainer}>
          <Text style={styles.testName}>
            {result.testAbbreviation}
          </Text>

          <Ionicons
            name={
              isNormal
                ? "checkmark-circle-outline"
                : "warning-outline"
            }
            size={20}
            color={isNormal ? "#22C55E" : "#F97316"}
          />
        </View>

        <View
          style={[
            styles.statusTag,
            isNormal
              ? styles.normalTag
              : styles.alteredTag,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              isNormal
                ? styles.normalText
                : styles.alteredText,
            ]}
          >
            {isNormal ? "Normal" : "Alterado"}
          </Text>
        </View>
      </View>

      <Text style={styles.classification}>
        {result.classification}
      </Text>

      <View style={styles.infoRow}>
        <View style={styles.dateRow}>
          <Ionicons
            name="calendar-outline"
            size={15}
            color="#94A3B8"
          />

          <Text style={styles.dateText}>
            {formatDate(result.date)}
          </Text>
        </View>

        <Text style={styles.score}>
          {result.score}/{result.maxScore} pontos
        </Text>
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${progress * 100}%`,
              backgroundColor: isNormal
                ? "#22C55E"
                : "#F97316",
            },
          ]}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ECE8F2",

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 7,
    elevation: 2,
  },

  cardPressed: {
    opacity: 0.92,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  testNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  testName: {
    color: "#334155",
    fontSize: 17,
    fontWeight: "800",
  },

  statusTag: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 11,
    paddingVertical: 5,
  },

  normalTag: {
    borderColor: "#86EFAC",
    backgroundColor: "#F0FDF4",
  },

  alteredTag: {
    borderColor: "#FDBA74",
    backgroundColor: "#FFF7ED",
  },

  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },

  normalText: {
    color: "#22C55E",
  },

  alteredText: {
    color: "#F97316",
  },

  classification: {
    color: "#64748B",
    fontSize: 13,
    marginTop: 5,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },

  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  dateText: {
    color: "#64748B",
    fontSize: 12,
  },

  score: {
    color: "#475569",
    fontSize: 12,
    fontWeight: "700",
  },

  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#E5E7EB",
    marginTop: 8,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
});