import { useSyncExternalStore } from "react";
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

export function marcarComoLido(avisoId: string) {
  const aviso = avisos.find((a) => a.id === avisoId);
  if (aviso) {
    aviso.lido = true;
    notificar();
  }
}

export function marcarTodosComoLido(paraId: string) {
  avisos.forEach((a) => {
    if (a.paraVanzeiroOuPassageiroId === paraId && !a.lido) {
      a.lido = true;
    }
  });
  notificar();
}

export function criarAviso(aviso: Omit<Aviso, "id">) {
  const novoAviso: Aviso = {
    ...aviso,
    id: `av-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  };
  avisos.push(novoAviso);
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
