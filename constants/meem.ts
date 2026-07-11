import { TestStep } from "@/types/meem";

export const meemSteps: TestStep[] = [
  // --- ETAPA 1/12 ---
  {
    id: "postura_profissional",
    title: "Postura Profissional",
    isIntro: true,
    instruction:
      'Antes de iniciar, lembre-se de deixar o paciente à vontade. Use um tom amigável e acolhedor.\n\n💡 Pergunta quebra-gelo sugerida: "Posso testar sua memória?"',
  },

  // --- ETAPA 2/12 ---
  {
    id: "orientacao_temporal",
    title: "Orientação Temporal",
    questions: [
      {
        id: "ot_dia_semana",
        label: "Em que dia da semana estamos?",
        points: 1,
        dominio: "orientacao_temporal",
      },
      {
        id: "ot_dia_mes",
        label: "Em que dia do mês estamos?",
        points: 1,
        dominio: "orientacao_temporal",
      },
      {
        id: "ot_mes",
        label: "Em que mês estamos?",
        points: 1,
        dominio: "orientacao_temporal",
      },
      {
        id: "ot_ano",
        label: "Em que ano estamos?",
        points: 1,
        dominio: "orientacao_temporal",
      },
      {
        id: "ot_horario",
        label: "Em que horário do dia estamos?",
        points: 1,
        dominio: "orientacao_temporal",
      },
    ],
  },

  // --- ETAPA 3/12 ---
  {
    id: "orientacao_espacial",
    title: "Orientação Espacial",
    questions: [
      {
        id: "oe_pais",
        label: "Em que país estamos?",
        points: 1,
        dominio: "orientacao_espacial",
      },
      {
        id: "oe_estado",
        label: "Em que estado estamos?",
        points: 1,
        dominio: "orientacao_espacial",
      },
      {
        id: "oe_cidade",
        label: "Em que cidade estamos?",
        points: 1,
        dominio: "orientacao_espacial",
      },
      {
        id: "oe_bairro",
        label: "Em que bairro estamos?",
        points: 1,
        dominio: "orientacao_espacial",
      },
      {
        id: "oe_local",
        label: "Em que local estamos (hospital, casa, clínica)?",
        points: 1,
        dominio: "orientacao_espacial",
      },
    ],
  },

  // --- ETAPA 4/12 ---
  {
    id: "registro_memoria",
    title: "Registro (Memória Imediata)",
    instruction:
      'Diga ao paciente: "Vou dizer três palavras e quero que repita depois de mim: CARRO, VASO, TIJOLO"',
    questions: [
      {
        id: "reg_carro",
        label: "Repetiu CARRO?",
        points: 1,
        dominio: "memoria_imediata",
      },
      {
        id: "reg_vaso",
        label: "Repetiu VASO?",
        points: 1,
        dominio: "memoria_imediata",
      },
      {
        id: "reg_tijolo",
        label: "Repetiu TIJOLO?",
        points: 1,
        dominio: "memoria_imediata",
      },
    ],
  },

  // --- ETAPA 5/12 ---
  {
    id: "atencao_calculo",
    title: "Atenção e Cálculo",
    instruction:
      'Peça ao paciente: "Subtraia 7 de 100 e continue subtraindo 7 do resultado até eu mandar parar"',
    questions: [
      { id: "calc_93", label: "93 (100-7)", points: 1, dominio: "atencao" },
      { id: "calc_86", label: "86 (93-7)", points: 1, dominio: "atencao" },
      { id: "calc_79", label: "79 (86-7)", points: 1, dominio: "atencao" },
      { id: "calc_72", label: "72 (79-7)", points: 1, dominio: "atencao" },
      { id: "calc_65", label: "65 (72-7)", points: 1, dominio: "atencao" },
    ],
  },

  // --- ETAPA 6/12 ---
  {
    id: "evocacao",
    title: "Evocação (Memória Recente)",
    instruction:
      'Pergunte: "Quais foram as três palavras que pedi para repetir?"',
    questions: [
      {
        id: "evo_carro",
        label: "Lembrou CARRO?",
        points: 1,
        dominio: "memoria_recente",
      },
      {
        id: "evo_vaso",
        label: "Lembrou VASO?",
        points: 1,
        dominio: "memoria_recente",
      },
      {
        id: "evo_tijolo",
        label: "Lembrou TIJOLO?",
        points: 1,
        dominio: "memoria_recente",
      },
    ],
  },

  // --- ETAPA 7/12 ---
  {
    id: "nomeacao",
    title: "Nomeação",
    instruction: 'Mostre objetos e pergunte: "O que é isto?"',
    hasTimer: true,
    amountOfTime: 30,
    questions: [
      {
        id: "nom_relogio",
        label: "Nomeou o relógio?",
        points: 1,
        dominio: "linguagem",
      },
      {
        id: "nom_caneta",
        label: "Nomeou a caneta?",
        points: 1,
        dominio: "linguagem",
      },
    ],
  },

  // --- ETAPA 8/12 ---
  {
    id: "repeticao",
    title: "Repetição",
    instruction: 'Peça: "Repita a frase: NEM AQUI, NEM ALI, NEM LÁ"',
    questions: [
      {
        id: "rep_frase",
        label: "Repetiu corretamente?",
        points: 1,
        dominio: "linguagem",
      },
    ],
  },

  // --- ETAPA 9/12 ---
  {
    id: "comando",
    title: "Comando",
    instruction:
      'Diga: "Pegue este papel com a mão direita, dobre ao meio e coloque no chão"',
    questions: [
      {
        id: "com_direita",
        label: "Pegou com a mão direita?",
        points: 1,
        dominio: "linguagem",
      },
      {
        id: "com_dobrou",
        label: "Dobrou ao meio?",
        points: 1,
        dominio: "linguagem",
      },
      {
        id: "com_chao",
        label: "Colocou no chão?",
        points: 1,
        dominio: "linguagem",
      },
    ],
  },

  // --- ETAPA 10/12 ---
  {
    id: "leitura",
    title: "Leitura",
    instruction:
      'Mostre a frase "FECHE OS OLHOS" e diga: "Leia e faça o que está escrito"',
    hasTimer: true,
    amountOfTime: 30,
    questions: [
      {
        id: "lei_olhos",
        label: "Fechou os olhos?",
        points: 1,
        dominio: "linguagem",
      },
    ],
  },

  // --- ETAPA 11/12 (Padrão MEEM) ---
  {
    id: "escrita",
    title: "Escrita",
    instruction:
      'Entregue um papel e caneta e peça: "Escreva uma frase completa e com sentido"',
    hasTimer: true,
    amountOfTime: 30,
    questions: [
      {
        id: "esc_frase",
        label: "Escreveu frase com sujeito e verbo?",
        points: 1,
        dominio: "linguagem",
      },
    ],
  },

  // --- ETAPA 12/12 (Padrão MEEM) ---
  {
    id: "desenho",
    title: "Desenho (Praxia Construtiva)",
    instruction:
      'Mostre o desenho dos pentágonos cruzados e peça: "Copie este desenho no papel"',
    questions: [
      {
        id: "des_pentagonos",
        label: "Copiou os pentágonos corretamente (10 ângulos e interseção)?",
        points: 1,
        dominio: "visuoespacial",
      },
    ],
  },
];
