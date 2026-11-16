import { useSyncExternalStore } from "react";

// Every action a person does on a screen (V2, section 20 of docs/fonte-da-verdade.md) answers "deu certo" or
// "não deu, porque…". Screens call the actions through `fazer(...)`, which shows "Salvando…" while it waits and the
// message when it does not work, the same way in the whole app. Today the actions work in memory and answer at once;
// with the database (Supabase), they wait for the answer, can fail without signal, and the screens are already ready.

export type Resultado = { ok: true } | { ok: false; motivo: string };

export const deuCerto: Resultado = { ok: true };
export const naoDeu = (motivo: string): Resultado => ({ ok: false, motivo });

/** The destino or the membership is no longer there (deleted, or the person left). */
export const SEM_DESTINO = "Não achamos este destino. Ele pode ter sido excluído ou você saiu dele.";

/** When the database does not answer (no signal, server down). */
export const SEM_RESPOSTA = "Não deu para salvar. Confira o sinal e tente de novo.";

type Estado = { salvando: number; mensagem: { id: number; texto: string } | null };
const inicial: Estado = { salvando: 0, mensagem: null };
let estado = inicial;
let proximaMensagem = 1;
const ouvintes = new Set<() => void>();
const mudar = (novo: Estado) => {
  estado = novo;
  ouvintes.forEach((o) => o());
};

export function useEstadoDasAcoes() {
  return useSyncExternalStore(
    (o) => {
      ouvintes.add(o);
      return () => {
        ouvintes.delete(o);
      };
    },
    () => estado,
    () => inicial,
  );
}

export const obterMensagemDasAcoes = () => estado.mensagem;

export function fecharMensagem() {
  if (estado.mensagem) mudar({ ...estado, mensagem: null });
}

function mostrar(texto: string) {
  mudar({ ...estado, mensagem: { id: proximaMensagem++, texto } });
}

/**
 * Runs an action the person did. The change itself happens right away (in memory today); then "Salvando…" ends and,
 * if it did not work, the reason is shown at the top of the screen. The answer also comes back to the screen.
 */
export async function fazer<R extends Resultado>(acao: () => R | Promise<R>): Promise<R | { ok: false; motivo: string }> {
  mudar({ ...estado, salvando: estado.salvando + 1 });
  let r: R | { ok: false; motivo: string };
  try {
    r = await acao();
  } catch {
    r = { ok: false, motivo: SEM_RESPOSTA };
  }
  mudar({ ...estado, salvando: Math.max(0, estado.salvando - 1) });
  if (!r.ok) mostrar(r.motivo);
  else if (estado.mensagem) fecharMensagem();
  return r;
}
