import {
  CLASSIFICACAO_DEFICIT,
  CLASSIFICACAO_NORMAL,
  calcularNotaDeCorteMeem,
  obterClassificacaoMeem,
} from "./meemHelpers";

describe("calcularNotaDeCorteMeem", () => {
  it.each([
    ["Analfabeto", 20],
    ["Escolaridade de 1 a 4 anos", 25],
    ["Escolaridade de 5 a 8 anos", 26.5],
    ["Escolaridade de 9 a 11 anos", 28],
    ["Escolaridade com mais de 11 anos", 29],
  ])("retorna %s para a nota de corte %s", (escolaridade, notaDeCorte) => {
    expect(calcularNotaDeCorteMeem(escolaridade)).toBe(notaDeCorte);
  });

  it("normaliza maiúsculas e espaços antes de identificar a escolaridade", () => {
    expect(calcularNotaDeCorteMeem("  ANALFABETO  ")).toBe(20);
  });

  it("usa 20 como fallback para uma escolaridade não mapeada", () => {
    expect(calcularNotaDeCorteMeem("Ensino superior completo")).toBe(20);
  });
});

describe("obterClassificacaoMeem", () => {
  it("classifica como possível déficit abaixo da nota de corte", () => {
    expect(obterClassificacaoMeem(26, "Escolaridade de 5 a 8 anos")).toBe(
      CLASSIFICACAO_DEFICIT,
    );
  });

  it("classifica como normal exatamente na nota de corte", () => {
    expect(obterClassificacaoMeem(26.5, "Escolaridade de 5 a 8 anos")).toBe(
      CLASSIFICACAO_NORMAL,
    );
  });

  it("classifica como normal acima da nota de corte", () => {
    expect(obterClassificacaoMeem(27, "Escolaridade de 5 a 8 anos")).toBe(
      CLASSIFICACAO_NORMAL,
    );
  });
});
