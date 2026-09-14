/**
 * TestProtectionProvider
 * Gerencia a proteção contra saída acidental durante a execução de um teste
 * Fornece contexto para detectar e confirmar navegação fora do teste
 */

import React, { createContext, ReactNode, useState } from "react";

export interface TestProtectionContextType {
  isTestInProgress: boolean;
  setIsTestInProgress: (value: boolean) => void;
  hasUnansweredQuestions: boolean;
  setHasUnansweredQuestions: (value: boolean) => void;
  testData?: {
    patientName: string;
    instrumentName: string;
    currentStep: number;
    totalSteps: number;
  };
  setTestData: (data: TestProtectionContextType["testData"]) => void;
  // Callback para interceptar navegação do menu
  onMenuNavigationAttempt?: (route: string) => void;
  setOnMenuNavigationAttempt: (
    callback: ((route: string) => void) | undefined,
  ) => void;
}

export const TestProtectionContext = createContext<
  TestProtectionContextType | undefined
>(undefined);

export function TestProtectionProvider({ children }: { children: ReactNode }) {
  const [isTestInProgress, setIsTestInProgress] = useState(false);
  const [hasUnansweredQuestions, setHasUnansweredQuestions] = useState(false);
  const [testData, setTestData] =
    useState<TestProtectionContextType["testData"]>();
  const [onMenuNavigationAttempt, setOnMenuNavigationAttempt] = useState<
    ((route: string) => void) | undefined
  >();

  const value: TestProtectionContextType = {
    isTestInProgress,
    setIsTestInProgress,
    hasUnansweredQuestions,
    setHasUnansweredQuestions,
    testData,
    setTestData,
    onMenuNavigationAttempt,
    setOnMenuNavigationAttempt,
  };

  return (
    <TestProtectionContext.Provider value={value}>
      {children}
    </TestProtectionContext.Provider>
  );
}

export function useTestProtection() {
  const context = React.useContext(TestProtectionContext);
  if (!context) {
    throw new Error(
      "useTestProtection must be used within TestProtectionProvider",
    );
  }
  return context;
}
