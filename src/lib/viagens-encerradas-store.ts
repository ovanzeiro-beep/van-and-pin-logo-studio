import { useSyncExternalStore } from "react";
import { viagensEncerradasExemplo, type ViagemEncerrada } from "@/data/exemplo";
import { useDestinos } from "@/lib/destinos-store";

let viagensEncerradas = [...viagensEncerradasExemplo];

const listeners = new Set<() => void>();

function notificar() {
  listeners.forEach((listener) => listener());
}

export function obterViagensEncerradas() {
  return viagensEncerradas;
}

export function adicionarViagemEncerrada(viagem: ViagemEncerrada) {
  viagensEncerradas.push(viagem);
  notificar();
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
  );
}

/** Completed trips with destination details. */
export function useViagensEncerradasComDetalhes() {
  const destinos = useDestinos();
  const viagens = useViagensEncerradas();

  return viagens
    .map((v) => ({
      ...v,
      destino: destinos.find((d) => d.id === v.destinoId),
    }))
    .filter((v) => v.destino)
    .sort((a, b) => b.data.localeCompare(a.data));
}
