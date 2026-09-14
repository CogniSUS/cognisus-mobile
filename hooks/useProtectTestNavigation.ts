/**
 * useTestProtection Hook
 * Protege contra saída acidental de uma tela de teste
 * Deve ser chamado na tela de execução do teste
 *
 * Uso:
 * useProtectTestNavigation({
 *   isActive: !loadingDados && !isFinalizando,
 *   patientName: "João da Silva",
 *   instrumentName: "MEEM",
 *   currentStep: 5,
 *   totalSteps: 12,
 *   onNavigationBlocked: () => setShowAbandonModal(true)
 * })
 */

import { useTestProtection } from "@/providers/TestProtectionProvider";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";

export interface UseProtectTestNavigationProps {
  isActive: boolean; // Se a proteção deve estar ativa
  patientName: string;
  instrumentName: string;
  currentStep: number;
  totalSteps: number;
  onNavigationBlocked?: () => void; // Callback quando navegação é bloqueada
}

export function useProtectTestNavigation({
  isActive,
  patientName,
  instrumentName,
  currentStep,
  totalSteps,
  onNavigationBlocked,
}: UseProtectTestNavigationProps) {
  const { setIsTestInProgress, setTestData, setHasUnansweredQuestions } =
    useTestProtection();

  useFocusEffect(
    useCallback(() => {
      if (isActive) {
        // Ativa proteção quando tela entra em foco
        setIsTestInProgress(true);
        setTestData({
          patientName,
          instrumentName,
          currentStep,
          totalSteps,
        });
        setHasUnansweredQuestions(currentStep > 0); // Se não está na primeira etapa, tem progresso
      } else {
        // Desativa quando sai do foco
        setIsTestInProgress(false);
        setTestData(undefined);
        setHasUnansweredQuestions(false);
      }

      // Cleanup ao desmontar
      return () => {
        setIsTestInProgress(false);
        setTestData(undefined);
        setHasUnansweredQuestions(false);
      };
    }, [
      isActive,
      patientName,
      instrumentName,
      currentStep,
      totalSteps,
      setIsTestInProgress,
      setTestData,
      setHasUnansweredQuestions,
      onNavigationBlocked,
    ]),
  );
}
