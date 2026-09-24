import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type GuideStep = {
  id: string;
  title: string;
  content: string;
  icon: keyof typeof Ionicons.glyphMap;
  isImportant?: boolean;
};

const meemSteps: GuideStep[] = [
  {
    id: "1",
    title: "Antes de iniciar",
    content:
      "Realize a avaliação em ambiente tranquilo, com o mínimo de interferências. Deixe o participante confortável e explique que serão feitas algumas perguntas e tarefas breves. Evite demonstrar aprovação ou reprovação diante das respostas e não corrija os erros durante a aplicação.",
    icon: "information-circle-outline",
  },
  {
    id: "2",
    title: "Verificação Sensorial",
    content:
      "Certifique-se de que o paciente está utilizando óculos ou aparelho auditivo, se necessário. Alterações visuais ou auditivas severas devem ser registradas previamente, pois interferem diretamente em tarefas de leitura, cópia de desenho e compreensão de comandos orais.",
    icon: "eye-outline",
    isImportant: true,
  },
  {
    id: "3",
    title: "Orientação temporal e espacial",
    content:
      "Faça as perguntas na ordem apresentada pelo aplicativo, sem fornecer pistas ou induzir respostas. Aguarde a resposta espontânea do participante antes de prosseguir.",
    icon: "compass-outline",
  },
  {
    id: "4",
    title: "Registro – memória imediata",
    content:
      "Diga as três palavras apresentadas pelo aplicativo, de forma clara e pausada, e solicite que o participante as repita. Caso necessário, repita o conjunto conforme a orientação padronizada do instrumento. Avise que deverá guardar as palavras, pois serão solicitadas novamente mais adiante.",
    icon: "download-outline",
  },
  {
    id: "5",
    title: "Atenção e cálculo",
    content:
      "Solicite ao participante que realize as subtrações sucessivas apresentadas. Forneça apenas a instrução inicial, sem auxiliar nos cálculos ou indicar se as respostas estão corretas.",
    icon: "calculator-outline",
  },
  {
    id: "6",
    title: "Evocação",
    content:
      "Peça ao participante que diga as três palavras apresentadas anteriormente. Não forneça pistas, opções ou lembretes.",
    icon: "sync-outline",
  },
  {
    id: "7",
    title: "Linguagem – Nomeação e repetição",
    content:
      "Apresente os objetos solicitados para nomeação e peça que o participante diga seus nomes. Em seguida, pronuncie claramente a frase apresentada pelo aplicativo e solicite que seja repetida.",
    icon: "chatbubble-outline",
  },
  {
    id: "8",
    title: "Comandos verbal e escrito",
    content:
      "Forneça o material necessário e apresente o comando verbal conforme indicado, permitindo que o participante execute as etapas. Para o comando escrito, apresente a frase e solicite que ele leia e faça o que está escrito.",
    icon: "list-outline",
  },
  {
    id: "9",
    title: "Escrita",
    content:
      "Entregue papel e material para escrita e solicite que o participante escreva espontaneamente uma frase completa. Não forneça exemplos nem dite uma frase.",
    icon: "pencil-outline",
  },
  {
    id: "10",
    title: "Cópia do desenho",
    content:
      "Apresente o modelo dos pentágonos e solicite que o participante faça uma cópia. Não oriente sobre como desenhá-lo nem corrija durante a execução.",
    icon: "copy-outline",
  },
  {
    id: "11",
    title: "Importante",
    content:
      "Durante toda a aplicação, mantenha postura acolhedora e neutra. Não ofereça pistas, complete respostas ou indique erros e acertos. Considere possíveis limitações auditivas, visuais, motoras ou de comunicação que possam interferir na execução das tarefas.",
    icon: "alert-circle-outline",
    isImportant: true,
  },
];

export default function InstrumentGuidePage() {
  const params = useLocalSearchParams<{ instrumentNome?: string }>();
  const testName = params.instrumentNome || "MEEM";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Guia de Aplicação</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>
            Tutorial de Aplicação do {testName}
          </Text>
          <Text style={styles.subtitle}>COGNISUS</Text>
        </View>

        <View style={styles.stepsContainer}>
          {meemSteps.map((step) => {
            const isWarning = step.isImportant;
            return (
              <View
                key={step.id}
                style={[styles.stepCard, isWarning && styles.stepCardWarning]}
              >
                <View
                  style={[
                    styles.iconContainer,
                    isWarning
                      ? styles.iconContainerWarning
                      : styles.iconContainerNormal,
                  ]}
                >
                  <Ionicons
                    name={step.icon}
                    size={22}
                    color={isWarning ? "#C2410C" : "#2563EB"}
                  />
                </View>
                <View style={styles.stepTextContent}>
                  <Text
                    style={[
                      styles.stepTitle,
                      isWarning && styles.stepTitleWarning,
                    ]}
                  >
                    {step.title}
                  </Text>
                  <Text style={styles.stepDescription}>{step.content}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#0F172A",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: "center",
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "600",
    letterSpacing: 1,
  },
  stepsContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  stepCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  stepCardWarning: {
    backgroundColor: "#FFF7ED",
    borderColor: "#FDBA74",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  iconContainerNormal: {
    backgroundColor: "#DBEAFE",
  },
  iconContainerWarning: {
    backgroundColor: "#FFEDD5",
  },
  stepTextContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 6,
  },
  stepTitleWarning: {
    color: "#9A3412",
  },
  stepDescription: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 22,
  },
});
