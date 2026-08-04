import { useAvaliacaoResult } from "@/hooks/useAvaliacaoResults";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Svg, { Circle, G, Path, Polygon } from "react-native-svg";

export default function ResultsDetailsPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { resultado, loading } = useAvaliacaoResult(id);

  if (loading || !resultado) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9D22F0" />
        <Text style={styles.loadingText}>Carregando resultados...</Text>
      </View>
    );
  }

  const isNormal = resultado.classificacao === "Normal";
  const dataFormatada = new Date(resultado.data_inicio).toLocaleDateString(
    "pt-BR",
  );

  const scoreOrientacao =
    resultado.score_orientacao_espacial + resultado.score_orientacao_temporal;
  const scoreMemoria =
    resultado.score_memoria_recente + resultado.score_memoria_imediata;
  const scoreAtencao = resultado.score_atencao;
  const scoreLinguagem =
    resultado.score_linguagem + resultado.score_visuoespacial;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Cabeçalho Simples Original */}
        <View style={styles.headerCard}>
          <Text style={styles.patientName}>{resultado.paciente_nome}</Text>
          <Text style={styles.testInfo}>
            {resultado.instrumento_nome} - {dataFormatada}
          </Text>
        </View>

        {/* Card do Resultado Final com Velocímetro */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Resultado Final</Text>
          <Speedometer score={resultado.score_total} />
        </View>

        {/* Card de Classificação */}
        <View
          style={[
            styles.classificationCard,
            {
              backgroundColor: isNormal ? "#ECFDF5" : "#FEF2F2",
              borderColor: isNormal ? "#34D399" : "#F87171",
            },
          ]}
        >
          <Feather
            name={isNormal ? "check-circle" : "alert-triangle"}
            size={28}
            color={isNormal ? "#059669" : "#DC2626"}
          />
          <View style={styles.classificationTextContainer}>
            <Text
              style={[
                styles.classificationTitle,
                { color: isNormal ? "#065F46" : "#991B1B" },
              ]}
            >
              {isNormal ? "Cognição Normal" : "Possível Déficit Cognitivo"}
            </Text>
            <Text
              style={[
                styles.classificationSubtitle,
                { color: isNormal ? "#065F46" : "#991B1B" },
              ]}
            >
              Nível de Risco: {isNormal ? "Baixo" : "Alto"}
            </Text>
          </View>
        </View>

        {/* Habilidades Específicas */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Habilidades Específicas</Text>
          <SkillBar label="Orientação" score={scoreOrientacao} max={10} />
          <SkillBar label="Memória" score={scoreMemoria} max={6} />
          <SkillBar label="Atenção e Cálculo" score={scoreAtencao} max={5} />
          <SkillBar label="Linguagem" score={scoreLinguagem} max={9} />
        </View>

        {/* Condutas Sugeridas */}
        <View style={styles.card}>
          <View style={styles.conductHeader}>
            <Feather name="file-text" size={20} color="#A824EE" />
            <Text style={styles.sectionTitle}>Condutas Sugeridas</Text>
          </View>
          <View style={styles.bulletList}>
            {isNormal ? (
              <>
                <Text style={styles.bulletItem}>
                  • Manter hábitos saudáveis
                </Text>
                <Text style={styles.bulletItem}>
                  • Estimulação cognitiva regular
                </Text>
                <Text style={styles.bulletItem}>
                  • Controle de fatores de risco cardiovascular
                </Text>
                <Text style={styles.bulletItem}>• Reavaliação em 12 meses</Text>
              </>
            ) : (
              <>
                <Text style={styles.bulletItem}>
                  • Encaminhar para avaliação médica especializada
                </Text>
                <Text style={styles.bulletItem}>
                  • Solicitar exames laboratoriais complementares
                </Text>
                <Text style={styles.bulletItem}>
                  • Orientar familiares sobre os resultados
                </Text>
                <Text style={styles.bulletItem}>
                  • Agendar retorno em 3 meses
                </Text>
              </>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={styles.btnOutline}
          onPress={() => router.push("/(app)/results")}
        >
          <Text style={styles.btnOutlineText}>Ver Todos os Resultados</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// -----------------------------------------------------
// Subcomponentes da Tela
// -----------------------------------------------------

function Speedometer({ score }: { score: number }) {
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

function SkillBar({
  label,
  score,
  max,
}: {
  label: string;
  score: number;
  max: number;
}) {
  const percentage = Math.min(100, Math.max(0, (score / max) * 100));

  return (
    <View style={styles.skillContainer}>
      <View style={styles.skillHeader}>
        <Text style={styles.skillLabel}>{label}</Text>
        <Text style={styles.skillScore}>
          {score}/{max}
        </Text>
      </View>
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${percentage}%` }]} />
      </View>
    </View>
  );
}

// -----------------------------------------------------
// Estilização (Styles)
// -----------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F4FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F6F4FA",
  },
  loadingText: {
    marginTop: 12,
    color: "#6B7280",
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    gap: 16,
    paddingBottom: 40,
  },
  headerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  patientName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  testInfo: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 16,
    textAlign: "center",
  },
  // Estilos do Velocímetro (Speedometer)
  speedometerContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 140,
    paddingTop: 10,
  },
  speedometerTextContainer: {
    position: "absolute",
    bottom: 5,
    alignItems: "center",
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
  classificationCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  classificationTextContainer: {
    marginLeft: 16,
  },
  classificationTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  classificationSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  skillContainer: {
    marginBottom: 16,
  },
  skillHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  skillLabel: {
    fontSize: 14,
    color: "#4B5563",
  },
  skillScore: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  progressBarBg: {
    height: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#A824EE",
    borderRadius: 4,
  },
  conductHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bulletList: {
    marginTop: 8,
    gap: 8,
  },
  bulletItem: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
  },
  btnOutline: {
    borderWidth: 1.5,
    borderColor: "#A824EE",
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  btnOutlineText: {
    color: "#A824EE",
    fontSize: 16,
    fontWeight: "bold",
  },
});
