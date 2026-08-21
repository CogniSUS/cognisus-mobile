import { Ionicons } from "@expo/vector-icons";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type InformationActionCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  iconColor: string;
  iconBackground: string;
  onPress?: () => void;
};

export function InformationActionCard({
  icon,
  title,
  subtitle,
  iconColor,
  iconBackground,
  onPress,
}: InformationActionCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
      onPress={() => {
        onPress?.();
      }}
      accessibilityRole="button"
    >
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: iconBackground,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={22}
          color={iconColor}
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>

        <Text style={styles.subtitle}>
          {subtitle}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={20}
        color="#0F172A"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    minHeight: 68,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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

  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },

  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    flex: 1,
  },

  title: {
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "600",
  },

  subtitle: {
    color: "#64748B",
    fontSize: 11,
    marginTop: 2,
  },
});
