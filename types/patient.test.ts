import { calculateAge } from "./patient";

describe("calculateAge", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2025, 5, 15, 12));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it.each([
    ["2000-01-01T12:00:00", 25],
    ["2000-06-14T12:00:00", 25],
    ["2000-06-15T12:00:00", 25],
    ["2000-06-16T12:00:00", 24],
    ["2000-11-01T12:00:00", 24],
  ])("calcula a idade para nascimento em %s", (nascimento, idade) => {
    expect(calculateAge(nascimento)).toBe(idade);
  });
});
