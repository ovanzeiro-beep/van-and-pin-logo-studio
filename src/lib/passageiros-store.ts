import { useMemo, useSyncExternalStore } from "react";
import { passageirosExemplo, pedidosExemplo, type Passageiro } from "@/data/exemplo";

// In-memory lists for the visual stage: changes last until the page is reloaded.
let passageiros = passageirosExemplo;
let pedidos = pedidosExemplo;
const ouvintes = new Set<() => void>();

function avisar() {
  ouvintes.forEach((o) => o());
}

function inscrever(o: () => void) {
  ouvintes.add(o);
  return () => ouvintes.delete(o);
}

export const obterPassageiros = () => passageiros;
export const obterPedidos = () => pedidos;

export function usePassageiros() {
  return useSyncExternalStore(inscrever, obterPassageiros, () => passageirosExemplo);
}

export function usePedidos() {
  return useSyncExternalStore(inscrever, obterPedidos, () => pedidosExemplo);
}

export function usePassageirosDoDestino(destinoId: string) {
  const lista = usePassageiros();
  return useMemo(() => lista.filter((p) => p.destinoId === destinoId), [lista, destinoId]);
}

export function usePedidosDoDestino(destinoId: string) {
  const lista = usePedidos();
  return useMemo(() => lista.filter((p) => p.destinoId === destinoId), [lista, destinoId]);
}

export function usePassageiro(id: string) {
  return usePassageiros().find((p) => p.id === id);
}

export function usePedido(id: string | undefined) {
  return usePedidos().find((p) => p.id === id);
}

/** Number shown on the bell: join requests waiting for an answer. */
export function useAvisosVanzeiro() {
  return usePedidos().length;
}

/** Adds or replaces a passenger. When it came from a pedido, the pedido leaves the waiting list. */
export function salvarPassageiro(p: Passageiro, pedidoId?: string) {
  passageiros = passageiros.some((x) => x.id === p.id)
    ? passageiros.map((x) => (x.id === p.id ? p : x))
    : [...passageiros, p];
  if (pedidoId) pedidos = pedidos.filter((x) => x.id !== pedidoId);
  avisar();
}

export function removerPassageiro(id: string) {
  passageiros = passageiros.filter((p) => p.id !== id);
  avisar();
}

export function recusarPedido(id: string) {
  pedidos = pedidos.filter((p) => p.id !== id);
  avisar();
}
