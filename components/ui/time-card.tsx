import { useToast } from "@/hooks/useToast";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type TimerCardProps = {
  amountOfTime?: number;
};

export function TimerCard({ amountOfTime = 60 }: Readonly<TimerCardProps>) {
  const { info: showInfo } = useToast();

  const [timeLeft, setTimeLeft] = useState(amountOfTime);
  const [isRunning, setIsRunning] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | undefined;

    if (isRunning && timeLeft > 0) {
      intervalId = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      setIsRunning(false);
      setIsVisible(true);

      showInfo("O tempo desta etapa acabou!");
    }

    return () => {
      if (intervalId !== undefined) clearInterval(intervalId);
    };
  }, [isRunning, timeLeft, showInfo]);

  const handlePress = () => {
    if (timeLeft === 0) return;

    if (!isRunning && timeLeft === amountOfTime) {
      setIsRunning(true);
      setIsVisible(true);
    } else {
      setIsVisible(!isVisible);
    }
  };

  let buttonText = `Iniciar Cronômetro (${amountOfTime}s)`;
  if (isRunning || (timeLeft < amountOfTime && timeLeft > 0)) {
    buttonText = isVisible ? "Ocultar Cronômetro" : "Mostrar Cronômetro";
  } else if (timeLeft === 0) {
    buttonText = "Tempo Esgotado";
  }

  return (
    <View style={styles.container}>
      {/* BOTÃO PRINCIPAL */}
      <TouchableOpacity
        style={[styles.mainButton, timeLeft === 0 && styles.buttonDisabled]}
        onPress={handlePress}
        activeOpacity={0.8}
        disabled={timeLeft === 0}
      >
        <Feather name="clock" size={18} color="#FFFFFF" />
        <Text style={styles.buttonText}>{buttonText}</Text>
      </TouchableOpacity>
      {isVisible && (
        <View
          style={[styles.timerBox, timeLeft === 0 && styles.timerBoxFinished]}
        >
          <Text
            style={[
              styles.timerText,
              timeLeft === 0 && styles.timerTextFinished,
            ]}
          >
            {timeLeft}s
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  mainButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F97316",
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  buttonDisabled: {
    backgroundColor: "#D1D5DB",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  timerBox: {
    marginTop: 12,
    backgroundColor: "#FFF7ED",
    borderWidth: 1.5,
    borderColor: "#FDBA74",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  timerText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#EA580C",
  },
  timerBoxFinished: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FCA5A5",
  },
  timerTextFinished: {
    color: "#DC2626",
  },
});
