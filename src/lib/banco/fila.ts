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

type RegistroDaFila = ViagemPendente & { recusada?: boolean };

const CHAVE = "vanzeiro-viagens-sem-sinal";
const EVENTO = "vanzeiro-fila-atualizada";

function ler(): Record<string, RegistroDaFila> {
  try {
    return JSON.parse(localStorage.getItem(CHAVE) ?? "{}") as Record<string, RegistroDaFila>;
  } catch {
    return {};
  }
}

function gravar(fila: Record<string, RegistroDaFila>) {
  try {
    if (Object.keys(fila).length === 0) localStorage.removeItem(CHAVE);
    else localStorage.setItem(CHAVE, JSON.stringify(fila));
    if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENTO));
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
  const fila = ler();
  fila[v.id] = fila[v.id]?.recusada ? { ...v, recusada: true } : v;
  gravar(fila);
}

export const temPendente = (id: string) => id in ler();
export const viagensPendentes = () => Object.values(ler());

export const envioRecusado = (id: string) => ler()[id]?.recusada === true;

export function inscreverNaFila(atualizar: () => void) {
  window.addEventListener(EVENTO, atualizar);
  return () => window.removeEventListener(EVENTO, atualizar);
}

let enviando: Promise<void> | null = null;

/** Remove a pending trip only after the server accepts it. Rejected trips can be retried manually. */
export async function enviarPendentes(tentarId?: string): Promise<void> {
  if (tentarId && enviando) await enviando;
  enviando ??= (async () => {
    const sb = supabase();
    if (!sb) return;
    for (const registro of viagensPendentes()) {
      const { recusada, ...viagem } = registro;
      if (tentarId ? viagem.id !== tentarId : recusada) continue;

      const { error, status } = await sb.from("viagens").upsert(viagem, { onConflict: "id" });
      if (error && semSinal(error)) break;

      const fila = ler();
      // Leave a newer tap untouched while the request was in flight.
      if (JSON.stringify(fila[viagem.id]) !== JSON.stringify(registro)) continue;

      if (!error) {
        delete fila[viagem.id];
      } else if (status >= 400 && status < 500 && status !== 408 && status !== 429) {
        fila[viagem.id] = { ...registro, recusada: true };
      } else {
        continue;
      }
      gravar(fila);
    }
  })().finally(() => (enviando = null));
  return enviando;
}

if (typeof window !== "undefined") window.addEventListener("online", () => void enviarPendentes());
