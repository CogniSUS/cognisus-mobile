import {
  calcularIdade,
  capitalizarNome,
  formatarData,
  formatCpf,
} from "./formatters";

describe("formatCpf", () => {
  it.each([
    ["", ""],
    ["123", "123"],
    ["1234", "123.4"],
    ["123456", "123.456"],
    ["1234567", "123.456.7"],
    ["123456789", "123.456.789"],
    ["1234567890", "123.456.789-0"],
    ["123.456.789-01", "123.456.789-01"],
    ["123.456.789-012345", "123.456.789-01"],
    ["abc123.456xyz789-01", "123.456.789-01"],
  ])("formata %s como %s", (entrada, esperado) => {
    expect(formatCpf(entrada)).toBe(esperado);
  });
});

describe("formatarData", () => {
  it("retorna uma string vazia para uma data vazia", () => {
    expect(formatarData("")).toBe("");
  });

  it("formata uma data ISO simples", () => {
    expect(formatarData("2024-08-04")).toBe("04/08/2024");
  });

  it("ignora o horário de uma data ISO", () => {
    expect(formatarData("2024-08-04T15:30:00.000Z")).toBe("04/08/2024");
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
});

describe("capitalizarNome", () => {
  it("retorna uma string vazia quando o nome é vazio", () => {
    expect(capitalizarNome("")).toBe("");
  });

  it("capitaliza o nome e mantém preposições internas em minúsculas", () => {
    expect(capitalizarNome("JOÃO DA SILVA E SOUZA")).toBe(
      "João da Silva e Souza",
    );
  });

  it("capitaliza a primeira palavra mesmo quando ela é uma preposição", () => {
    expect(capitalizarNome("DA SILVA")).toBe("Da Silva");
  });
});
