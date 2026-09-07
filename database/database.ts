import { Database } from "@nozbe/watermelondb";
import SQLiteAdapter from "@nozbe/watermelondb/adapters/sqlite";
import { schema } from "./schema";

// Importe todos os Models que você criar
import { AvaliacaoTesteMeem } from "./models/AvaliacaoTesteMeem";
import { Dcnt } from "./models/Dcnt";
import { Escolaridade } from "./models/Escolaridade";
import { InstrumentoAvaliacao } from "./models/InstrumentoAvaliacao";
import { Paciente } from "./models/Paciente";
import { PacienteDcnt } from "./models/PacienteDcnt";
import { Profissional } from "./models/Profissional";
import { UnidadeSaude } from "./models/UnidadeSaude";

// 1. Configura o adaptador nativo SQLite
const adapter = new SQLiteAdapter({
  schema,
  jsi: true, // Habilita comunicação direta C++ (alta performance no Expo)
  onSetUpError: (error) => {
    console.error("Erro ao inicializar o banco de dados:", error);
  },
});

// 2. Instancia o banco de dados passando as classes
export const database = new Database({
  adapter,
  modelClasses: [
    Paciente,
    Profissional,
    AvaliacaoTesteMeem,
    Escolaridade,
    Dcnt,
    UnidadeSaude,
    InstrumentoAvaliacao,
    PacienteDcnt,
  ],
});
