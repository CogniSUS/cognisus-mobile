import React, { useEffect } from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { Text } from "react-native";
import { router, usePathname } from "expo-router";
import { useLogout } from "@/hooks/useLogout";
import {
  TestProtectionProvider,
  useTestProtection,
} from "@/providers/TestProtectionProvider";
import { AppHeader } from "./app-header";
import { MenuApp } from "./menu-app";
import { ProfileMenu } from "./profile-menu";

jest.mock("@expo/vector-icons", () => ({
  Ionicons: ({ name }: { name: string }) => {
    const { Text: NativeText } = require("react-native");
    return <NativeText>{name}</NativeText>;
  },
}));
jest.mock("expo-linear-gradient", () => ({
  LinearGradient: ({ children }: { children: React.ReactNode }) => {
    const { View } = require("react-native");
    return <View>{children}</View>;
  },
}));
jest.mock("expo-status-bar", () => ({ StatusBar: () => null }));
jest.mock("expo-router", () => ({
  router: { push: jest.fn(), replace: jest.fn() },
  usePathname: jest.fn(),
}));
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => {
    const { View } = require("react-native");
    return <View>{children}</View>;
  },
  useSafeAreaInsets: () => ({ bottom: 0, top: 0, left: 0, right: 0 }),
}));
jest.mock("@/hooks/useLogout", () => ({ useLogout: jest.fn() }));

function ProtectedMenu({ onAttempt }: { onAttempt: (route: string) => void }) {
  const { setIsTestInProgress, setOnMenuNavigationAttempt } = useTestProtection();
  useEffect(() => {
    setIsTestInProgress(true);
    setOnMenuNavigationAttempt(() => onAttempt);
  }, [onAttempt, setIsTestInProgress, setOnMenuNavigationAttempt]);
  return <MenuApp />;
}

function ProtectedMenuWithoutHandler() {
  const { setIsTestInProgress } = useTestProtection();
  useEffect(() => {
    setIsTestInProgress(true);
  }, [setIsTestInProgress]);
  return <MenuApp />;
}

describe("componentes de navegação", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(usePathname).mockReturnValue("/");
    jest.mocked(useLogout).mockReturnValue({
      logout: jest.fn().mockResolvedValue(undefined),
      isLoggingOut: false,
    });
  });

  it.each([
    ["Início", "/(app)"],
    ["Pacientes", "/(app)/patients"],
    ["Resultados", "/(app)/results"],
    ["Informações", "/(app)/informations"],
  ])("navega para a seção %s", (label, route) => {
    const { getByText } = render(
      <TestProtectionProvider><MenuApp /></TestProtectionProvider>,
    );

    fireEvent.press(getByText(label));
    expect(router.push).toHaveBeenCalledWith(route);
  });

  it("intercepta a navegação quando há um teste em andamento", () => {
    const onAttempt = jest.fn();
    const { getByText } = render(
      <TestProtectionProvider>
        <ProtectedMenu onAttempt={onAttempt} />
      </TestProtectionProvider>,
    );

    fireEvent.press(getByText("Informações"));

    expect(onAttempt).toHaveBeenCalledWith("/(app)/informations");
    expect(router.push).not.toHaveBeenCalled();
  });

  it.each([
    ["/", "Início"],
    ["/(app)", "Início"],
    ["/development", "Início"],
    ["/patients/1", "Pacientes"],
    ["/results/history", "Resultados"],
    ["/informations/guide", "Informações"],
  ])("destaca a seção ativa para o caminho %s", (pathname, label) => {
    jest.mocked(usePathname).mockReturnValue(pathname);
    const { getByText } = render(
      <TestProtectionProvider><MenuApp /></TestProtectionProvider>,
    );

    expect(getByText(label).props.style[1]).toEqual(
      expect.objectContaining({ color: "#B7A5D9" }),
    );
  });

  it("navega normalmente quando o teste não registrou um interceptor de menu", () => {
    const { getByText } = render(
      <TestProtectionProvider><ProtectedMenuWithoutHandler /></TestProtectionProvider>,
    );

    fireEvent.press(getByText("Pacientes"));
    expect(router.push).toHaveBeenCalledWith("/(app)/patients");
  });

  it("abre e fecha o menu de perfil, navega para configurações e sai", async () => {
    const logout = jest.fn().mockResolvedValue(undefined);
    jest.mocked(useLogout).mockReturnValue({ logout, isLoggingOut: false });
    const { getByText, getAllByText } = render(<AppHeader />);

    fireEvent.press(getByText("settings-outline"));
    expect(router.replace).toHaveBeenCalledWith("/(app)/development");

    fireEvent.press(getByText("person-outline"));
    fireEvent.press(getByText("Perfil"));
    expect(router.replace).toHaveBeenLastCalledWith("/(app)/development");

    fireEvent.press(getByText("person-outline"));
    await act(async () => {
      fireEvent.press(getByText("Sair"));
    });
    expect(logout).toHaveBeenCalledTimes(1);
    expect(getAllByText("person-outline")).toHaveLength(1);
  });

  it("renderiza ProfileMenu somente quando visível e oferece estado de saída", () => {
    const { queryByText, rerender, getByText } = render(
      <ProfileMenu
        isVisible={false}
        onClose={() => {}}
        onLogout={async () => {}}
        isLoggingOut={false}
      />,
    );

    expect(queryByText("Perfil")).toBeNull();
    rerender(
      <ProfileMenu
        isVisible
        onClose={() => {}}
        onLogout={async () => {}}
        isLoggingOut
      />,
    );
    expect(getByText("Desconectando...")).toBeTruthy();
  });
});
