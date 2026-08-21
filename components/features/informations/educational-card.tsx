import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

type EducationalCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  items: string[];
  backgroundColor: string;
  borderColor: string;
  iconBackgroundColor: string;
  textColor: string;
  marker?: "check" | "bullet" | "warning";
  boldPrefixes?: string[];
};

export function EducationalCard({
  icon,
  title,
  items,
  backgroundColor,
  borderColor,
  iconBackgroundColor,
  textColor,
  marker = "bullet",
  boldPrefixes = [],
}: EducationalCardProps) {
  function renderMarker() {
    if (marker === "check") {
      return <Text style={[styles.marker, { color: textColor }]}>✓</Text>;
    }

    if (marker === "warning") {
      return (
        <Ionicons
          name="warning"
          size={14}
          color={textColor}
          style={styles.warningIcon}
        />
      );
    }

    return <Text style={[styles.marker, { color: textColor }]}>•</Text>;
  }

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor,
          borderColor,
        },
      ]}
    >
      <View style={styles.header}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: iconBackgroundColor,
            },
          ]}
        >
          <Ionicons name={icon} size={23} color="#FFFFFF" />
        </View>

        <Text style={[styles.title, { color: textColor }]}>
          {title}
        </Text>
      </View>

      <View style={styles.list}>
        {items.map((item, index) => {
          const prefix = boldPrefixes[index];

          return (
            <View key={`${title}-${index}`} style={styles.row}>
              {renderMarker()}

              <Text
                style={[
                  styles.text,
                  { color: textColor },
                ]}
              >
                {prefix ? (
                  <>
                    <Text style={styles.bold}>{prefix}</Text>
                    {item.slice(prefix.length)}
                  </>
                ) : (
                  item
                )}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },

  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },

  list: {
    gap: 8,
  },

  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 7,
  },

  marker: {
    fontSize: 12,
    lineHeight: 18,
  },

  warningIcon: {
    marginTop: 2,
  },

  text: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },

  bold: {
    fontWeight: "700",
  },
});
