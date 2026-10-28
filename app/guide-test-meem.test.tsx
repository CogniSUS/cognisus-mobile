import { fireEvent, render } from "@testing-library/react-native";
import { router, useLocalSearchParams } from "expo-router";
import InstrumentGuidePage from "./(app)/informations/guide-test-meem";

jest.mock("@expo/vector-icons", () => ({
  Ionicons: ({ name }: { name: string }) => {
    const { Text: NativeText } = require("react-native");
    return <NativeText>{name}</NativeText>;
  },
}));
jest.mock("expo-router", () => ({
  router: { back: jest.fn() },
  useLocalSearchParams: jest.fn(),
}));

describe("InstrumentGuidePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useLocalSearchParams).mockReturnValue({
      instrumentNome: "MEEM versão 2",
    } as never);
  });

  it("mostra o guia e retorna à tela anterior", () => {
    const { getByText } = render(<InstrumentGuidePage />);

    expect(getByText("Tutorial de Aplicação do MEEM versão 2")).toBeTruthy();
    expect(getByText("Antes de iniciar")).toBeTruthy();
    expect(getByText("Verificação Sensorial")).toBeTruthy();
    expect(getByText("Atenção e cálculo")).toBeTruthy();
    expect(getByText("Importante")).toBeTruthy();
    fireEvent.press(getByText("arrow-back"));
    expect(router.back).toHaveBeenCalledTimes(1);
  });

  it("usa MEEM como nome padrão quando o parâmetro não existe", () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({} as never);
    const { getByText } = render(<InstrumentGuidePage />);

    expect(getByText("Tutorial de Aplicação do MEEM")).toBeTruthy();
  });
});
