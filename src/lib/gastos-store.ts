import { useMemo, useSyncExternalStore } from "react";
import { gastosExemplo } from "@/data/exemplo";
import { problemaDoGasto, type Gasto, type TipoDeGasto } from "@/lib/gastos";
import { dataDeHoje } from "@/lib/agora";
import { idDoVanzeiro, useSessao } from "@/lib/sessao";
import { novoId } from "@/lib/ids";
import { deuCerto, naoDeu, type Resultado } from "@/lib/acoes";
import { frase } from "@/lib/formatos";

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

export function anotarGasto(g: { tipo: TipoDeGasto; descricao: string; valor: number; data: string }): Resultado {
  const problema = problemaDoGasto(g, dataDeHoje());
  if (problema) return naoDeu(problema);
  mudar([...gastos, { id: novoId("gasto"), vanzeiroId: idDoVanzeiro(), tipo: g.tipo, descricao: g.tipo === "outros" ? frase(g.descricao) : "", valor: g.valor, data: g.data }]);
  return deuCerto;
}

export function apagarGasto(id: string): Resultado {
  if (!gastos.some((g) => g.id === id && g.vanzeiroId === idDoVanzeiro())) return naoDeu("Este gasto já tinha sido apagado.");
  mudar(gastos.filter((g) => !(g.id === id && g.vanzeiroId === idDoVanzeiro())));
  return deuCerto;
}

/** New vanzeiro account: no expenses. */
export function limparGastos() {
  mudar([]);
}
