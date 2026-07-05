export type MeemQuestion = {
  id: string; // ID único para salvar no estado (ex: 'temporal_dia_semana')
  label: string; // O texto da pergunta (ex: 'Em que dia da semana estamos?')
  points: number; // Quantos pontos vale acertar essa questão (no MEEM padrão é 1)
  dominio:
    | "orientacao_temporal"
    | "orientacao_espacial"
    | "memoria_imediata"
    | "atencao"
    | "memoria_recente"
    | "linguagem"
    | "visuoespacial";
};

export type TestStep = {
  id: string;
  title: string; // Título principal (ex: 'Orientação Temporal')
  instruction?: string; // O texto da caixa de destaque (azul/roxa)
  isIntro?: boolean; // Define se é apenas uma tela de leitura (Passo 1)
  hasTimer?: boolean; // Habilita o componente de cronômetro
  amountOfTime?: number; // Define o tempo do cronômetro (em segundos)
  questions?: MeemQuestion[]; // Lista de perguntas daquela etapa
};
