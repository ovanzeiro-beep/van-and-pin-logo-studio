import { useMemo, useSyncExternalStore } from "react";
import { passageirosExemplo, pedidosExemplo, type Passageiro, type PedidoEntrada } from "@/data/exemplo";
import { atualizarMeusDados, identidadePassageiro, type MeusDados } from "@/lib/passageiros";
import { garantirProximaCobranca } from "@/lib/cobrancas-store";

// In-memory lists for the visual stage: changes last until the page is reloaded.
let passageiros = passageirosExemplo;
let pedidos = pedidosExemplo;
/** Accepted pedido → the passenger created from it, so the person who asked finds their van. */
let aceitos: Record<string, string> = {};
const SEM_ACEITOS: Record<string, string> = {};
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

export function useAceitos() {
  return useSyncExternalStore(inscrever, () => aceitos, () => SEM_ACEITOS);
}

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
  const existente = passageiros.find((x) => x.destinoId === p.destinoId && identidadePassageiro(x) === identidadePassageiro(p));
  if (existente && existente.id !== p.id) return;
  passageiros = passageiros.some((x) => x.id === p.id)
    ? passageiros.map((x) => (x.id === p.id ? p : x))
    : [...passageiros, p];
  if (pedidoId) {
    pedidos = pedidos.filter((x) => x.id !== pedidoId);
    aceitos = { ...aceitos, [pedidoId]: p.id };
  }
  avisar();
  garantirProximaCobranca(p);
}

/** The passenger's own "Editar" on their Perfil (all destinos of the same person). */
export function salvarDadosDoPassageiro(euId: string, dados: MeusDados) {
  const eu = passageiros.find((p) => p.id === euId);
  if (!eu) return;
  passageiros = atualizarMeusDados(passageiros, eu, dados);
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

/** New vanzeiro account: no passengers, no pedidos. */
export function limparPassageiros() {
  passageiros = [];
  pedidos = [];
  aceitos = {};
  avisar();
}

/** A person used an invite code: the request waits on the vanzeiro's bell. */
export function adicionarPedido(pedido: Omit<PedidoEntrada, "id">) {
  const novo = { ...pedido, id: `pedido-${Date.now()}` };
  pedidos = [...pedidos, novo];
  avisar();
  return novo.id;
}
