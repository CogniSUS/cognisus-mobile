export function formatCpf(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9)
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export function formatarData(data: string) {
  if (!data) return "";

  // O split("T")[0] garante que pegaremos apenas a parte "YYYY-MM-DD", descartando o horário
  const apenasData = data.split("T")[0];
  const [ano, mes, dia] = apenasData.split("-");

  return `${dia}/${mes}/${ano}`;
}

export function calcularIdade(data: string) {
  const [ano, mes, dia] = data.split("-").map(Number);

  const hoje = new Date();
  let idade = hoje.getFullYear() - ano;

  const fezAniversario =
    hoje.getMonth() + 1 > mes ||
    (hoje.getMonth() + 1 === mes && hoje.getDate() >= dia);

  if (!fezAniversario) {
    idade--;
  }

  return idade;
}

export function capitalizarNome(nome: string): string {
  if (!nome) return "";

  const preposicoes = ["de", "da", "do", "das", "dos", "e", "em", "na", "no"];

  return nome
    .toLowerCase()
    .split(" ")
    .map((palavra, index) => {
      // Se for preposição e não for a primeira palavra, mantém minúsculo
      if (index !== 0 && preposicoes.includes(palavra)) {
        return palavra;
      }
      // Capitaliza a primeira letra da palavra
      return palavra.charAt(0).toUpperCase() + palavra.slice(1);
    })
    .join(" ");
}
