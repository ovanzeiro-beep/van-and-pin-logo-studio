import { useMemo, useSyncExternalStore } from "react";
import { gastosExemplo } from "@/data/exemplo";
import type { Gasto, TipoDeGasto } from "@/lib/gastos";
import { idDoVanzeiro, useSessao } from "@/lib/sessao";
import { novoId } from "@/lib/ids";

// The vanzeiro's expenses, in memory (no database): reloading brings the samples back.
const inicial: Gasto[] = [...gastosExemplo];
let gastos = inicial;
const ouvintes = new Set<() => void>();
const inscrever = (o: () => void) => {
  ouvintes.add(o);
  return () => {
    ouvintes.delete(o);
  };
};
const mudar = (novos: Gasto[]) => {
  gastos = novos;
  ouvintes.forEach((o) => o());
};

/** Only the logged-in vanzeiro's expenses. */
export function useGastos() {
  const todos = useSyncExternalStore(inscrever, () => gastos, () => inicial);
  const vanzeiroId = useSessao().vanzeiroId;
  return useMemo(() => todos.filter((g) => g.vanzeiroId === vanzeiroId), [todos, vanzeiroId]);
}

export const obterGastos = () => gastos.filter((g) => g.vanzeiroId === idDoVanzeiro());

export function anotarGasto(g: { tipo: TipoDeGasto; descricao: string; valor: number; data: string }) {
  mudar([...gastos, { id: novoId("gasto"), vanzeiroId: idDoVanzeiro(), tipo: g.tipo, descricao: g.tipo === "outros" ? g.descricao.trim() : "", valor: g.valor, data: g.data }]);
}

export function apagarGasto(id: string) {
  mudar(gastos.filter((g) => !(g.id === id && g.vanzeiroId === idDoVanzeiro())));
}

/** New vanzeiro account: no expenses. */
export function limparGastos() {
  mudar([]);
}
