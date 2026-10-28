import { fireEvent, render } from "@testing-library/react-native";
import { HistoryFilter } from "./history-filter";
import { HistoryResultCard } from "./history-result-card";

jest.mock("@expo/vector-icons", () => ({ Ionicons: () => null }));

const result = {
  id: "result-1",
  patientId: "patient-1",
  instrumentId: "meem",
  testName: "Mini Exame do Estado Mental",
  testAbbreviation: "MEEM",
  date: "2025-06-15T12:00:00.000Z",
  score: 24,
  maxScore: 30,
  classification: "Sem alteração",
  status: "normal" as const,
};

describe("componentes de histórico", () => {
  it("expõe os filtros disponíveis e comunica a seleção", () => {
    const onChange = jest.fn();
    const { getByText } = render(
      <HistoryFilter value="all" onChange={onChange} />,
    );

    fireEvent.press(getByText("MEEM"));
    fireEvent.press(getByText("MoCA"));
    fireEvent.press(getByText("Fluência"));

    expect(onChange.mock.calls.map(([filter]) => filter)).toEqual([
      "meem",
      "moca",
      "fluencia",
    ]);
  });

  it("mostra resultado normal, formata data e encaminha o item pressionado", () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <HistoryResultCard result={result} onPress={onPress} />,
    );

    expect(getByText("Normal")).toBeTruthy();
    expect(getByText("15/06/2025")).toBeTruthy();
    expect(getByText("24/30 pontos")).toBeTruthy();
    fireEvent.press(getByText("MEEM"));
    expect(onPress).toHaveBeenCalledWith(result);
  });

  it("mostra estado alterado e preserva uma data inválida legível", () => {
    const { getByText } = render(
      <HistoryResultCard
        result={{ ...result, date: "data desconhecida", status: "alterado" }}
        onPress={() => {}}
      />,
    );

    expect(getByText("Alterado")).toBeTruthy();
    expect(getByText("data desconhecida")).toBeTruthy();
  });
});
