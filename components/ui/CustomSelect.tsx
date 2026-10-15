import { Feather, Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";

export interface SelectOption {
  label: string;
  value: string | number;
}

interface CustomSelectProps {
  label?: string;
  placeholder: string;
  value: string | number | null | undefined;
  options: SelectOption[];
  onValueChange: (value: any) => void;
  icon?: React.ReactNode;
  modalTitle?: string;
}

export function CustomSelect({
  placeholder,
  value,
  options,
  onValueChange,
  icon,
  modalTitle,
}: CustomSelectProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (val: string | number) => {
    onValueChange(val);
    setModalVisible(false);
  };

  return (
    <>
      {/* Botão Gatilho (Imita a caixa de input padrão) */}
      <TouchableOpacity
        style={styles.boxInput}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        {icon && <View style={styles.iconContainer}>{icon}</View>}

        <Text
          style={[styles.fieldText, !selectedOption && styles.placeholderText]}
          numberOfLines={1}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>

        <Feather name="chevron-down" size={20} color="#732cad" />
      </TouchableOpacity>

      {/* Modal Customizado Isolado do Tema do SO */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContainer}>
                {/* Cabeçalho do Modal */}
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {modalTitle || placeholder}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Feather name="x" size={22} color="#64748B" />
                  </TouchableOpacity>
                </View>

                {/* Lista de Opções */}
                <FlatList
                  data={options}
                  keyExtractor={(item) => String(item.value)}
                  showsVerticalScrollIndicator={false}
                  ItemSeparatorComponent={() => (
                    <View style={styles.separator} />
                  )}
                  renderItem={({ item }) => {
                    const isSelected = item.value === value;
                    return (
                      <TouchableOpacity
                        style={[
                          styles.optionItem,
                          isSelected && styles.optionItemSelected,
                        ]}
                        onPress={() => handleSelect(item.value)}
                        activeOpacity={0.6}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            isSelected && styles.optionTextSelected,
                          ]}
                        >
                          {item.label}
                        </Text>
                        {isSelected && (
                          <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color="#732cad"
                          />
                        )}
                      </TouchableOpacity>
                    );
                  }}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  boxInput: {
    height: 56,
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  iconContainer: {
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  fieldText: {
    flex: 1,
    fontSize: 16,
    color: "#0F172A",
  },
  placeholderText: {
    color: "#9CA3AF",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)", // Overlay escuro estável
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalContainer: {
    width: "100%",
    maxHeight: "75%",
    backgroundColor: "#FFFFFF", // Fundo estritamente branco
    borderRadius: 16,
    padding: 20,
    elevation: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A", // Cor do texto fixa
  },
  separator: {
    height: 1,
    backgroundColor: "#F1F5F9",
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  optionItemSelected: {
    backgroundColor: "#F8FAFC",
  },
  optionText: {
    fontSize: 15,
    color: "#334155",
  },
  optionTextSelected: {
    color: "#732cad",
    fontWeight: "600",
  },
});
