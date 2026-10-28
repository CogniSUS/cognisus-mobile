import { fireEvent, render } from "@testing-library/react-native";
import { useNetInfo } from "@react-native-community/netinfo";
import { useLogout } from "@/hooks/useLogout";
import { LogoutButton } from "./logout-button";

jest.mock("@expo/vector-icons", () => ({ Ionicons: () => null }));
jest.mock("@react-native-community/netinfo", () => ({ useNetInfo: jest.fn() }));
jest.mock("@/hooks/useLogout", () => ({ useLogout: jest.fn() }));

describe("LogoutButton", () => {
  const logout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useLogout).mockReturnValue({ logout, isLoggingOut: false });
    jest.mocked(useNetInfo).mockReturnValue({ isConnected: true } as never);
  });

  it("permite sair quando há conexão", () => {
    const { getByText } = render(<LogoutButton />);

    fireEvent.press(getByText("Sair do Aplicativo"));

    expect(logout).toHaveBeenCalledTimes(1);
  });

  it("desabilita a saída offline e informa o estado ao usuário", () => {
    jest.mocked(useNetInfo).mockReturnValue({ isConnected: false } as never);
    const { getByText } = render(<LogoutButton />);

    expect(getByText("Sair (Sem conexão)")).toBeTruthy();
    fireEvent.press(getByText("Sair (Sem conexão)"));
    expect(logout).not.toHaveBeenCalled();
  });

  it("apresenta e desabilita o estado de saída em andamento", () => {
    jest.mocked(useLogout).mockReturnValue({ logout, isLoggingOut: true });
    const { getByText } = render(<LogoutButton />);

    expect(getByText("Saindo...")).toBeTruthy();
    fireEvent.press(getByText("Saindo..."));
    expect(logout).not.toHaveBeenCalled();
  });
});
