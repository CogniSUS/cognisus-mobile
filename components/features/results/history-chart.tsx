import { CognitiveResult } from "@/types/result";
import { StyleSheet, Text, View } from "react-native";
import Svg, {
  Circle,
  G,
  Line,
  Path,
  Text as SvgText,
} from "react-native-svg";

type HistoryChartProps = {
  results: CognitiveResult[];
  maxScore: number;
};

const WIDTH = 310;
const HEIGHT = 190;

const PADDING_LEFT = 34;
const PADDING_RIGHT = 12;
const PADDING_TOP = 16;
const PADDING_BOTTOM = 32;

function formatShortDate(date: string) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const day = String(parsed.getDate()).padStart(2, "0");
  const month = String(parsed.getMonth() + 1).padStart(2, "0");

  return `${day}/${month}`;
}

export function HistoryChart({
  results,
  maxScore,
}: HistoryChartProps) {
  const orderedResults = [...results]
    .sort(
      (a, b) =>
        new Date(a.date).getTime() -
        new Date(b.date).getTime(),
    )
    .slice(-6);

  if (orderedResults.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>
          Nenhuma avaliação disponível para o gráfico.
        </Text>
      </View>
    );
  }

  const chartWidth =
    WIDTH - PADDING_LEFT - PADDING_RIGHT;

  const chartHeight =
    HEIGHT - PADDING_TOP - PADDING_BOTTOM;

  const getX = (index: number) => {
    if (orderedResults.length === 1) {
      return PADDING_LEFT + chartWidth / 2;
    }

    return (
      PADDING_LEFT +
      (index / (orderedResults.length - 1)) *
        chartWidth
    );
  };

  const getY = (score: number) =>
    PADDING_TOP +
    chartHeight -
    (score / maxScore) * chartHeight;

  const path = orderedResults
    .map((item, index) => {
      const x = getX(index);
      const y = getY(item.score);

      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  const yTicks = [
    0,
    Math.round(maxScore / 2),
    maxScore,
  ];

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.chartIcon}>↗</Text>

        <Text style={styles.title}>
          Evolução das Pontuações
        </Text>
      </View>

      <Svg width="100%" height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        {yTicks.map((tick) => {
          const y = getY(tick);

          return (
            <G key={tick}>
              <Line
                x1={PADDING_LEFT}
                x2={WIDTH - PADDING_RIGHT}
                y1={y}
                y2={y}
                stroke="#E2E8F0"
                strokeDasharray="3 3"
              />

              <SvgText
                x={PADDING_LEFT - 8}
                y={y + 4}
                textAnchor="end"
                fontSize="10"
                fill="#94A3B8"
              >
                {tick}
              </SvgText>
            </G>
          );
        })}

        <Line
          x1={PADDING_LEFT}
          x2={PADDING_LEFT}
          y1={PADDING_TOP}
          y2={HEIGHT - PADDING_BOTTOM}
          stroke="#CBD5E1"
        />

        <Line
          x1={PADDING_LEFT}
          x2={WIDTH - PADDING_RIGHT}
          y1={HEIGHT - PADDING_BOTTOM}
          y2={HEIGHT - PADDING_BOTTOM}
          stroke="#CBD5E1"
        />

        <Path
          d={path}
          stroke="#A824EE"
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {orderedResults.map((item, index) => {
          const x = getX(index);
          const y = getY(item.score);

          return (
            <Circle
              key={item.id}
              cx={x}
              cy={y}
              r={5}
              fill="#A824EE"
            />
          );
        })}

        {orderedResults.map((item, index) => (
          <SvgText
            key={`date-${item.id}`}
            x={getX(index)}
            y={HEIGHT - 10}
            textAnchor="middle"
            fontSize="9"
            fill="#94A3B8"
          >
            {formatShortDate(item.date)}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginTop: 18,

    borderWidth: 1,
    borderColor: "#ECE8F2",

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 6,
  },

  chartIcon: {
    color: "#A824EE",
    fontSize: 20,
    fontWeight: "800",
  },

  title: {
    color: "#334155",
    fontSize: 16,
    fontWeight: "700",
  },

  empty: {
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 16,
    marginTop: 18,
  },

  emptyText: {
    color: "#64748B",
    textAlign: "center",
  },
});