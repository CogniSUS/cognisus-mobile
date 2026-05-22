/**
 * Modal de confirmação antes de iniciar um teste
 * - Overlay semi-transparente
 * - Conteúdo centralizado com sombra
 * - Exibe dados do paciente + instrumento selecionado
 * - Botões: "Cancelar" (outline) e "Confirmar e Iniciar" (solid)
 *
 * Props:
 * - visible: boolean - Controlar visibilidade
 * - patient: Patient - Dados do paciente
 * - instrument: Instrument - Instrumento selecionado
 * - onConfirm: () => void - Callback ao confirmar
 * - onCancel: () => void - Callback ao cancelar
 * - isLoading?: boolean - Estado de carregamento
 */
import { Instrument } from "@/types/instrument";
import { Patient } from "@/types/patient";
import { Ionicons } from "@expo/vector-icons";
import {
    ActivityIndicator,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
interface TestConfirmationModalProps {
  visible: boolean;
  patient: Patient;
  instrument: Instrument;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}
export function TestConfirmationModal({
  visible,
  patient,
  instrument,
  onConfirm,
  onCancel,
  isLoading = false,
}: TestConfirmationModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      {/* Overlay */}
      <Pressable style={styles.overlay} onPress={onCancel} />

      {/* Modal Content */}
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Header com ícone */}
          <View style={styles.header}>
            <Ionicons
              name="checkmark-circle-outline"
              size={28}
              color="#A855F7"
            />
          </View>

          {/* Título */}
          <Text style={styles.title}>Confirmar Teste</Text>

          {/* Descrição */}
          <Text style={styles.description}>
            Você está prestes a iniciar um teste de avaliação cognitiva.
          </Text>

          {/* Info do Paciente */}
          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Paciente</Text>
            <Text style={styles.infoValue}>{patient.nome_completo}</Text>
          </View>

          {/* Info do Instrumento */}
          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Teste</Text>
            <Text style={styles.infoValue}>{instrument.nome}</Text>
            {instrument.abreviacao && (
              <Text style={styles.infoSubValue}>{instrument.abreviacao}</Text>
            )}
          </View>

          {/* Botões */}
          <View style={styles.buttons}>
            <Pressable
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </Pressable>

            <Pressable
              style={[styles.button, styles.confirmButton]}
              onPress={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.confirmButtonText}>
                  Confirmar e Iniciar
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
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  content: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 380,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  infoSection: {
    backgroundColor: "#F8F6FC",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#A855F7",
    textTransform: "uppercase",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },
  infoSubValue: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },
  buttons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    borderWidth: 2,
    borderColor: "#A855F7",
    backgroundColor: "#FFFFFF",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#A855F7",
  },
  confirmButton: {
    backgroundColor: "#A855F7",
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
