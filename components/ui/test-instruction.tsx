import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type TestInstructionProps = {
  instruction?: string;
  isIntro?: boolean;
};

export function TestInstruction({
  instruction,
  isIntro = false,
}: Readonly<TestInstructionProps>) {
  if (!instruction) return null;

  const instructionLines = instruction
    .split("\n")
    .filter((line) => line.trim());

  if (isIntro) {
    return (
      <View style={styles.introContainer}>
        <Feather
          name="info"
          size={18}
          color="#2563EB"
          style={styles.introIcon}
        />
        <View style={styles.introTextContainer}>
          {instructionLines.map((line, index) => {
            const isTipLine = line.trim().startsWith("💡");

            return (
              <Text
                key={`${line}-${index}`}
                style={[styles.introText, isTipLine && styles.introTipText]}
              >
                {line}
              </Text>
            );
          })}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.instructionContainer}>
      <Text style={styles.instructionText}>{instruction}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  introContainer: {
    marginBottom: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#B9D7FF",
    backgroundColor: "#ECF4FF",
    paddingVertical: 14,
    paddingHorizontal: 12,
    flexDirection: "row",
  },
  introIcon: {
    marginTop: 2,
    marginRight: 8,
  },
  introTextContainer: {
    flex: 1,
    gap: 6,
  },
  introText: {
    color: "#1D4ED8",
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "500",
  },
  introTipText: {
    fontStyle: "italic",
  },
  instructionContainer: {
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#A824EE",
    backgroundColor: "#FCF5FF",
    paddingVertical: 16,
    paddingHorizontal: 14,
  },
  instructionText: {
    color: "#7E22CE",
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "500",
  },
});
