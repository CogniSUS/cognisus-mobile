import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, G, Path, Polygon } from "react-native-svg";

export function SpeedometerComponent({ score }: Readonly<{ score: number }>) {
  // Mantém o score entre 0 e 30 por segurança
  const safeScore = Math.min(30, Math.max(0, score));

  // O ponteiro varre 180 graus (da esquerda pra direita)
  const angle = (safeScore / 30) * 180;

  return (
    <View style={styles.speedometerContainer}>
      <Svg width="220" height="130" viewBox="0 0 200 120">
        {/* Arco Vermelho (Esquerda: 0 a 10 pontos) */}
        <Path
          d="M 20 100 A 80 80 0 0 1 60 30.72"
          fill="none"
          stroke="#EF4444"
          strokeWidth="18"
          strokeLinecap="round"
        />

        {/* Arco Amarelo (Centro: 11 a 20 pontos) */}
        <Path
          d="M 60 30.72 A 80 80 0 0 1 140 30.72"
          fill="none"
          stroke="#FBBF24"
          strokeWidth="18"
        />

        {/* Arco Verde (Direita: 21 a 30 pontos) */}
        <Path
          d="M 140 30.72 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#34D399"
          strokeWidth="18"
          strokeLinecap="round"
        />

        {/* Ponteiro Pivô Dinâmico */}
        <G rotation={angle} origin="100, 100">
          <Polygon points="100,95 100,105 26,100" fill="#1F2937" />
          <Circle cx="100" cy="100" r="10" fill="#1F2937" />
        </G>
      </Svg>

      <View style={styles.speedometerTextContainer}>
        <Text style={styles.gaugeScore}>{safeScore}</Text>
        <Text style={styles.gaugeMax}>de 30 pontos</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  speedometerContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 10,
    // Removido o height fixo de 140 para o container se adaptar ao tamanho do conteúdo
  },
  speedometerTextContainer: {
    // Removido o position: "absolute" e o bottom: 5 que causavam a sobreposição
    alignItems: "center",
    marginTop: 5, // Dá um respiro visual perfeito entre a base do ponteiro e o número
  },
  gaugeScore: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#1F2937",
  },
  gaugeMax: {
    fontSize: 12,
    color: "#6B7280",
  },
});
