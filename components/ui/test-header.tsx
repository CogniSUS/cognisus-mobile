import React from "react";
import { StyleSheet, Text, View } from "react-native";

type TestHeaderProps = {
  patientName: string;
  instrumentName: string;
  currentStep: number;
  totalSteps: number;
};

export function TestHeader({
  patientName,
  instrumentName,
  currentStep,
  totalSteps,
}: Readonly<TestHeaderProps>) {
  // Calcula a porcentagem para preencher a barra de progresso
  const progressPercentage = Math.round((currentStep / totalSteps) * 100);

  return (
    <View style={styles.container}>
      {/* Card Branco Superior */}
      <View style={styles.card}>
        <View style={styles.leftColumn}>
          <Text style={styles.patientName} numberOfLines={1}>
            {patientName || "Paciente"}
          </Text>
          <Text style={styles.instrumentName} numberOfLines={1}>
            {instrumentName || "Instrumento não informado"}
          </Text>
        </View>

        <View style={styles.rightColumn}>
          <Text style={styles.stepText}>
            {currentStep}/{totalSteps}
          </Text>
          <Text style={styles.stepLabel}>Etapas</Text>
        </View>
      </View>

      {/* Barra de Progresso (Externa ao card) */}
      <View style={styles.progressBarBackground}>
        <View
          style={[styles.progressBarFill, { width: `${progressPercentage}%` }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24, // Espaço entre o header e as perguntas do teste
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16, // Espaço entre o card e a barra de progresso
    // Sombra leve para destacar o card no fundo cinza
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  leftColumn: {
    flex: 1, // Ocupa o espaço disponível sem empurrar a coluna da direita
    marginRight: 16,
  },
  rightColumn: {
    alignItems: "flex-end", // Alinha os textos da direita ao final
  },
  patientName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  instrumentName: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  stepText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#9D22F0", // O tom de roxo do seu app
  },
  stepLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: "#E5E7EB", // Cinza clarinho do fundo da barra
    borderRadius: 3,
    width: "100%",
    overflow: "hidden", // Garante que o preenchimento não vaze as bordas
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#9D22F0", // Roxo preenchendo a barra
    borderRadius: 3,
  },
});
