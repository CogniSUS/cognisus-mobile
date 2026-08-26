export function formatCpf(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9)
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export function formatarData(data: string) {
  const [ano, mes, dia] = data.split("-");
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