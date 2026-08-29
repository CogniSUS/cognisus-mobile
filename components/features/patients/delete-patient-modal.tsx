import { Feather } from "@expo/vector-icons";
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface ModalExcluirPacienteProps {
  visible: boolean;
  nomePaciente: string;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export default function ModalExcluirPaciente({
  visible,
  nomePaciente,
  onConfirmar,
  onCancelar,
}: ModalExcluirPacienteProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancelar}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>

          <View style={styles.iconContainer}>
            <Feather
              name="alert-triangle"
              size={30}
              color="#FF3038"
            />
          </View>

          <Text style={styles.title}>
            Excluir paciente?
          </Text>

          <Text style={styles.description}>
            Você está prestes a excluir {nomePaciente}.
            Todas as informações e histórico de avaliações
            serão perdidos permanentemente.
          </Text>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={onConfirmar}
          >
            <Text style={styles.deleteButtonText}>
              Sim, excluir paciente
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancelar}
          >
            <Text style={styles.cancelButtonText}>
              Cancelar
            </Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  container: {
    width: "85%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },

  iconContainer: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#FFE0E0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },

  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },

  description: {
    textAlign: "center",
    color: "#64748B",
    lineHeight: 20,
    marginBottom: 20,
  },

  deleteButton: {
    width: "100%",
    height: 46,
    backgroundColor: "#FF3038",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  deleteButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },

  cancelButton: {
    width: "100%",
    height: 46,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  cancelButtonText: {
    color: "#334155",
    fontWeight: "500",
  },
});