import { useEffect, useState, useSyncExternalStore } from "react";
import { avisosExemplo, type Aviso } from "@/data/exemplo";
import { novoId } from "@/lib/ids";

let avisos = [...avisosExemplo];

const listeners = new Set<() => void>();

function notificar() {
  listeners.forEach((listener) => listener());
}

export function obterAvisos() {
  return avisos;
}

export function obterAvisosNaoLidos(paraId: string) {
  return avisos.filter((a) => a.paraVanzeiroOuPassageiroId === paraId && !a.lido);
}

// Changes always make a new list (never edit a notice in place), so the screens see them.
/** Opening Notificações: every notice of this person counts as read. */
export function marcarTodosComoLido(paraId: string) {
  if (!avisos.some((a) => a.paraVanzeiroOuPassageiroId === paraId && !a.lido)) return;
  avisos = avisos.map((a) => (a.paraVanzeiroOuPassageiroId === paraId ? { ...a, lido: true } : a));
  notificar();
}

/** Every notice of this person, newest first. */
export function avisosDaPessoa(lista: Aviso[], paraId: string) {
  // Same day: the one created last comes first.
  return [...lista]
    .reverse()
    .filter((a) => a.paraVanzeiroOuPassageiroId === paraId)
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

export function useAvisosNaoLidos(paraId: string) {
  const todos = useAvisos();
  return todos.filter((a) => a.paraVanzeiroOuPassageiroId === paraId && !a.lido);
}

/** Notificações screen: every notice of the person; the ones not seen before opening are "novos", and now count as read. */
export function useAvisosAoAbrir(paraId: string) {
  const avisos = avisosDaPessoa(useAvisos(), paraId);
  const [novos] = useState(() => new Set(obterAvisosNaoLidos(paraId).map((a) => a.id)));
  useEffect(() => marcarTodosComoLido(paraId), [paraId]);
  return { avisos, novos };
}
