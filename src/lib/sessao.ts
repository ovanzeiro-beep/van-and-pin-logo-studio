import { useSyncExternalStore } from "react";
import { passageiroExemplo, passageirosExemplo, vanzeiroExemplo } from "@/data/exemplo";

// The only place that knows who is using the app and in which role.
// With real login, only this file changes. It imports no other app rules on purpose.

export type Papel = "vanzeiro" | "passageiro";

/** The passenger side of whoever is using the app. */
export type SessaoPassageiro = { nome: string; telefone: string; passageiroId: string | null; pedidoId: string | null };

export type Sessao = {
  /** Last choice in "Como você vai usar o app?" (or none yet). */
  papel: Papel | null;
  /** Account created now whose first panel is not open yet. */
  contaNova: { nome: string } | null;
  vanzeiroId: string;
  passageiro: SessaoPassageiro;
};

const juliana = passageirosExemplo.find((p) => p.id === passageiroExemplo.passageiroId);
const inicial: Sessao = {
  papel: null,
  contaNova: null,
  vanzeiroId: vanzeiroExemplo.id,
  passageiro: { nome: juliana?.nome ?? "", telefone: juliana?.telefone ?? "", passageiroId: passageiroExemplo.passageiroId, pedidoId: null },
};

let sessao = inicial;
const ouvintes = new Set<() => void>();

function inscrever(o: () => void) {
  ouvintes.add(o);
  return () => ouvintes.delete(o);
}

export const obterSessao = () => sessao;

export function useSessao() {
  return useSyncExternalStore(inscrever, () => sessao, () => inicial);
}

export function mudarSessao(parcial: Partial<Sessao>) {
  sessao = { ...sessao, ...parcial };
  ouvintes.forEach((o) => o());
}

export function mudarSessaoPassageiro(parcial: Partial<SessaoPassageiro>) {
  mudarSessao({ passageiro: { ...sessao.passageiro, ...parcial } });
}

/** Who owns what the vanzeiro creates. */
export const idDoVanzeiro = () => sessao.vanzeiroId;

/** Back to the start (used by tests). */
export function limparSessao() {
  sessao = inicial;
  ouvintes.forEach((o) => o());
}
