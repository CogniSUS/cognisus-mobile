export interface Patient {
  id: string;
  nome_completo: string;
  cpf: string;
  data_nascimento: string; //  YYYY-MM-DD
  sexo: "masculino" | "feminino" | "outro";
  escolaridade?: string;
}

export function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}
