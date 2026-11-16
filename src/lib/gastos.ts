import type { Centavos } from "@/lib/dinheiro";

// Van expenses (T6, section 18 of docs/fonte-da-verdade.md), for "Seu mês na van". Decisions of the owner (16/11):
// a ready list of types ("Outros" lets the vanzeiro write what it was); a wrong one is deleted and written again
// (never edited); an expense belongs to the month, not to a destino; "Sobrou" = Recebido − Gastos.

export type TipoDeGasto = "combustivel" | "manutencao" | "pedagio" | "documentos" | "outros";

export const TIPOS_DE_GASTO: { id: TipoDeGasto; rotulo: string }[] = [
  { id: "combustivel", rotulo: "Combustível" },
  { id: "manutencao", rotulo: "Manutenção" },
  { id: "pedagio", rotulo: "Pedágio" },
  { id: "documentos", rotulo: "Documentos e seguro" },
  { id: "outros", rotulo: "Outros" },
];

export type Gasto = {
  id: string;
  /** The vanzeiro who owns it (each vanzeiro sees only their own). */
  vanzeiroId: string;
  tipo: TipoDeGasto;
  /** Only for "Outros": what it was. */
  descricao: string;
  valor: Centavos;
  /** Day of the expense, "AAAA-MM-DD". */
  data: string;
};

/** "Combustível", or what was written for "Outros". */
export function rotuloDoGasto(g: Pick<Gasto, "tipo" | "descricao">) {
  return g.tipo === "outros" && g.descricao.trim() ? g.descricao.trim() : (TIPOS_DE_GASTO.find((t) => t.id === g.tipo)?.rotulo ?? "Gasto");
}

/** Checks a new expense; the text of the problem, or null when it can be saved. */
export function problemaDoGasto(g: { tipo: TipoDeGasto | null; descricao: string; valor: Centavos | null; data: string }, hoje: string): string | null {
  if (!g.tipo) return "Escolha o tipo do gasto.";
  if (g.tipo === "outros" && !g.descricao.trim()) return "Escreva o que foi o gasto.";
  if (g.valor === null) return "Digite o valor do gasto.";
  if (!g.data) return "Escolha o dia do gasto.";
  if (g.data > hoje) return "O dia do gasto não pode ser depois de hoje.";
  return null;
}

/** Expenses of a month ("AAAA-MM"), newest first. */
export function gastosDoMes(lista: Gasto[], mes: string) {
  return lista.filter((g) => g.data.startsWith(mes)).sort((a, b) => b.data.localeCompare(a.data) || b.id.localeCompare(a.id));
}

export const totalDosGastos = (lista: Pick<Gasto, "valor">[]) => lista.reduce((s, g) => s + g.valor, 0);

/** "Sobrou" of the month: what came in minus the expenses (negative = "Faltou"). */
export const sobrouNoMes = (recebido: Centavos, gastos: Centavos) => recebido - gastos;
