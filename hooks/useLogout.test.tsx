import { act, renderHook } from "@testing-library/react-native";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/hooks/useToast";
import { useLogout } from "./useLogout";

jest.mock("@/providers/AuthProvider", () => ({ useAuth: jest.fn() }));
jest.mock("@/hooks/useToast", () => ({ useToast: jest.fn() }));

const logoutFromAuth = jest.fn();
const toast = { error: jest.fn(), success: jest.fn() };

describe("useLogout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useAuth).mockReturnValue({ logout: logoutFromAuth } as never);
    jest.mocked(useToast).mockReturnValue(toast as never);
  });

  it("executa o logout e notifica sucesso", async () => {
    logoutFromAuth.mockResolvedValue(undefined);
    const { result } = renderHook(() => useLogout());

    await act(async () => {
      await result.current.logout();
    });

    expect(logoutFromAuth).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledWith("Logout realizado com sucesso.");
    expect(result.current.isLoggingOut).toBe(false);
  });

  it("notifica falha e encerra o loading se o logout rejeitar", async () => {
    logoutFromAuth.mockRejectedValue(new Error("sessão indisponível"));
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const { result } = renderHook(() => useLogout());

    await act(async () => {
      await result.current.logout();
    });

    expect(toast.error).toHaveBeenCalledWith(
      "Falha ao fazer logout. Tente novamente.",
    );
    expect(result.current.isLoggingOut).toBe(false);
    errorSpy.mockRestore();
  });
});
