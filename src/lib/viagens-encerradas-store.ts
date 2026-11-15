import { useSyncExternalStore } from "react";
import { viagensEncerradasExemplo, type ViagemEncerrada } from "@/data/exemplo";
import type { ViagemDoDia } from "@/lib/viagem";
import { useViagensDoDia } from "@/lib/viagem-store";

let viagensEncerradas = [...viagensEncerradasExemplo];

const listeners = new Set<() => void>();

function notificar() {
  listeners.forEach((listener) => listener());
}

export function obterViagensEncerradas() {
  return viagensEncerradas;
}

export function limparViagensEncerradas() {
  viagensEncerradas = [];
  notificar();
}

export function useViagensEncerradas() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => viagensEncerradas,
    () => viagensEncerradas,
  );
}

/** Past trips plus the trips finished today (read from the trip itself, never copied). */
export function viagensFeitas(passadas: ViagemEncerrada[], deHoje: Record<string, ViagemDoDia>): ViagemEncerrada[] {
  const hoje = Object.values(deHoje)
    .filter((v) => v.fase === "encerrada")
    .map(({ vanzeiroId, destinoId, data, temVolta, foto, embarcaram, naoEstavam, ficaram }) => ({ vanzeiroId, destinoId, data, temVolta, foto, embarcaram, naoEstavam, ficaram }));
  return [...passadas, ...hoje];
}

/** Completed trips, newest first. Each one keeps how its destino was that day, even if it was edited or deleted later. */
export function useViagensEncerradasComDetalhes() {
  const viagens = viagensFeitas(useViagensEncerradas(), useViagensDoDia().viagens);
  return [...viagens].sort((a, b) => b.data.localeCompare(a.data));
}
