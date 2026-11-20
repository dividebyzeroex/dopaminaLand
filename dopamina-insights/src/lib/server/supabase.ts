import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Cliente Supabase usado SOMENTE nas rotas de servidor do painel.
 *
 * Usa a SUPABASE_SERVICE_ROLE_KEY quando configurada (necessária depois da migration 003,
 * que remove a leitura pública de sessions/intent_events). Enquanto ela não existir,
 * cai para a chave pública — que hoje ainda consegue ler essas tabelas.
 */
let cached: SupabaseClient | null = null;

export function serverSupabase(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase não configurado (NEXT_PUBLIC_SUPABASE_URL e uma chave).');
  cached = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  return cached;
}

export function usingServiceRole(): boolean {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/** Lê todas as linhas de uma consulta paginando de 1000 em 1000 (limite do PostgREST). */
export async function fetchAll<T>(
  build: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
  maxRows = 60000,
): Promise<{ rows: T[]; truncated: boolean }> {
  const page = 1000;
  const rows: T[] = [];
  for (let from = 0; from < maxRows; from += page) {
    const { data, error } = await build(from, from + page - 1);
    if (error) throw new Error(error.message);
    const batch = data ?? [];
    rows.push(...batch);
    if (batch.length < page) return { rows, truncated: false };
  }
  return { rows, truncated: true };
}
