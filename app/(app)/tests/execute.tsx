import { meemSteps } from "@/constants/meem";
import { useAuth } from "@/providers/AuthProvider";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Button, Text, View } from "react-native";

export default function ExecuteTest() {
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const step = meemSteps[currentStep];

  const handleNext = () => {
    if (currentStep < meemSteps.length - 1) setCurrentStep((prev) => prev + 1);
    else finalizar();
  };

  const handlePrevious = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  };

  const finalizar = () => {
    console.log("Test finished. Answers:", answers);
  };

  return (
    <View>
      <Text>Paciente ID: {params.patientId}</Text>
      <Text>Etapa: {currentStep + 1}/12</Text>
      <Text style={{ fontSize: 20 }}>{step.title}</Text>

      <Button
        title="Anterior"
        onPress={handlePrevious}
        disabled={currentStep === 0}
      />
      <Button title="Próximo" onPress={handleNext} />
    </View>
  );
}
