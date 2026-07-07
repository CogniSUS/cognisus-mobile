import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type QuestionCardProps = {
  question: {
    id: string;
    label: string;
    points: number;
  };
  currentValue?: number; // undefined (não respondido), 1 (correto) ou 0 (incorreto)
  onAnswer: (questionId: string, value: number) => void;
};

export function QuestionCard({
  question,
  currentValue,
  onAnswer,
}: Readonly<QuestionCardProps>) {
  const isCorretoSelecionado = currentValue === question.points;
  const isIncorretoSelecionado = currentValue === 0;

  return (
    <View style={styles.card}>
      <Text style={styles.questionText}>{question.label}</Text>

      <View style={styles.buttonsRow}>
        {/* BOTÃO CORRETO */}
        <TouchableOpacity
          style={[
            styles.answerButton,
            isCorretoSelecionado && styles.buttonSelectedCorreto,
          ]}
          onPress={() => onAnswer(question.id, question.points)}
          activeOpacity={0.7}
        >
          <Feather
            name="check"
            size={18}
            color={isCorretoSelecionado ? "#15803D" : "#6B7280"} // Verde ou Cinza
          />
          <Text
            style={[
              styles.buttonText,
              isCorretoSelecionado && styles.textSelectedCorreto,
            ]}
          >
            Correto
          </Text>
        </TouchableOpacity>

        {/* BOTÃO INCORRETO */}
        <TouchableOpacity
          style={[
            styles.answerButton,
            isIncorretoSelecionado && styles.buttonSelectedIncorreto,
          ]}
          onPress={() => onAnswer(question.id, 0)}
          activeOpacity={0.7}
        >
          <Feather
            name="x"
            size={18}
            color={isIncorretoSelecionado ? "#B91C1C" : "#6B7280"} // Vermelho ou Cinza
          />
          <Text
            style={[
              styles.buttonText,
              isIncorretoSelecionado && styles.textSelectedIncorreto,
            ]}
          >
            Incorreto
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
  },
  questionText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 16,
  },
  buttonsRow: {
    flexDirection: "row",
    gap: 12,
  },

  answerButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6B7280",
    marginLeft: 6,
  },

  buttonSelectedCorreto: {
    backgroundColor: "#F0FDF4",
    borderColor: "#15803D",
  },
  textSelectedCorreto: {
    color: "#15803D",
  },

  buttonSelectedIncorreto: {
    backgroundColor: "#FEF2F2",
    borderColor: "#B91C1C",
  },
  textSelectedIncorreto: {
    color: "#B91C1C",
  },
});
