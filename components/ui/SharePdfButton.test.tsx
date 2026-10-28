import { fireEvent, render } from "@testing-library/react-native";
import { TouchableOpacity } from "react-native";
import { SharePdfButton } from "./SharePdfButton";
import { useSharePdf } from "@/hooks/useSharePdf";
import type { AvaliacaoResult } from "@/database/repositories/AvaliacaoTestMeemRepository";

jest.mock("@expo/vector-icons", () => ({ Ionicons: () => null }));
jest.mock("@/hooks/useSharePdf", () => ({ useSharePdf: jest.fn() }));

describe("SharePdfButton", () => {
  const props = {
    avaliacao: {
      id: "av-1",
      data_inicio: "2025-02-01",
      score_total: 25,
      classificacao: "Normal",
      score_orientacao_espacial: 5,
      score_orientacao_temporal: 5,
      score_memoria_recente: 3,
      score_memoria_imediata: 3,
      score_atencao: 4,
      score_linguagem: 8,
      score_visuoespacial: 2,
      paciente_nome: "Maria",
      instrumento_nome: "MEEM",
      unidade_nome: "UBS Central",
      justificativa_alteracao: null,
    } satisfies AvaliacaoResult,
    unidadeNome: "UBS Central",
    profissionalNome: "Ana",
    dataAvaliacao: "2025-02-01",
  };

  it("encaminha os dados da avaliação ao iniciar o compartilhamento", () => {
    const shareAvaliacaoPdf = jest.fn();
    jest.mocked(useSharePdf).mockReturnValue({
      shareAvaliacaoPdf,
      isSharing: false,
    } as never);
    const { getByText } = render(<SharePdfButton {...props} />);

    fireEvent.press(getByText("Compartilhar PDF"));

    expect(shareAvaliacaoPdf).toHaveBeenCalledWith(props);
  });

  it("mostra o indicador e desabilita a ação durante o compartilhamento", () => {
    jest.mocked(useSharePdf).mockReturnValue({
      shareAvaliacaoPdf: jest.fn(),
      isSharing: true,
    } as never);
    const { queryByText, UNSAFE_getByType } = render(
      <SharePdfButton {...props} />,
    );

    expect(queryByText("Compartilhar PDF")).toBeNull();
    expect(UNSAFE_getByType(TouchableOpacity).props.disabled).toBe(true);
  });
});
