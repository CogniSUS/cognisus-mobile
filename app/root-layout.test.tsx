import { act, render, waitFor } from "@testing-library/react-native";
import NetInfo from "@react-native-community/netinfo";
import { database } from "@/database/database";
import { useAuth } from "@/providers/AuthProvider";
import { syncData } from "@/services/sync/initialSync";
import { Q } from "@nozbe/watermelondb";
import { useRouter, useSegments } from "expo-router";
import AppLayout from "./_layout";

jest.mock("@/database/database", () => ({
  database: { collections: { get: jest.fn() } },
}));
jest.mock("@/providers/AuthProvider", () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: jest.fn(),
}));
jest.mock("@/providers/TestProtectionProvider", () => ({
  TestProtectionProvider: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock("@/providers/ToastProvider", () => ({
  ToastProvider: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock("@/services/sync/initialSync", () => ({ syncData: jest.fn() }));
jest.mock("@nozbe/watermelondb", () => ({ Q: { where: jest.fn() } }));
jest.mock("@react-native-community/netinfo", () => ({
  __esModule: true,
  default: { addEventListener: jest.fn() },
}));
jest.mock("expo-router", () => ({
  Slot: () => {
    const { Text } = require("react-native");
    return <Text>Conteúdo da rota</Text>;
  },
  useRouter: jest.fn(),
  useSegments: jest.fn(),
}));

const router = { replace: jest.fn() };
const session = { user: { id: "user-1" } };
const unsubscribe = jest.fn();

describe("layout raiz", () => {
  const fetchCount = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useAuth).mockReturnValue({
      session: null,
      isLoading: false,
      user: null,
      logout: jest.fn(),
    } as never);
    jest.mocked(useRouter).mockReturnValue(router as never);
    jest.mocked(useSegments).mockReturnValue(["(app)"] as never);
    jest.mocked(Q.where).mockReturnValue({} as never);
    fetchCount.mockResolvedValue(1);
    jest.mocked(database.collections.get).mockReturnValue({
      query: () => ({ fetchCount }),
    } as never);
    jest.mocked(syncData).mockResolvedValue(undefined);
    jest.mocked(NetInfo.addEventListener).mockReturnValue(unsubscribe as never);
  });

  it("mantém a tela de carregamento enquanto a autenticação está inicializando", () => {
    jest.mocked(useAuth).mockReturnValue({
      session: null,
      isLoading: true,
      user: null,
      logout: jest.fn(),
    } as never);
    const { getByText } = render(<AppLayout />);

    expect(getByText("Carregando...")).toBeTruthy();
    expect(syncData).not.toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("direciona uma sessão anônima para login fora do grupo público", async () => {
    render(<AppLayout />);

    await waitFor(() =>
      expect(router.replace).toHaveBeenCalledWith("/(auth)/sign-in"),
    );
    expect(database.collections.get).not.toHaveBeenCalled();
  });

  it("redireciona uma sessão autenticada para o aplicativo quando está no grupo auth", async () => {
    jest.mocked(useAuth).mockReturnValue({
      session,
      isLoading: false,
      user: session.user,
      logout: jest.fn(),
    } as never);
    jest.mocked(useSegments).mockReturnValue(["(auth)"] as never);
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    render(<AppLayout />);

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/(app)"));
    expect(database.collections.get).toHaveBeenCalledWith("profissional");
    expect(syncData).toHaveBeenCalledTimes(1);
    logSpy.mockRestore();
  });

  it("sincroniza quando a rede retorna e remove o listener no unmount", async () => {
    jest.mocked(useAuth).mockReturnValue({
      session,
      isLoading: false,
      user: session.user,
      logout: jest.fn(),
    } as never);
    let listener: ((state: unknown) => void) | undefined;
    jest.mocked(NetInfo.addEventListener).mockImplementation((callback) => {
      listener = callback as never;
      return unsubscribe as never;
    });
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const { unmount } = render(<AppLayout />);
    await waitFor(() => expect(syncData).toHaveBeenCalledTimes(1));

    await act(async () => {
      listener?.({ isConnected: true, isInternetReachable: true });
      await Promise.resolve();
    });
    expect(syncData).toHaveBeenCalledTimes(2);

    unmount();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
    logSpy.mockRestore();
  });

  it("mostra sincronização para profissional novo e libera a rota ao terminar", async () => {
    jest.mocked(useAuth).mockReturnValue({
      session,
      isLoading: false,
      user: session.user,
      logout: jest.fn(),
    } as never);
    fetchCount.mockResolvedValue(0);
    let finishSync!: () => void;
    jest.mocked(syncData).mockReturnValue(
      new Promise<void>((resolve) => { finishSync = resolve; }),
    );
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const { getByText } = render(<AppLayout />);

    await waitFor(() =>
      expect(
        getByText("Sincronizando seus dados para uso offline..."),
      ).toBeTruthy(),
    );
    await act(async () => finishSync());
    await waitFor(() => expect(getByText("Conteúdo da rota")).toBeTruthy());
    logSpy.mockRestore();
  });

  it("registra falha na sincronização inicial e mantém a navegação disponível", async () => {
    jest.mocked(useAuth).mockReturnValue({
      session,
      isLoading: false,
      user: session.user,
      logout: jest.fn(),
    } as never);
    fetchCount.mockRejectedValue(new Error("banco indisponível"));
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const { getByText } = render(<AppLayout />);

    await waitFor(() => expect(errorSpy).toHaveBeenCalled());
    expect(getByText("Conteúdo da rota")).toBeTruthy();
    errorSpy.mockRestore();
  });
});
