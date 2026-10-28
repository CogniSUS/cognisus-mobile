import { act, fireEvent, render } from "@testing-library/react-native";
import { useToast } from "@/hooks/useToast";
import { TimerCard } from "./time-card";

jest.mock("@/hooks/useToast", () => ({ useToast: jest.fn() }));
jest.mock("@expo/vector-icons", () => ({ Feather: () => null }));

const showInfo = jest.fn();

describe("TimerCard", () => {
  it("usa 60 segundos como duração padrão", () => {
    const { getByText } = render(<TimerCard />);

    expect(getByText("Iniciar Cronômetro (60s)")).toBeTruthy();
  });

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    jest.mocked(useToast).mockReturnValue({ info: showInfo } as never);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("inicia, oculta e mostra novamente a contagem regressiva", () => {
    const { getByText, queryByText } = render(<TimerCard amountOfTime={3} />);

    fireEvent.press(getByText("Iniciar Cronômetro (3s)"));
    expect(getByText("3s")).toBeTruthy();
    expect(getByText("Ocultar Cronômetro")).toBeTruthy();

    fireEvent.press(getByText("Ocultar Cronômetro"));
    expect(queryByText("3s")).toBeNull();
    expect(getByText("Mostrar Cronômetro")).toBeTruthy();

    fireEvent.press(getByText("Mostrar Cronômetro"));
    expect(getByText("3s")).toBeTruthy();
  });

  it("encerra o cronômetro, informa o fim e desabilita o botão", async () => {
    const { getByText } = render(<TimerCard amountOfTime={1} />);

    fireEvent.press(getByText("Iniciar Cronômetro (1s)"));
    await act(async () => {
      jest.advanceTimersByTime(1000);
      await Promise.resolve();
    });

    expect(getByText("0s")).toBeTruthy();
    expect(getByText("Tempo Esgotado")).toBeTruthy();
    expect(showInfo).toHaveBeenCalledWith("O tempo desta etapa acabou!");
  });
});
