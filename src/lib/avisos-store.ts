import { useEffect, useState, useSyncExternalStore } from "react";
import { avisosExemplo, type Aviso } from "@/data/exemplo";
import { novoId } from "@/lib/ids";

let avisos = [...avisosExemplo];

const listeners = new Set<() => void>();

function notificar() {
  listeners.forEach((listener) => listener());
}

/** Notices for the vanzeiro's panel; every other kind is for the passenger's panel. */
const TIPOS_DO_VANZEIRO = new Set<string>(["pedido_novo", "resposta_passageiro", "cobranca_vencida"]);
export type Painel = "vanzeiro" | "passageiro";

/**
 * Owner (17/11/2026): one account can be vanzeiro and passenger ("Trocar para passageiro"); each panel shows only its
 * own notices. Without a panel, all of the person's.
 */
export function doPainel(a: Pick<Aviso, "tipo">, painel?: Painel) {
  if (!painel) return true;
  return painel === "vanzeiro" ? TIPOS_DO_VANZEIRO.has(a.tipo) : !TIPOS_DO_VANZEIRO.has(a.tipo);
}

export function obterAvisos() {
  return avisos;
}

export function obterAvisosNaoLidos(paraId: string, painel?: Painel) {
  return avisos.filter((a) => a.paraVanzeiroOuPassageiroId === paraId && !a.lido && !a.apagado && doPainel(a, painel));
}

/** "Limpar" on the bell: every notice of this person leaves the list (they stay kept, hidden). */
export function limparAvisosDaPessoa(paraId: string, painel?: Painel) {
  const meu = (a: Aviso) => a.paraVanzeiroOuPassageiroId === paraId && doPainel(a, painel);
  if (!avisos.some((a) => meu(a) && !a.apagado)) return;
  avisos = avisos.map((a) => (meu(a) ? { ...a, apagado: true, lido: true } : a));
  notificar();
}

// Changes always make a new list (never edit a notice in place), so the screens see them.
/** Opening Notificações: every notice of this person counts as read. */
export function marcarTodosComoLido(paraId: string, painel?: Painel) {
  const meu = (a: Aviso) => a.paraVanzeiroOuPassageiroId === paraId && doPainel(a, painel);
  if (!avisos.some((a) => meu(a) && !a.lido)) return;
  avisos = avisos.map((a) => (meu(a) ? { ...a, lido: true } : a));
  notificar();
}

/** Every notice of this person, newest first. */
export function avisosDaPessoa(lista: Aviso[], paraId: string, painel?: Painel) {
  // Same day: the one created last comes first.
  return [...lista]
    .reverse()
    .filter((a) => a.paraVanzeiroOuPassageiroId === paraId && !a.apagado && doPainel(a, painel))
    .sort((a, b) => b.dataCriacao.localeCompare(a.dataCriacao));
}

export function criarAviso(aviso: Omit<Aviso, "id">) {
  const novoAviso: Aviso = {
    ...aviso,
    id: novoId("aviso"),
  };
  avisos = [...avisos, novoAviso];
  notificar();
  return novoAviso;
}

/** Creates the notice only if there is none with the same chave yet. */
export function criarAvisoUmaVez(aviso: Omit<Aviso, "id">) {
  if (aviso.chave && avisos.some((a) => a.chave === aviso.chave)) return;
  criarAviso(aviso);
}

// W8: the notices that replace an older one with the same chave (the database replaces it too).
const trocados = new Set<string>();
export const foiTrocado = (id: string) => trocados.has(id);

/** Creates the notice, replacing the one with the same chave (e.g. a passenger changed the answer). */
export function trocarAviso(aviso: Omit<Aviso, "id">) {
  avisos = avisos.filter((a) => !aviso.chave || a.chave !== aviso.chave);
  trocados.add(criarAviso(aviso).id);
}

/** W8: this person's notices come from the database; the ones this phone made for other people stay (already saved). */
export function carregarAvisosDoBanco(lista: Aviso[], meuId: string) {
  avisos = [...avisos.filter((a) => a.paraVanzeiroOuPassageiroId !== meuId), ...lista];
  notificar();
}

export function limparAvisos() {
  avisos = [];
  notificar();
}

/** Calls `o` after every change in the notices (for the phone notifications). */
export function ouvirAvisos(o: () => void) {
  listeners.add(o);
  return () => {
    listeners.delete(o);
  };
}

function useAvisos() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => avisos,
    // While the page opens, show what the server showed; the clock's notices come right after.
    () => avisosExemplo,
  );
}

export function useAvisosNaoLidos(paraId: string, painel?: Painel) {
  const todos = useAvisos();
  return todos.filter((a) => a.paraVanzeiroOuPassageiroId === paraId && !a.lido && !a.apagado && doPainel(a, painel));
}

/** Notificações screen: every notice of the person; the ones not seen before opening are "novos", and now count as read. */
export function useAvisosAoAbrir(paraId: string, painel?: Painel) {
  const avisos = avisosDaPessoa(useAvisos(), paraId, painel);
  const [novos] = useState(() => new Set(obterAvisosNaoLidos(paraId, painel).map((a) => a.id)));
  useEffect(() => marcarTodosComoLido(paraId, painel), [paraId, painel]);
  return { avisos, novos };
}
