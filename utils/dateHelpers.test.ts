import { calcularIdade, formatarDataBR } from "./dateHelpers";

describe("formatarDataBR", () => {
  it.each([null, ""])('usa o texto padrão quando a data é "%s"', (data) => {
    expect(formatarDataBR(data)).toBe("Nenhuma avaliação registrada");
  });

  it("formata uma data sem horário sem depender de fuso horário", () => {
    expect(formatarDataBR("2024-08-04")).toBe("04/08/2024");
  });

  it("formata uma data com horário usando o locale brasileiro", () => {
    const data = "2024-08-04T12:00:00";

    expect(formatarDataBR(data)).toBe(
      new Date(data).toLocaleDateString("pt-BR"),
    );
  });

  it("usa o texto padrão quando a data não pode ser interpretada", () => {
    expect(formatarDataBR("data inválida")).toBe(
      "Nenhuma avaliação registrada",
    );
  });
});

describe("calcularIdade", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2025, 5, 15, 12));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it.each([
    ["2000-06-14", 25],
    ["2000-06-15", 25],
    ["2000-06-16", 24],
    ["2000-07-01", 24],
  ])("calcula a idade para nascimento em %s", (nascimento, idade) => {
    expect(calcularIdade(nascimento)).toBe(idade);
  });

  it("aceita uma data ISO com horário", () => {
    expect(calcularIdade("2000-06-16T12:00:00")).toBe(24);
  });
});
