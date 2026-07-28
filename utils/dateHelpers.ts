export function formatarDataBR(dataISO: string | null) {
  if (!dataISO) return "Nenhuma avaliação registrada";

  if (/^\d{4}-\d{2}-\d{2}$/.test(dataISO)) {
    const [ano, mes, dia] = dataISO.split("-");
    return `${dia}/${mes}/${ano}`;
  }

  const data = new Date(dataISO);
  if (Number.isNaN(data.getTime())) return "Nenhuma avaliação registrada";

  return data.toLocaleDateString("pt-BR");
}

export function calcularIdade(dataISO: string) {
  let ano = 0;
  let mes = 0;
  let dia = 0;

  if (/^\d{4}-\d{2}-\d{2}$/.test(dataISO)) {
    const partes = dataISO.split("-");
    ano = Number(partes[0]);
    mes = Number(partes[1]) - 1;
    dia = Number(partes[2]);
  } else {
    const nascimento = new Date(dataISO);
    ano = nascimento.getFullYear();
    mes = nascimento.getMonth();
    dia = nascimento.getDate();
  }

  const hoje = new Date();
  let idade = hoje.getFullYear() - ano;

  if (
    hoje.getMonth() < mes ||
    (hoje.getMonth() === mes && hoje.getDate() < dia)
  ) {
    idade--;
  }

  return idade;
}
