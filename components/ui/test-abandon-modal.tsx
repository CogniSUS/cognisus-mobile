import { Ionicons } from "@expo/vector-icons";
import {
    ActivityIndicator,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

interface TestAbandonModalProps {
  visible: boolean;
  patientName: string;
  instrumentName: string;
  currentStep: number;
  totalSteps: number;
  onConfirmAbandon: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function TestAbandonModal({
  visible,
  patientName,
  instrumentName,
  currentStep,
  totalSteps,
  onConfirmAbandon,
  onCancel,
  isLoading = false,
}: TestAbandonModalProps) {
  const progressPercentage = Math.round((currentStep / totalSteps) * 100);

  return (
    <Modal visible={visible} transparent animationType="fade">
      {/* Overlay */}
      <Pressable
        style={styles.overlay}
        onPress={onCancel}
        disabled={isLoading}
      />

      <View style={styles.container}>
        <View style={styles.content}>
          {/* Header - Mais focado na ação */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="warning" size={32} color="#DC2626" />
            </View>
            <Text style={styles.title}>Interromper avaliação?</Text>
          </View>

          <Text style={styles.description}>
            Todo o progresso não salvo será perdido. Deseja realmente abandonar
            o teste agora?
          </Text>

          {/* Área de Contexto - Cores neutralizadas para reduzir carga cognitiva */}
          <View style={styles.contextBox}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Paciente</Text>
              <Text style={styles.infoValue} numberOfLines={1}>
                {patientName}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Progresso</Text>
              <Text style={styles.infoValue}>
                {currentStep} de {totalSteps} etapas
              </Text>
            </View>

            {/* Barra de progresso com a cor primária da marca (Roxo) e não amarela */}
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${progressPercentage}%` },
                ]}
              />
            </View>
          </View>

          {/* Botões - Empilhados (Lei de Fitts) e Inversão de Peso Visual */}
          <View style={styles.actionsContainer}>
            {/* Ação Segura (Caminho Feliz) - Sólida e Destacada */}
            <Pressable
              style={[styles.buttonSafe, isLoading && styles.buttonDisabled]}
              onPress={onCancel}
              disabled={isLoading}
            >
              <Text style={styles.buttonSafeText}>Continuar Avaliação</Text>
            </Pressable>

            {/* Ação Destrutiva - Secundária (Texto/Ghost) para evitar clique acidental */}
            <Pressable
              style={[
                styles.buttonDestructive,
                isLoading && styles.buttonDisabled,
              ]}
              onPress={onConfirmAbandon}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#DC2626" />
              ) : (
                <Text style={styles.buttonDestructiveText}>
                  Sair e Perder Dados
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)", // Levemente mais escuro para maior foco
  },
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    pointerEvents: "box-none",
  },
  content: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20, // Bordas um pouco mais suaves
    padding: 24,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
  },
  header: {
    alignItems: "center",
    marginBottom: 16,
  },
  iconContainer: {
    backgroundColor: "#FEE2E2",
    padding: 12,
    borderRadius: 50,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
  description: {
    fontSize: 15,
    color: "#4B5563",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  // ContextBox neutralizado
  contextBox: {
    backgroundColor: "#F3F4F6", // Cinza bem claro em vez de amarelo
    borderRadius: 12,
    padding: 16,
    marginBottom: 28,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    flexShrink: 1,
    marginLeft: 8,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    marginTop: 8,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#A824EE",
    borderRadius: 3,
  },
  actionsContainer: {
    flexDirection: "column",
    gap: 12,
  },
  buttonSafe: {
    backgroundColor: "#A824EE",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonSafeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  buttonDestructive: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  buttonDestructiveText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#DC2626",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
