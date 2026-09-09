export type ResultFilter = "all" | "meem" | "moca" | "fluencia";

export type CognitiveResult = {
  id: string;
  patientId: string;
  instrumentId: string;

  testName: string;
  testAbbreviation: string;

  date: string;
  score: number;
  maxScore: number;

  classification: string;

  status: "normal" | "alterado";
};
