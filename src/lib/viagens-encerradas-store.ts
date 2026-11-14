import { useSyncExternalStore } from "react";
import { viagensEncerradasExemplo, type ViagemEncerrada } from "@/data/exemplo";
import { useDestinos } from "@/lib/destinos-store";
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
    .map(({ vanzeiroId, destinoId, data, temVolta, embarcaram, naoEstavam, ficaram }) => ({ vanzeiroId, destinoId, data, temVolta, embarcaram, naoEstavam, ficaram }));
  return [...passadas, ...hoje];
}

/** Completed trips with destination details. */
export function useViagensEncerradasComDetalhes() {
  const destinos = useDestinos();
  const viagens = viagensFeitas(useViagensEncerradas(), useViagensDoDia().viagens);

  return viagens
    .map((v) => ({
      ...v,
      destino: destinos.find((d) => d.id === v.destinoId),
    }))
    .filter((v) => v.destino)
    .sort((a, b) => b.data.localeCompare(a.data));
}
