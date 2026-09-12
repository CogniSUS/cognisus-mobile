import { SharePdfButton } from "@/components/ui/SharePdfButton";
import { SkillBarComponent } from "@/components/ui/SkillBar";
import { SpeedometerComponent } from "@/components/ui/Speedometer";
import { useAvaliacaoResult } from "@/hooks/useAvaliacaoResults";
import { useAuth } from "@/providers/AuthProvider";
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

export default function ResultsDetailsPage() {
  const CLASSIFICAO_NORMAL = "Normal";
  const { id,patientId } = useLocalSearchParams<{ 
    id: string; 
    patientId: string; 
  }>();
  const router = useRouter();
  const { resultado, loading } = useAvaliacaoResult(id);
  const { user } = useAuth();
  

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9D22F0" />
        <Text style={styles.loadingText}>Carregando resultados...</Text>
      </View>
    );
  }

  if (!resultado) {
    return (
      <View style={styles.loadingContainer}>
        <Feather name="alert-circle" size={48} color="#EF4444" />
        <Text style={[styles.loadingText, { color: "#EF4444", marginTop: 16 }]}>
          Nenhum resultado encontrado.
        </Text>
        <TouchableOpacity
          style={styles.btnOutline}
          onPress={() => router.push("/")}
        >
          <Text style={styles.btnOutlineText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const nomeDoProfissionalDaSessao =
    user?.user_metadata?.nome_completo || "Profissional não identificado";
  const isNormal = resultado.classificacao === CLASSIFICAO_NORMAL;
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
          <SpeedometerComponent score={resultado.score_total} />
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
          <SkillBarComponent
            label="Orientação"
            score={scoreOrientacao}
            max={10}
          />
          <SkillBarComponent label="Memória" score={scoreMemoria} max={6} />
          <SkillBarComponent
            label="Atenção e Cálculo"
            score={scoreAtencao}
            max={5}
          />
          <SkillBarComponent label="Linguagem" score={scoreLinguagem} max={9} />
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

        <SharePdfButton
          avaliacao={resultado}
          unidadeNome={resultado.unidade_nome}
          profissionalNome={nomeDoProfissionalDaSessao}
          dataAvaliacao={dataFormatada}
        />

        <TouchableOpacity
          style={styles.btnOutlineResults}
          onPress={() => router.push({
                  pathname: "/results/history",
                  params: {
                    patientId: String(patientId),
                  },
                }) }
        >
          <Text style={styles.btnOutlineText}>Ver Todos os Resultados</Text>
        </TouchableOpacity>
      </ScrollView>
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
    paddingHorizontal: 32,
    width: "85%",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  btnOutlineText: {
    color: "#A824EE",
    fontSize: 16,
    fontWeight: "bold",
  },
  btnOutlineResults: {
    borderWidth: 1.5,
    borderColor: "#A824EE",
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: "100%",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});
