import { appSchema, tableSchema } from "@nozbe/watermelondb";

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: "escolaridade",
      columns: [
        { name: "tipo", type: "string" },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
        { name: "deleted_at", type: "number", isOptional: true },
      ],
    }),
    tableSchema({
      name: "dcnt",
      columns: [
        { name: "tipo", type: "string" },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
        { name: "deleted_at", type: "number", isOptional: true },
      ],
    }),
    tableSchema({
      name: "unidade_saude",
      columns: [
        { name: "nome", type: "string" },
        { name: "endereco", type: "string" },
        { name: "cnes", type: "string" },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
        { name: "deleted_at", type: "number", isOptional: true },
      ],
    }),
    tableSchema({
      name: "instrumento_avaliacao",
      columns: [
        { name: "nome", type: "string" },
        { name: "status", type: "boolean" },
        { name: "versao", type: "string", isOptional: true },
        { name: "abreviacao", type: "string", isOptional: true },
        { name: "tempo_estimado_min", type: "number", isOptional: true },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
        { name: "deleted_at", type: "number", isOptional: true },
      ],
    }),
    tableSchema({
      name: "paciente",
      columns: [
        { name: "nome_completo", type: "string" },
        { name: "cpf", type: "string", isIndexed: true },
        { name: "data_nascimento", type: "string" },
        { name: "sexo", type: "string" },
        {
          name: "escolaridade",
          type: "string",
          isIndexed: true,
          isOptional: true,
        },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
        { name: "deleted_at", type: "number", isOptional: true },
      ],
    }),
    tableSchema({
      name: "profissional",
      columns: [
        { name: "user_id", type: "string", isIndexed: true },
        { name: "nome_completo", type: "string" },
        { name: "cpf", type: "string", isIndexed: true },
        { name: "email", type: "string", isIndexed: true },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
        { name: "deleted_at", type: "number", isOptional: true },
      ],
    }),
    tableSchema({
      name: "paciente_dcnt",
      columns: [
        { name: "id_paciente", type: "string", isIndexed: true },
        { name: "id_dcnt", type: "string", isIndexed: true },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
        { name: "deleted_at", type: "number", isOptional: true },
      ],
    }),
    tableSchema({
      name: "avaliacao_teste_meem",
      columns: [
        { name: "id_paciente", type: "string", isIndexed: true },
        { name: "id_profissional", type: "string", isIndexed: true },
        { name: "id_instrumento", type: "string", isIndexed: true },
        { name: "unidade_saude", type: "string", isIndexed: true },
        { name: "data_inicio", type: "string" },
        { name: "data_fim", type: "string", isOptional: true },
        { name: "score_orientacao_espacial", type: "number" },
        { name: "score_atencao", type: "number" },
        { name: "score_linguagem", type: "number" },
        { name: "score_visuoespacial", type: "number" },
        { name: "score_memoria_recente", type: "number" },
        { name: "score_memoria_imediata", type: "number" },
        { name: "score_total", type: "number" },
        { name: "classificacao", type: "string" },
        { name: "score_orientacao_temporal", type: "number" },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
        { name: "deleted_at", type: "number", isOptional: true },
      ],
    }),
  ],
});
