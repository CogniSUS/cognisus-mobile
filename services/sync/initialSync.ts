import { database } from "@/database/database";
import { supabase } from "@/utils/supabase";
import { synchronize } from "@nozbe/watermelondb/sync";

let isSyncingProcess = false;

export async function syncData() {
  if (isSyncingProcess) {
    console.log("Sincronização já em andamento. Ignorando.");
    return;
  }

  try {
    isSyncingProcess = true;
    console.log("1. Iniciando processo de sincronização com WatermelonDB...");

    await synchronize({
      database,
      pullChanges: async ({ lastPulledAt }) => {
        console.log("2. Executando PULL (Download)...");
        const lastPulledISO = lastPulledAt
          ? new Date(lastPulledAt).toISOString()
          : null;

        const tabelas = [
          "profissional",
          "escolaridade",
          "dcnt",
          "unidade_saude",
          "instrumento_avaliacao",
          "paciente",
          "paciente_dcnt",
          "avaliacao_teste_meem",
        ];

        const changes: any = {};

        for (const tabela of tabelas) {
          let query = supabase.from(tabela).select("*");
          if (lastPulledISO) query = query.gt("updated_at", lastPulledISO);

          const { data, error } = await query;

          if (error)
            throw new Error(
              `Falha no Pull da tabela ${tabela}: ${error.message}`,
            );

          const deletados = data
            .filter((r) => r.deleted_at !== null)
            .map((r) => r.id);
          const ativos = data.filter((r) => r.deleted_at === null);

          changes[tabela] = {
            created: [],
            updated: ativos,
            deleted: deletados,
          };
        }

        return { changes, timestamp: Date.now() };
      },

      pushChanges: async ({ changes, lastPulledAt }) => {
        console.log(
          "3. Executando PUSH (Upload)! Alterações detectadas:",
          Object.keys(changes),
        );

        // Filtro vital: Remove lixo do ORM e converte datas para o Supabase
        const prepararParaSupabase = (record: any) => {
          const { _status, _changed, sync_status, sync_error, ...limpo } =
            record;

          if (typeof limpo.created_at === "number")
            limpo.created_at = new Date(limpo.created_at).toISOString();
          if (typeof limpo.updated_at === "number")
            limpo.updated_at = new Date(limpo.updated_at).toISOString();
          if (typeof limpo.deleted_at === "number")
            limpo.deleted_at = new Date(limpo.deleted_at).toISOString();

          return limpo;
        };

        for (const tabela of Object.keys(changes)) {
          const { created, updated, deleted } = (changes as any)[tabela];

          if (created.length > 0) {
            console.log(`Subindo ${created.length} criações para ${tabela}...`);
            const payload = created.map(prepararParaSupabase);
            const { error } = await supabase.from(tabela).insert(payload);
            if (error)
              throw new Error(`Insert Falhou (${tabela}): ${error.message}`);
          }

          if (updated.length > 0) {
            console.log(
              `Subindo ${updated.length} atualizações para ${tabela}...`,
            );
            const payload = updated.map(prepararParaSupabase);
            const { error } = await supabase.from(tabela).upsert(payload);
            if (error)
              throw new Error(`Upsert Falhou (${tabela}): ${error.message}`);
          }

          if (deleted.length > 0) {
            console.log(
              `Marcando ${deleted.length} exclusões na tabela ${tabela}...`,
            );
            const now = new Date().toISOString();
            for (const id of deleted) {
              const { error } = await supabase
                .from(tabela)
                .update({ deleted_at: now })
                .eq("id", id);
              if (error)
                throw new Error(`Delete Falhou (${tabela}): ${error.message}`);
            }
          }
        }
      },
      sendCreatedAsUpdated: true, // Garante que tudo suba como Upsert
    });

    console.log("4. Sincronização concluída com sucesso!");
  } catch (error) {
    console.error("Erro crítico no motor de sincronização:", error);
    throw error;
  } finally {
    isSyncingProcess = false;
  }
}
