export type ResultFilter = "all" | "meem" | "moca" | "fluencia";

export type CognitiveResult = {
  id: number;
  patientId: number;
  instrumentId: number;

  testName: string;
  testAbbreviation: string;

  date: string;
  score: number;
  maxScore: number;

  classification: string;

  status: "normal" | "alterado";
};