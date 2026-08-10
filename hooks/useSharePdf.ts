import { AvaliacaoResult } from "@/database/repositories/AvaliacaoTestMeemRepository";
import { useToast } from "@/hooks/useToast";
import { gerarHtmlResultadoMeem } from "@/utils/pdfTemplates";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useState } from "react";

type SharePdfParams = {
  avaliacao: AvaliacaoResult;
  unidadeNome: string;
  profissionalNome: string;
  dataAvaliacao: string;
};

export function useSharePdf() {
  const [isSharing, setIsSharing] = useState(false);
  const { error } = useToast();

  async function shareAvaliacaoPdf(dados: SharePdfParams) {
    try {
      setIsSharing(true);

      // 1. Gera o HTML com os dados injetados
      const html = gerarHtmlResultadoMeem(dados);

      // 2. Converte o HTML em um arquivo PDF temporário
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });

      // 3. Verifica se o compartilhamento nativo está disponível no dispositivo
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        error("Compartilhamento nativo não disponível neste dispositivo.");
        return;
      }

      // 4. Abre a gaveta nativa do iOS/Android para compartilhar o PDF
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: "Compartilhar Resultado do Rastreio",
        UTI: "com.adobe.pdf", // Opcional, ajuda no iOS
      });
    } catch (err) {
      console.error("Erro ao gerar/compartilhar PDF:", err);
      error("Não foi possível gerar o PDF para compartilhamento.");
    } finally {
      setIsSharing(false);
    }
  }

  return { shareAvaliacaoPdf, isSharing };
}
