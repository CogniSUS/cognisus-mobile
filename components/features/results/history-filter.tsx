import { ResultFilter } from "@/types/result";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
} from "react-native";

type HistoryFilterProps = {
  value: ResultFilter;
  onChange: (filter: ResultFilter) => void;
};

const filters: {
  label: string;
  value: ResultFilter;
}[] = [
  { label: "Todos os testes", value: "all" },
  { label: "MEEM", value: "meem" },
  { label: "MoCA", value: "moca" },
  { label: "Fluência", value: "fluencia" },
];

export function HistoryFilter({
  value,
  onChange,
}: HistoryFilterProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {filters.map((filter) => {
        const active = value === filter.value;

        return (
          <Pressable
            key={filter.value}
            onPress={() => onChange(filter.value)}
            style={[
              styles.pill,
              active && styles.activePill,
            ]}
          >
            <Text
              style={[
                styles.label,
                active && styles.activeLabel,
              ]}
            >
              {filter.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    paddingRight: 16,
  },

  pill: {
    height: 38,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },

  activePill: {
    backgroundColor: "#A824EE",
  },

  label: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "600",
  },

  activeLabel: {
    color: "#FFFFFF",
  },
});