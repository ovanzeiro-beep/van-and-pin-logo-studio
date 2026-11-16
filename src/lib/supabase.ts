import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// The connection to the owner's Supabase (docs/banco-de-dados.md, section 8). The address and the publishable key
// are public by design: they go inside the app on every phone; what protects the data are the rules in the database
// (row level security, supabase/migrations). The secret key never comes here.

export const SUPABASE_URL = "https://rnziztwicggdekmpwpgy.supabase.co";
export const SUPABASE_CHAVE_PUBLICA = "sb_publishable_cUlgPq_dbBSTRXJP5VfZLA_pA_BHb4s";

/**
 * Which parts of the app already use the database (one stage W at a time, section 8.3). The automatic tests keep
 * everything in memory, with the samples. To send a part back to memory, set it to false here.
 */
export const USA_BANCO = {
  conta: import.meta.env.MODE !== "test",
  /** W2 and W3: the vanzeiro's profile and the destinos (with days without a trip). */
  destinos: import.meta.env.MODE !== "test",
} as const;

let cliente: SupabaseClient | null = null;

/** The Supabase client, only in the browser (the server page render never talks to the database). */
export function supabase(): SupabaseClient | null {
  if (typeof window === "undefined") return null;
  cliente ??= createClient(SUPABASE_URL, SUPABASE_CHAVE_PUBLICA, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: "pkce" },
  });
  return cliente;
}
