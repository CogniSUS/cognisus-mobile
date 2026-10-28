import { renderHook } from "@testing-library/react-native";
import type { PropsWithChildren } from "react";
import { ToastProvider } from "@/providers/ToastProvider";
import { useToast } from "./useToast";

jest.mock("@expo/vector-icons", () => ({ Ionicons: () => null }));

function ToastWrapper({ children }: PropsWithChildren) {
  return <ToastProvider>{children}</ToastProvider>;
}

describe("useToast", () => {
  it("retorna as ações de toast disponibilizadas pelo provider", () => {
    const { result } = renderHook(() => useToast(), { wrapper: ToastWrapper });

    expect(typeof result.current.showToast).toBe("function");
    expect(typeof result.current.success).toBe("function");
    expect(typeof result.current.error).toBe("function");
    expect(typeof result.current.info).toBe("function");
    expect(typeof result.current.hideToast).toBe("function");
  });

  it("propaga o erro se usado sem o ToastProvider", () => {
    expect(() => renderHook(() => useToast())).toThrow(
      "useToastContext must be used within ToastProvider",
    );
  });
});
