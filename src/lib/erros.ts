import { obterSessao } from "@/lib/sessao";
import { supabase, USA_BANCO } from "@/lib/supabase";

// REV-05 (owner, 17/11/2026): errors on the phones are kept in the database (`erros_do_app`) so they can be seen and
// fixed without asking anyone for a print. Only the error text (e-mails and long numbers removed), the screen (no
// query string), the role and the browser. The same error is sent once per opening; at most 20 per opening.

/** Removes what could be personal data from an error text: e-mails and runs of 8+ digits (phones, documents). */
export function limparTexto(texto: string, limite: number) {
  return texto
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, "[e-mail]")
    .replace(/\(?\d[\d\s().-]{7,}\d/g, "[número]")
    .slice(0, limite);
}

export function textoDoErro(erro: unknown): { mensagem: string; detalhe: string | null } {
  if (erro instanceof Error)
    return { mensagem: `${erro.name}: ${erro.message}`, detalhe: erro.stack ?? null };
  if (typeof erro === "string") return { mensagem: erro, detalhe: null };
  try {
    return { mensagem: JSON.stringify(erro) ?? String(erro), detalhe: null };
  } catch {
    return { mensagem: String(erro), detalhe: null };
  }
}

const enviados = new Set<string>();
const LIMITE_POR_ABERTURA = 20;

export async function registrarErro(
  erro: unknown,
  tela = typeof location === "undefined" ? "" : location.pathname,
): Promise<boolean> {
  const sb = supabase();
  if (!USA_BANCO.conta || !sb) return false;
  const { mensagem, detalhe } = textoDoErro(erro);
  const limpa = limparTexto(mensagem, 2000).trim();
  if (!limpa || enviados.has(limpa) || enviados.size >= LIMITE_POR_ABERTURA) return false;
  enviados.add(limpa);
  const { error } = await sb.from("erros_do_app").insert({
    papel: obterSessao().papel ?? null,
    tela: tela.slice(0, 200),
    mensagem: limpa,
    detalhe: detalhe ? limparTexto(detalhe, 4000) : null,
    navegador: typeof navigator === "undefined" ? null : navigator.userAgent.slice(0, 300),
  });
  return !error;
}

// Errors nobody caught, anywhere in the app.
if (typeof window !== "undefined") {
  window.addEventListener("error", (e) => void registrarErro(e.error ?? e.message));
  window.addEventListener("unhandledrejection", (e) => void registrarErro(e.reason));
}
