import { supabase } from "@/lib/supabase";
import type { FaseViagem, ViagemDoDia } from "@/lib/viagem";

// Without signal inside the van: the trip goes on. Each tap that could not reach the database waits here, on the
// phone (it survives closing the app), and is sent as soon as the signal comes back. Only the newest state of each
// trip is kept (it already has every tap before it).

export type ViagemPendente = {
  id: string;
  vanzeiro_id: string;
  destino_id: string;
  data: string;
  fase: FaseViagem;
  estado: ViagemDoDia;
  terminou_em: string | null;
};

const CHAVE = "vanzeiro-viagens-sem-sinal";

function ler(): Record<string, ViagemPendente> {
  try {
    return JSON.parse(localStorage.getItem(CHAVE) ?? "{}") as Record<string, ViagemPendente>;
  } catch {
    return {};
  }
}

function gravar(fila: Record<string, ViagemPendente>) {
  try {
    if (Object.keys(fila).length === 0) localStorage.removeItem(CHAVE);
    else localStorage.setItem(CHAVE, JSON.stringify(fila));
  } catch {
    // No room on the phone: the tap still counts on the screen.
  }
}

/** The error came from having no signal (not from the database refusing). */
export function semSinal(erro: { message?: string } | null): boolean {
  if (typeof navigator !== "undefined" && navigator.onLine === false) return true;
  return /fetch|network|load failed/i.test(erro?.message ?? "");
}

export function guardarSemSinal(v: ViagemPendente) {
  gravar({ ...ler(), [v.id]: v });
}

export const temPendente = (id: string) => id in ler();
export const viagensPendentes = () => Object.values(ler());

let enviando: Promise<void> | null = null;

/** Sends what is waiting. What the database refuses (not a lack of signal) cannot be sent and is dropped. */
export function enviarPendentes(): Promise<void> {
  enviando ??= (async () => {
    const sb = supabase();
    if (!sb) return;
    for (const v of viagensPendentes()) {
      const { error } = await sb.from("viagens").upsert(v, { onConflict: "id" });
      if (error && semSinal(error)) break;
      const fila = ler();
      // Only if no newer tap arrived meanwhile.
      if (JSON.stringify(fila[v.id]) === JSON.stringify(v)) delete fila[v.id];
      gravar(fila);
    }
  })().finally(() => (enviando = null));
  return enviando;
}

if (typeof window !== "undefined") window.addEventListener("online", () => void enviarPendentes());
