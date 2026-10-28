import { schema } from "./schema";

describe("schema local WatermelonDB", () => {
  it("declara as tabelas e campos necessários para os dados do aplicativo", () => {
    expect(schema.version).toBe(1);
    expect(Object.keys(schema.tables)).toEqual([
      "escolaridade",
      "dcnt",
      "unidade_saude",
      "instrumento_avaliacao",
      "paciente",
      "profissional",
      "paciente_dcnt",
      "avaliacao_teste_meem",
    ]);

    const patientTable = schema.tables.paciente;
    expect(patientTable.columns.cpf).toMatchObject({
      name: "cpf",
      isIndexed: true,
    });
    expect(patientTable.columns.escolaridade).toMatchObject({
      name: "escolaridade",
      isIndexed: true,
      isOptional: true,
    });
  });
});
