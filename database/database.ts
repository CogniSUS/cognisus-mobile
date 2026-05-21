import * as SQLite from "expo-sqlite";

// Cria uma função para pegar/abrir o banco de forma assíncrona
export const getDB = async () => {
  return await SQLite.openDatabaseAsync("cognisus.db");
};

export const initDB = async () => {
  try {
    const db = await getDB();

    // Configurações da Conexão usando execAsync
    await db.execAsync("PRAGMA foreign_keys = ON;");
    await db.execAsync("PRAGMA journal_mode = WAL;");

    // Criação das tabelas
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS escolaridade (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          update_at TEXT,
          deleted_at TEXT,
          sync_status TEXT NOT NULL,
          sync_error TEXT,
          tipo TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS dcnt (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          created_at TEXT NOT NULL,
          update_at TEXT,
          deleted_at TEXT,
          sync_status TEXT NOT NULL,
          sync_error TEXT,
          tipo TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS unidade_saude (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          created_at TEXT NOT NULL,
          update_at TEXT,
          deleted_at TEXT,
          sync_status TEXT NOT NULL,
          sync_error TEXT,
          nome TEXT NOT NULL,
          endereco TEXT NOT NULL,
          cnes TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS instrumento_avaliacao (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          created_at TEXT NOT NULL,
          update_at TEXT,
          deleted_at TEXT,
          sync_status TEXT NOT NULL,
          sync_error TEXT,
          nome TEXT NOT NULL,
          status INTEGER NOT NULL,
          versao TEXT,
          abreviacao TEXT,
          tempo_estimado_min INTEGER
        );

        CREATE TABLE IF NOT EXISTS paciente (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          created_at TEXT NOT NULL,
          update_at TEXT,
          deleted_at TEXT,
          sync_status TEXT NOT NULL,
          sync_error TEXT,
          nome_completo TEXT NOT NULL,
          cpf TEXT NOT NULL UNIQUE,
          data_nascimento TEXT NOT NULL,
          sexo TEXT NOT NULL,
          escolaridade INTEGER,
          FOREIGN KEY (escolaridade) REFERENCES escolaridade(id)
        );

        CREATE TABLE IF NOT EXISTS profissional (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          created_at TEXT NOT NULL,
          update_at TEXT,
          deleted_at TEXT,
          sync_status TEXT NOT NULL,
          sync_error TEXT,
          user_id TEXT NOT NULL,
          nome_completo TEXT NOT NULL,
          cpf TEXT NOT NULL UNIQUE,
          email TEXT NOT NULL UNIQUE
        );

        CREATE TABLE IF NOT EXISTS paciente_dcnt (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          created_at TEXT NOT NULL,
          update_at TEXT,
          deleted_at TEXT,
          sync_status TEXT NOT NULL,
          sync_error TEXT,
          id_paciente INTEGER NOT NULL,
          id_dcnt INTEGER NOT NULL,
          FOREIGN KEY (id_paciente) REFERENCES paciente(id),
          FOREIGN KEY (id_dcnt) REFERENCES dcnt(id)
        );

        CREATE TABLE IF NOT EXISTS avaliacao_teste_meem (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          created_at TEXT NOT NULL,
          update_at TEXT,
          deleted_at TEXT,
          sync_status TEXT NOT NULL,
          sync_error TEXT,
          id_paciente INTEGER NOT NULL,
          id_profissional INTEGER NOT NULL,
          id_instrumento INTEGER NOT NULL,
          unidade_saude INTEGER NOT NULL,
          data_inicio TEXT NOT NULL,
          data_fim TEXT,
          score_orientacao_espacial REAL NOT NULL,
          score_atencao REAL NOT NULL,
          score_linguagem REAL NOT NULL,
          score_visuoespacial REAL NOT NULL,
          score_memoria_recente REAL NOT NULL,
          score_memoria_imediata REAL NOT NULL,
          score_total REAL NOT NULL,
          classificacao TEXT NOT NULL,
          FOREIGN KEY (id_paciente) REFERENCES paciente(id),
          FOREIGN KEY (id_profissional) REFERENCES profissional(id),
          FOREIGN KEY (id_instrumento) REFERENCES instrumento_avaliacao(id),
          FOREIGN KEY (unidade_saude) REFERENCES unidade_saude(id)
        );
    `);

    console.log("Banco de dados inicializado com chaves estrangeiras ativas!");
  } catch (error) {
    console.error("Erro ao inicializar o banco de dados:", error);
  }
};
