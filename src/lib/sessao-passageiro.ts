import { useSyncExternalStore } from "react";
import { passageiroExemplo, passageirosExemplo, type Passageiro } from "@/data/exemplo";
import { adicionarPedido, useAceitos, usePassageiros, usePedidos } from "@/lib/passageiros-store";

// Who is using the passenger panel on this phone. Starts as the sample passenger (Juliana);
// a new account starts with no van and joins one with an invite code.
type Sessao = { nome: string; telefone: string; passageiroId: string | null; pedidoId: string | null };
const juliana = passageirosExemplo.find((p) => p.id === passageiroExemplo.passageiroId);
const inicial: Sessao = {
  nome: juliana?.nome ?? "",
  telefone: juliana?.telefone ?? "",
  passageiroId: passageiroExemplo.passageiroId,
  pedidoId: null,
};
let sessao = inicial;
const ouvintes = new Set<() => void>();

function mudar(nova: Sessao) {
  sessao = nova;
  ouvintes.forEach((o) => o());
}

function inscrever(o: () => void) {
  ouvintes.add(o);
  return () => ouvintes.delete(o);
}

export function useSessaoPassageiro() {
  return useSyncExternalStore(inscrever, () => sessao, () => inicial);
}

/** "Criar conta": a new person, not in any van yet. */
export function criarContaNova(nome: string) {
  mudar({ nome: nome.trim(), telefone: "", passageiroId: null, pedidoId: null });
}

export function pedirParaEntrar(destinoId: string, nome: string, telefone: string) {
  const pedidoId = adicionarPedido({ destinoId, nome: nome.trim(), telefone });
  mudar({ ...sessao, nome: nome.trim(), telefone, pedidoId });
}

export function tentarOutroCodigo() {
  mudar({ ...sessao, pedidoId: null });
}

export type MinhaSituacao =
  | { tipo: "membro"; passageiro: Passageiro }
  | { tipo: "aguardando"; destinoId: string }
  | { tipo: "recusado" }
  | { tipo: "sem-van" };

/** Whether this person is in a van, waiting for the vanzeiro, or still needs an invite code. */
export function useMinhaSituacao(): MinhaSituacao {
  const s = useSessaoPassageiro();
  const passageiros = usePassageiros();
  const pedidos = usePedidos();
  const aceitos = useAceitos();
  const id = (s.pedidoId && aceitos[s.pedidoId]) || s.passageiroId;
  const passageiro = passageiros.find((p) => p.id === id);
  if (passageiro) return { tipo: "membro", passageiro };
  if (s.pedidoId) {
    const pedido = pedidos.find((p) => p.id === s.pedidoId);
    return pedido ? { tipo: "aguardando", destinoId: pedido.destinoId } : { tipo: "recusado" };
  }
  return { tipo: "sem-van" };
}

/** The passenger record of whoever is using the panel (the panel only opens when there is one). */
export function useEu(): Passageiro {
  const s = useMinhaSituacao();
  if (s.tipo !== "membro") throw new Error("Passageiro sem van");
  return s.passageiro;
}
