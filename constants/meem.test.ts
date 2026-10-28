import { meemSteps } from "./meem";

describe("configuração do MEEM", () => {
  it("configura 30 pontos no caminho principal", () => {
    const perguntas = meemSteps.flatMap((etapa) => etapa.questions ?? []);

    expect(perguntas.reduce((total, pergunta) => total + pergunta.points, 0)).toBe(
      30,
    );
  });

  it("mantém a via alternativa de atenção com a mesma pontuação", () => {
    const atencao = meemSteps.find((etapa) => etapa.id === "atencao_calculo");

    expect(atencao?.questions?.reduce((total, pergunta) => total + pergunta.points, 0)).toBe(5);
    expect(
      atencao?.alternativeQuestions?.reduce(
        (total, pergunta) => total + pergunta.points,
        0,
      ),
    ).toBe(5);
  });

  it("mantém IDs únicos entre perguntas principais e alternativas", () => {
    const perguntas = meemSteps.flatMap((etapa) => [
      ...(etapa.questions ?? []),
      ...(etapa.alternativeQuestions ?? []),
    ]);
    const ids = perguntas.map((pergunta) => pergunta.id);

    expect(new Set(ids).size).toBe(ids.length);
  });
});
