import { useEffect, useState, useSyncExternalStore } from "react";
import { avisosExemplo, type Aviso } from "@/data/exemplo";

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
export function marcarComoLido(avisoId: string) {
  if (!avisos.some((a) => a.id === avisoId && !a.lido)) return;
  avisos = avisos.map((a) => (a.id === avisoId ? { ...a, lido: true } : a));
  notificar();
}

/** Opening Notificações: every notice of this person counts as read. */
export function marcarTodosComoLido(paraId: string) {
  if (!avisos.some((a) => a.paraVanzeiroOuPassageiroId === paraId && !a.lido)) return;
  avisos = avisos.map((a) => (a.paraVanzeiroOuPassageiroId === paraId ? { ...a, lido: true } : a));
  notificar();
}

/** Every notice of this person, newest first. */
export function avisosDaPessoa(lista: Aviso[], paraId: string) {
  return lista.filter((a) => a.paraVanzeiroOuPassageiroId === paraId).sort((a, b) => b.dataCriacao.localeCompare(a.dataCriacao));
}

export function criarAviso(aviso: Omit<Aviso, "id">) {
  const novoAviso: Aviso = {
    ...aviso,
    id: `av-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  };
  avisos = [...avisos, novoAviso];
  notificar();
  return novoAviso;
}

export function limparAvisos() {
  avisos = [];
  notificar();
}

export function useAvisos() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => avisos,
    () => avisos,
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
