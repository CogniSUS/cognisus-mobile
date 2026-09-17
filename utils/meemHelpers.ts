export const CLASSIFICACAO_NORMAL = "Normal";
export const CLASSIFICACAO_DEFICIT = "Possível Déficit Cognitivo";

/**
 * Calcula a nota de corte do MEEM com base na string de escolaridade (Brucki et al., 2003)
 */
export function calcularNotaDeCorteMeem(escolaridadeNome: string): number {
  const esc = escolaridadeNome.toLowerCase().trim();

  if (esc.includes("analfabeto")) return 20;
  if (esc.includes("1 a 4")) return 25;
  if (esc.includes("5 a 8")) return 26.5;
  if (esc.includes("9 a 11")) return 28;
  if (esc.includes("mais de 11")) return 29;

  return 20; // Fallback de segurança para valores não mapeados
}

export function obterClassificacaoMeem(
  scoreTotal: number,
  escolaridadeNome: string,
): string {
  const notaCorte = calcularNotaDeCorteMeem(escolaridadeNome);
  return scoreTotal >= notaCorte ? CLASSIFICACAO_NORMAL : CLASSIFICACAO_DEFICIT;
}
