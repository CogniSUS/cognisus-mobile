import { render } from "@testing-library/react-native";
import { HistoryChart } from "./history-chart";

jest.mock("react-native-svg", () => {
  const React = require("react");
  const { Text, View } = require("react-native");
  const Svg = ({ children }: { children: React.ReactNode }) =>
    React.createElement(View, null, children);
  const SvgText = ({ children }: { children: React.ReactNode }) =>
    React.createElement(Text, null, children);
  const SvgShape = ({ children }: { children?: React.ReactNode }) =>
    React.createElement(View, null, children);
  return {
    __esModule: true,
    default: Svg,
    Circle: SvgShape,
    G: SvgShape,
    Line: SvgShape,
    Path: SvgShape,
    Text: SvgText,
  };
});

const makeResult = (id: string, date: string, score: number) => ({
  id,
  patientId: "patient-1",
  instrumentId: "meem",
  testName: "MEEM",
  testAbbreviation: "MEEM",
  date,
  score,
  maxScore: 30,
  classification: "Normal",
  status: "normal" as const,
});

describe("HistoryChart", () => {
  it("informa quando não há avaliações para o gráfico", () => {
    const { getByText } = render(<HistoryChart results={[]} maxScore={30} />);

    expect(
      getByText("Nenhuma avaliação disponível para o gráfico."),
    ).toBeTruthy();
  });

  it("renderiza uma avaliação, os limites do eixo e ignora data inválida", () => {
    const { getByText } = render(
      <HistoryChart
        results={[
          makeResult("one", "2025-06-15T12:00:00.000Z", 18),
          makeResult("bad-date", "data inválida", 10),
        ]}
        maxScore={30}
      />,
    );

    expect(getByText("Evolução das Pontuações")).toBeTruthy();
    expect(getByText("0")).toBeTruthy();
    expect(getByText("15")).toBeTruthy();
    expect(getByText("30")).toBeTruthy();
    expect(getByText("15/06")).toBeTruthy();
  });

  it("ordena e limita a série às seis avaliações mais recentes", () => {
    const results = Array.from({ length: 7 }, (_, index) =>
      makeResult(
        `r-${index}`,
        `2025-06-${String(index + 1).padStart(2, "0")}T12:00:00.000Z`,
        index * 3,
      ),
    );
    const { getByText, queryByText } = render(
      <HistoryChart results={results.reverse()} maxScore={30} />,
    );

    expect(getByText("Evolução das Pontuações")).toBeTruthy();
    expect(queryByText("01/06")).toBeNull();
    expect(getByText("07/06")).toBeTruthy();
  });
});
