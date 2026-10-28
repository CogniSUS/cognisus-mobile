import { act, fireEvent, render } from "@testing-library/react-native";
import { Animated, Text, TouchableOpacity } from "react-native";
import { useToastContext } from "./ToastProvider";
import { ToastProvider } from "./ToastProvider";

jest.mock("@expo/vector-icons", () => ({ Ionicons: () => null }));

function ToastControls() {
  const toast = useToastContext();
  return (
    <>
      <TouchableOpacity onPress={() => toast.success("Sucesso", 100)}>
        <Text>Mostrar sucesso</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => toast.error("Falha", 100)}>
        <Text>Mostrar erro</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => toast.info("Aviso", 100)}>
        <Text>Mostrar informação</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => toast.showToast({ message: "Customizado" })}>
        <Text>Mostrar genérico</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={toast.hideToast}>
        <Text>Ocultar</Text>
      </TouchableOpacity>
    </>
  );
}

describe("ToastProvider", () => {
  let animationSpy: jest.SpyInstance;

  beforeEach(() => {
    animationSpy = jest.spyOn(Animated, "parallel").mockImplementation(
      () => ({
        start: (callback?: (result: { finished: boolean }) => void) =>
          callback?.({ finished: true }),
      }) as never,
    );
  });

  afterEach(() => {
    jest.clearAllTimers();
    animationSpy.mockRestore();
    jest.useRealTimers();
  });

  it.each([
    ["Mostrar sucesso", "Sucesso"],
    ["Mostrar erro", "Falha"],
    ["Mostrar informação", "Aviso"],
    ["Mostrar genérico", "Customizado"],
  ])("mostra a mensagem acionada por %s", (action, message) => {
    const { getByText } = render(
      <ToastProvider><ToastControls /></ToastProvider>,
    );

    fireEvent.press(getByText(action));

    expect(getByText(message)).toBeTruthy();
    fireEvent.press(getByText("Ocultar"));
  });

  it("oculta o toast por ação manual ou pelo tempo configurado", () => {
    jest.useFakeTimers();
    const { getByText, queryByText } = render(
      <ToastProvider><ToastControls /></ToastProvider>,
    );

    fireEvent.press(getByText("Mostrar genérico"));
    expect(getByText("Customizado")).toBeTruthy();
    fireEvent.press(getByText("Mostrar sucesso"));
    expect(queryByText("Customizado")).toBeNull();
    expect(getByText("Sucesso")).toBeTruthy();
    act(() => jest.advanceTimersByTime(100));
    expect(queryByText("Sucesso")).toBeNull();
  });
});
