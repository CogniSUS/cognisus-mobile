import { AvaliacaoResult } from "@/database/repositories/AvaliacaoTestMeemRepository";
import { useSharePdf } from "@/hooks/useSharePdf";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
} from "react-native";

type Props = {
  avaliacao: AvaliacaoResult;
  unidadeNome: string;
  profissionalNome: string;
  dataAvaliacao: string;
};

export function SharePdfButton(props: Readonly<Props>) {
  const { shareAvaliacaoPdf, isSharing } = useSharePdf();

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={() => shareAvaliacaoPdf(props)}
      disabled={isSharing}
    >
      {isSharing ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <>
          <Ionicons name="share-outline" size={20} color="#fff" />
          <Text style={styles.text}>Compartilhar PDF</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#732cad",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  text: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
