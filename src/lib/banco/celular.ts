import { useEffect } from "react";
import { obterSessao, useSessao } from "@/lib/sessao";
import { SUPABASE_CHAVE_PUBLICA, SUPABASE_URL, supabase, USA_BANCO } from "@/lib/supabase";

// W10 (docs/banco-de-dados.md, section 8.3): notices on the phone screen even with the app closed. A phone that turned
// the notifications on gets a delivery address from the browser ("push"); the app keeps it in the database, under the
// account logged in. When a notice is born, the database calls the function "avisos-no-celular", which delivers it.

const ENTREGA = `${SUPABASE_URL}/functions/v1/avisos-no-celular`;

/** "BEl6…" (base64url) → bytes, the way the browser wants the public key. */
export function bytesDaChave(chave: string): Uint8Array<ArrayBuffer> {
  const base64 = (chave + "=".repeat((4 - (chave.length % 4)) % 4))
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const texto = atob(base64);
  const bytes = new Uint8Array(new ArrayBuffer(texto.length));
  for (let i = 0; i < texto.length; i++) bytes[i] = texto.charCodeAt(i);
  return bytes;
}

/** Saves this phone's delivery address under the account logged in (only when the notifications are on). */
export async function guardarEsteCelular(): Promise<boolean> {
  const sb = supabase();
  if (!USA_BANCO.conta || !sb || !obterSessao().conta) return false;
  if (
    !("serviceWorker" in navigator) ||
    !("PushManager" in window) ||
    Notification.permission !== "granted"
  )
    return false;
  try {
    const registro = await navigator.serviceWorker.ready;
    let assinatura = await registro.pushManager.getSubscription();
    if (!assinatura) {
      const r = await fetch(ENTREGA, { headers: { apikey: SUPABASE_CHAVE_PUBLICA } });
      const { chave } = (await r.json()) as { chave?: string };
      if (!chave) return false;
      assinatura = await registro.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: bytesDaChave(chave),
      });
    }
    const { error } = await sb.rpc("guardar_celular", { endereco: assinatura.toJSON() });
    return !error;
  } catch {
    return false;
  }
}

/** In the root of the app: every time an account comes in on this phone, its address is saved again. */
export function useCelularNoBanco() {
  const contaId = useSessao().conta?.id;
  useEffect(() => {
    if (contaId) void guardarEsteCelular();
  }, [contaId]);
}
