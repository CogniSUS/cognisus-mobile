import { gerarHtmlResultadoMeem } from "./pdfTemplates";

describe("gerarHtmlResultadoMeem", () => {
  it("gera o HTML com identificação, notas por domínio e classificação", () => {
    const html = gerarHtmlResultadoMeem({
      avaliacao: {
        id: "avaliacao-1",
        data_inicio: "2025-06-15T12:00:00.000Z",
        score_total: 27,
        classificacao: "Normal",
        score_orientacao_espacial: 5,
        score_orientacao_temporal: 5,
        score_memoria_recente: 3,
        score_memoria_imediata: 3,
        score_atencao: 4,
        score_linguagem: 6,
        score_visuoespacial: 1,
        paciente_nome: "Maria da Silva",
        instrumento_nome: "MEEM",
        unidade_nome: "Unidade Central",
        justificativa_alteracao: null,
      },
      unidadeNome: "Unidade Central",
      profissionalNome: "Dra. Ana Souza",
      dataAvaliacao: "15/06/2025",
    });

    expect(html).toContain("Resultado do Rastreio Cognitivo");
    expect(html).toContain("Maria da Silva");
    expect(html).toContain("MEEM");
    expect(html).toContain("Dra. Ana Souza");
    expect(html).toContain("15/06/2025");
    expect(html).toContain("Orientação Espacial:");
    expect(html).toContain("5 pt(s)");
    expect(html).toContain("27 / 30");
    expect(html).toContain("Normal");
  });
});
