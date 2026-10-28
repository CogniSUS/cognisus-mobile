import { act, fireEvent, render, renderHook, waitFor } from "@testing-library/react-native";
import { Text, TouchableOpacity } from "react-native";
import { database } from "@/database/database";
import { syncData } from "@/services/sync/initialSync";
import { hasUnsyncedChanges } from "@nozbe/watermelondb/sync";
import { supabase } from "@/utils/supabase";
import { AuthProvider, useAuth } from "./AuthProvider";

jest.mock("@/database/database", () => ({
  database: { write: jest.fn(), unsafeResetDatabase: jest.fn() },
}));
jest.mock("@/services/sync/initialSync", () => ({ syncData: jest.fn() }));
jest.mock("@nozbe/watermelondb/sync", () => ({
  hasUnsyncedChanges: jest.fn(),
}));
jest.mock("@/utils/supabase", () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
      signOut: jest.fn(),
    },
  },
}));

function AuthProbe() {
  const { session, user, isLoading, logout } = useAuth();
  return (
    <>
      <Text>{isLoading ? "carregando" : "pronto"}</Text>
      <Text>{user?.id ?? "sem usuário"}</Text>
      <Text>{session?.access_token ?? "sem sessão"}</Text>
      <TouchableOpacity onPress={logout}>
        <Text>Sair agora</Text>
      </TouchableOpacity>
    </>
  );
}

const session = {
  access_token: "token-1",
  user: { id: "user-1" },
} as never;

describe("AuthProvider", () => {
  let listener: ((_event: string, nextSession: unknown) => void) | undefined;
  let unsubscribe: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    listener = undefined;
    unsubscribe = jest.fn();
    jest.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    } as never);
    jest.mocked(supabase.auth.onAuthStateChange).mockImplementation((callback) => {
      listener = callback as never;
      return { data: { subscription: { unsubscribe } } } as never;
    });
    jest.mocked(database.write).mockImplementation(async (work) =>
      (work as () => Promise<void>)(),
    );
    jest.mocked(database.unsafeResetDatabase).mockResolvedValue(undefined as never);
    jest.mocked(supabase.auth.signOut).mockResolvedValue({ error: null } as never);
    jest.mocked(hasUnsyncedChanges).mockResolvedValue(false);
    jest.mocked(syncData).mockResolvedValue(undefined);
  });

  it("fornece sessão vazia e logout inofensivo fora do provider", async () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.session).toBeNull();
    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(true);
    await expect(result.current.logout()).resolves.toBeUndefined();
  });

  it("carrega a sessão inicial e atualiza o contexto quando o auth muda", async () => {
    jest.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session },
      error: null,
    } as never);
    const { getByText, unmount } = render(
      <AuthProvider><AuthProbe /></AuthProvider>,
    );

    await waitFor(() => expect(getByText("pronto")).toBeTruthy());
    expect(getByText("user-1")).toBeTruthy();
    expect(getByText("token-1")).toBeTruthy();

    act(() => listener?.("SIGNED_OUT", null));
    expect(getByText("sem usuário")).toBeTruthy();
    expect(getByText("sem sessão")).toBeTruthy();

    unmount();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  it("faz reset local e encerra sessão ao sair sem alterações pendentes", async () => {
    const { getByText } = render(
      <AuthProvider><AuthProbe /></AuthProvider>,
    );
    await waitFor(() => expect(getByText("pronto")).toBeTruthy());

    await act(async () => fireEvent.press(getByText("Sair agora")));

    expect(hasUnsyncedChanges).toHaveBeenCalledWith({ database });
    expect(syncData).not.toHaveBeenCalled();
    expect(database.unsafeResetDatabase).toHaveBeenCalledTimes(1);
    expect(supabase.auth.signOut).toHaveBeenCalledTimes(1);
  });

  it("sincroniza dados pendentes antes de resetar o banco e sair", async () => {
    jest.mocked(hasUnsyncedChanges).mockResolvedValue(true);
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const { getByText } = render(
      <AuthProvider><AuthProbe /></AuthProvider>,
    );
    await waitFor(() => expect(getByText("pronto")).toBeTruthy());

    await act(async () => fireEvent.press(getByText("Sair agora")));

    expect(syncData).toHaveBeenCalledTimes(1);
    expect(database.unsafeResetDatabase).toHaveBeenCalledTimes(1);
    expect(supabase.auth.signOut).toHaveBeenCalledTimes(1);
    logSpy.mockRestore();
  });

  it("registra falhas do logout e encerra o estado de carregamento", async () => {
    jest.mocked(hasUnsyncedChanges).mockRejectedValue(new Error("offline"));
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const { getByText } = render(
      <AuthProvider><AuthProbe /></AuthProvider>,
    );
    await waitFor(() => expect(getByText("pronto")).toBeTruthy());

    await act(async () => fireEvent.press(getByText("Sair agora")));

    expect(errorSpy).toHaveBeenCalledWith(
      "Erro ao tentar deslogar:",
      expect.any(Error),
    );
    expect(getByText("pronto")).toBeTruthy();
    expect(database.unsafeResetDatabase).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
