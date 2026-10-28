import { act, renderHook, waitFor } from "@testing-library/react-native";
import type { PropsWithChildren } from "react";
import { TestProtectionProvider, useTestProtection } from "@/providers/TestProtectionProvider";
import { useProtectTestNavigation } from "./useProtectTestNavigation";

jest.mock("expo-router", () => {
  const React = require("react");
  return {
    useFocusEffect: (callback: () => void | (() => void)) =>
      React.useEffect(callback, [callback]),
  };
});

function TestWrapper({ children }: PropsWithChildren) {
  return <TestProtectionProvider>{children}</TestProtectionProvider>;
}

describe("useProtectTestNavigation", () => {
  it("ativa a proteção e atualiza os dados quando o teste está ativo", () => {
    const { result, rerender } = renderHook(
      ({ isActive, currentStep }: { isActive: boolean; currentStep: number }) => {
        const context = useTestProtection();
        useProtectTestNavigation({
          isActive,
          patientName: "Maria da Silva",
          instrumentName: "MEEM",
          currentStep,
          totalSteps: 12,
        });
        return context;
      },
      {
        initialProps: { isActive: true, currentStep: 0 },
        wrapper: TestWrapper,
      },
    );

    expect(result.current.isTestInProgress).toBe(true);
    expect(result.current.testData).toEqual({
      patientName: "Maria da Silva",
      instrumentName: "MEEM",
      currentStep: 0,
      totalSteps: 12,
    });
    expect(result.current.hasUnansweredQuestions).toBe(false);

    rerender({ isActive: true, currentStep: 4 });
    expect(result.current.hasUnansweredQuestions).toBe(true);
    expect(result.current.testData?.currentStep).toBe(4);
  });

  it("desativa a proteção quando o teste fica inativo e na desmontagem", () => {
    const { result, rerender, unmount } = renderHook(
      ({ isActive }: { isActive: boolean }) => {
        const context = useTestProtection();
        useProtectTestNavigation({
          isActive,
          patientName: "Maria",
          instrumentName: "MEEM",
          currentStep: 1,
          totalSteps: 12,
        });
        return context;
      },
      { initialProps: { isActive: true }, wrapper: TestWrapper },
    );

    rerender({ isActive: false });
    expect(result.current.isTestInProgress).toBe(false);
    expect(result.current.testData).toBeUndefined();
    expect(result.current.hasUnansweredQuestions).toBe(false);

    rerender({ isActive: true });
    expect(result.current.isTestInProgress).toBe(true);
    unmount();
  });

  it("expõe os setters do contexto para a tentativa de navegação pelo menu", async () => {
    const { result } = renderHook(() => useTestProtection(), {
      wrapper: TestWrapper,
    });
    const callback = jest.fn();

    act(() => result.current.setOnMenuNavigationAttempt(() => callback));
    await waitFor(() => {
      expect(result.current.onMenuNavigationAttempt).toBe(callback);
    });
  });

  it("lança erro claro quando o contexto é usado fora do provider", () => {
    expect(() => renderHook(() => useTestProtection())).toThrow(
      "useTestProtection must be used within TestProtectionProvider",
    );
  });
});
