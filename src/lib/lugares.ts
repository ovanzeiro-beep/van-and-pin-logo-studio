import type { Passageiro, RespostaViagem } from "@/data/exemplo";

// Seats in the van (decisions of the owner, 15/11/2026): one van per vanzeiro; when every seat of a trip
// already has a "Vou", nobody else can say "Vou" (the seat belongs to who answered first); no waiting list.
// Without a number of seats ("não informado"), nothing is limited.

/** How many said "Vou" for this destino on this day. */
export function contarVou(passageiros: Pick<Passageiro, "id" | "destinoId">[], destinoId: string, respostas: Record<string, RespostaViagem>) {
  return passageiros.filter((p) => p.destinoId === destinoId && respostas[p.id] === "vai").length;
}

export function vanLotada(lugares: number | null, vao: number) {
  return lugares !== null && vao >= lugares;
}

/** "Vou" is allowed while there is a free seat; someone who already said "Vou" keeps the seat. "Não vou" is always allowed. */
export function podeDizerVou(lugares: number | null, vao: number, respostaAtual: RespostaViagem | undefined) {
  return respostaAtual === "vai" || !vanLotada(lugares, vao);
}

/** Viagem tab: "4 vão" without a number of seats; "4 de 15 lugares" with it. */
export function textoDosLugares(vao: number, lugares: number | null) {
  if (lugares === null) return `${vao} ${vao === 1 ? "vai" : "vão"}`;
  return `${vao} de ${lugares} ${lugares === 1 ? "lugar" : "lugares"}`;
}

/** Color of that count: green with free seats, amber when full, red past the seats. */
export function situacaoDosLugares(vao: number, lugares: number | null): "livre" | "lotada" | "passou" {
  if (lugares === null || vao < lugares) return "livre";
  return vao === lugares ? "lotada" : "passou";
}

/** New passenger: the destino would get more passengers than seats (refused since 16/11/2026, E1). */
export function destinoPassaDosLugares(passageirosNoDestino: number, lugares: number | null) {
  return lugares !== null && passageirosNoDestino > lugares;
}

// E1 (decision of the owner, 16/11/2026): the van's seats also limit who is IN the destino. Whoever enters first with
// the code gets in; with every seat taken nobody else enters (asking, accepted or added by the vanzeiro); whoever
// leaves frees the seat. The database checks the same (supabase/migrations/20261116230000_lugares_no_destino.sql).

export const VAN_CHEIA = "A van está cheia: não tem mais lugar neste destino.";

/** Every seat of the destino is taken. */
export function destinoCheio(ocupados: number, lugares: number | null) {
  return lugares !== null && ocupados >= lugares;
}

/** "3 de 15 lugares ocupados", or "3 passageiros" without a number of seats. */
export function textoDaOcupacao(ocupados: number, lugares: number | null) {
  if (lugares === null) return `${ocupados} ${ocupados === 1 ? "passageiro" : "passageiros"}`;
  return `${ocupados} de ${lugares} ${lugares === 1 ? "lugar ocupado" : "lugares ocupados"}`;
}

/** "15" → 15; blank → null (não informado); anything else invalid. */
export function lerLugares(texto: string): number | null | "invalido" {
  const t = texto.trim();
  if (t === "") return null;
  if (!/^\d+$/.test(t)) return "invalido";
  const n = Number(t);
  return n >= 1 && n <= 60 ? n : "invalido";
}
