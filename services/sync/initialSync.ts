import { getDB } from "@/database/database";
import { supabase } from "@/utils/supabase";

import { SQLiteDatabase } from "expo-sqlite";

export async function initialSync(userId: string) {
  const db = await getDB();

  try {
    const [
      { data: dcnts },
      { data: unidades },
      { data: instrumentos },
      { data: escolaridades },
    ] = await Promise.all([
      supabase.from("dcnt").select("*"),
      supabase.from("unidade_saude").select("*"),
      supabase.from("instrumento_avaliacao").select("*"),
      supabase.from("escolaridade").select("*"),
    ]);

    await db.execAsync("BEGIN TRANSACTION;");

    await saveLocally(db, "dcnt", dcnts);
    await saveLocally(db, "unidade_saude", unidades);
    await saveLocally(db, "instrumento_avaliacao", instrumentos);
    await saveLocally(db, "escolaridade", escolaridades);

    const { data: profissional } = await supabase
      .from("profissional")
      .select("*")
      .eq("user_id", userId) // Usa o parâmetro aqui
      .single();

    if (profissional) await saveLocally(db, "profissional", [profissional]);

    const { data: pacientes } = await supabase.from("paciente").select("*");
    await saveLocally(db, "paciente", pacientes);

    const [{ data: pacientesDcnt }, { data: avaliacoes }] = await Promise.all([
      supabase.from("paciente_dcnt").select("*"),
      supabase.from("avaliacao_teste_meem").select("*"),
    ]);

    await saveLocally(db, "paciente_dcnt", pacientesDcnt);
    await saveLocally(db, "avaliacao_teste_meem", avaliacoes);

    await db.execAsync("COMMIT;");

    console.log("Carga inicial concluída com sucesso!");
  } catch (error) {
    await db.execAsync("ROLLBACK;");
    console.error("Erro na sincronização inicial:", error);
    throw error;
  }
}

/**
 * Salva um array de objetos em uma tabela do SQLite usando INSERT OR REPLACE.
 * @param {SQLiteDatabase} db - A instância do banco de dados SQLite.
 * @param {string} tableName - O nome da tabela onde os dados serão salvos.
 * @param {Array} data - Array de objetos vindos do Supabase.
 */
export async function saveLocally(
  db: SQLiteDatabase,
  tableName: string,
  data: any[] | null,
) {
  // Se não vieram dados, não há o que fazer
  if (!data || data.length === 0) {
    console.log(`Nenhum dado para salvar na tabela ${tableName}.`);
    return;
  }

  try {
    // 1. Pegamos as chaves (colunas) do primeiro objeto para montar a query
    // Adicionamos/forçamos a coluna sync_status para garantir que o banco local
    // saiba que esse dado veio do servidor e já está sincronizado.
    const sampleItem = { ...data[0], sync_status: "synced" };
    const columns = Object.keys(sampleItem);

    // 2. Criamos os placeholders (?, ?, ?) baseados na quantidade de colunas
    const placeholders = columns.map(() => "?").join(", ");

    // 3. Montamos a query usando INSERT OR REPLACE
    // O SQLite vai olhar para a PRIMARY KEY (id). Se o ID já existir, ele atualiza a linha inteira.
    // Se o ID não existir, ele insere uma nova linha.
    const query = `INSERT OR REPLACE INTO ${tableName} (${columns.join(", ")}) VALUES (${placeholders});`;

    // 4. Prepara o statement (muito mais performático para múltiplos inserts)
    const statement = await db.prepareAsync(query);

    try {
      // 5. Executa o statement para cada item do array
      for (const item of data) {
        // Garantimos que o sync_status seja injetado em cada item
        const itemToSave = { ...item, sync_status: "synced" };

        // Mapeamos os valores do objeto para um array na mesma ordem das colunas
        // Usamos null fallback caso algum valor venha undefined do Supabase
        const values = columns.map((col) => itemToSave[col] ?? null);

        await statement.executeAsync(values);
      }
      console.log(`✅ ${data.length} registros salvos na tabela ${tableName}`);
    } finally {
      // 6. É OBRIGATÓRIO finalizar o statement para liberar memória do SQLite
      await statement.finalizeAsync();
    }
  } catch (error) {
    console.error(
      `Erro ao salvar dados localmente na tabela ${tableName}:`,
      error,
    );
    throw error; // Repassa o erro para que a transação no initialSync possa dar ROLLBACK
  }
}
