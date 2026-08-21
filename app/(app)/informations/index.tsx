import { AboutCard } from "@/components/features/informations/about-card";
import { EducationalCard } from "@/components/features/informations/educational-card";
import { InformationActionCard } from "@/components/features/informations/information-action-card";
import { LogoutButton } from "@/components/features/informations/logout-button";
import { SupportCard } from "@/components/features/informations/support-card";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const healthyHabits = [
  "Pratique exercícios físicos regularmente (30 min/dia)",
  "Mantenha uma alimentação equilibrada rica em frutas e vegetais",
  "Durma de 7-8 horas por noite",
  "Mantenha-se socialmente ativo",
  "Estimule o cérebro com leitura, jogos e aprendizado",
  "Evite álcool em excesso e não fume",
];

const dcntItems = [
  "Hipertensão: Monitore pressão regularmente, reduza sal, tome medicação conforme prescrito",
  "Diabetes: Monitore glicemia, siga dieta adequada, pratique exercícios",
  "Colesterol: Reduza gorduras saturadas, aumente fibras na dieta",
  "Importância: DCNT mal controladas aumentam risco de demência",
];

const cognitiveAlerts = [
  "Esquecer compromissos ou conversas recentes",
  "Dificuldade para encontrar palavras",
  "Desorientação em lugares conhecidos",
  "Dificuldade para realizar tarefas habituais",
  "Mudanças de humor ou personalidade",
];

export default function InformationsPage() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.pageTitle}>
        Informações
      </Text>

      <AboutCard />

      <Text style={styles.sectionTitle}>
        Conteúdos Educativos
      </Text>

      <EducationalCard
        icon="pulse-outline"
        title="Hábitos Saudáveis para o Cérebro"
        items={healthyHabits}
        backgroundColor="#ECFDF5"
        borderColor="#86EFAC"
        iconBackgroundColor="#10B981"
        textColor="#15803D"
        marker="check"
      />

      <EducationalCard
        icon="heart-outline"
        title="Controle de DCNT"
        items={dcntItems}
        backgroundColor="#EFF6FF"
        borderColor="#93C5FD"
        iconBackgroundColor="#3B82F6"
        textColor="#1D4ED8"
        marker="bullet"
        boldPrefixes={[
          "Hipertensão:",
          "Diabetes:",
          "Colesterol:",
          "Importância:",
        ]}
      />

      <EducationalCard
        icon="warning-outline"
        title="Sinais de Alerta Cognitiva"
        items={cognitiveAlerts}
        backgroundColor="#FFF7ED"
        borderColor="#FDBA74"
        iconBackgroundColor="#F97316"
        textColor="#C2410C"
        marker="warning"
      />

      <View style={styles.actions}>
        <InformationActionCard
          icon="book-outline"
          title="Guia de Testes"
          subtitle="Instruções para aplicação dos testes"
          iconColor="#2563EB"
          iconBackground="#DBEAFE"
          // onPress={() => router.push("/")}  # Implementar quando tiver rota de guia de testes
        />

        <InformationActionCard
          icon="help-circle-outline"
          title="Perguntas Frequentes"
          subtitle="Tire suas dúvidas sobre o app"
          iconColor="#16A34A"
          iconBackground="#DCFCE7"
          // onPress={() => router.push("/")}  # Implementar quando tiver rota de FAQ
        />

        <InformationActionCard
          icon="settings-outline"
          title="Configurações"
          subtitle="Ajuste preferências do aplicativo"
          iconColor="#F97316"
          iconBackground="#FFEDD5"
          // onPress={() => router.push("/")}  # Implementar quando tiver rota de configurações
        />
      </View>

      <SupportCard />

      <LogoutButton />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },

  content: {
    padding: 16,
    paddingBottom: 28,
  },

  pageTitle: {
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 18,
  },

  sectionTitle: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 22,
    marginBottom: 12,
  },

  actions: {
    gap: 10,
    marginTop: 4,
  },
});
