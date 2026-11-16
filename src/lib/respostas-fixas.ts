import type { Destino, Passageiro, RespostaViagem } from "@/data/exemplo";
import { prazoDaViagem } from "@/lib/destinos";
import { aconteceEm } from "@/lib/viagem";

// T3 (section 18 of docs/fonte-da-verdade.md): answers the passenger leaves set, one destino at a time.
// - "Vou sempre": every trip day already counts as "Vou". On a day they won't go, they still tap "Não vou" until the deadline.
// - "Não vou de… até…": every trip day in the period counts as "Não vou", warned in time, so it gives the falta discount.
// What the person answers on the day always wins. A choice only counts for a day if it was made before that day's
// deadline, and turning it off later does not change days whose deadline already passed (times "AAAA-MM-DD HH:MM", Brasília).

export type VouSempre = { passageiroId: string; desde: string; ate: string | null };
export type NaoVouPeriodo = { id: string; passageiroId: string; de: string; ate: string; em: string; tiradoEm: string | null };
export type RespostasFixas = { vouSempre: VouSempre[]; naoVou: NaoVouPeriodo[] };
export const SEM_RESPOSTAS_FIXAS: RespostasFixas = { vouSempre: [], naoVou: [] };

const valiaNoPrazo = (inicio: string, fim: string | null, prazo: string) => inicio <= prazo && (fim === null || fim > prazo);

/** The answer left set for this passenger on this day, and since when; undefined when there is none. */
export function respostaFixa(
  fixas: RespostasFixas,
  passageiroId: string,
  data: string,
  prazo: string,
): { resposta: RespostaViagem; em: string } | undefined {
  const periodo = fixas.naoVou.find((n) => n.passageiroId === passageiroId && n.de <= data && data <= n.ate && valiaNoPrazo(n.em, n.tiradoEm, prazo));
  if (periodo) return { resposta: "nao-vai", em: periodo.em };
  const sempre = fixas.vouSempre.find((v) => v.passageiroId === passageiroId && valiaNoPrazo(v.desde, v.ate, prazo));
  return sempre ? { resposta: "vai", em: sempre.desde } : undefined;
}

export const textoDoPrazoIso = (d: Pick<Destino, "saida" | "prazo">, data: string) => {
  const p = prazoDaViagem(d, data);
  return `${p.data} ${p.hora}`;
};

/**
 * The answers of the day as everyone sees them: what was answered on the day, plus the answers left set.
 * An automatic "Vou" only takes a seat that is still free (a full van stops it, and whoever turned "Vou sempre"
 * on first keeps the seat); the others stay "sem resposta" and get the usual reminder.
 */
export function respostasComFixas(
  doDia: Record<string, RespostaViagem>,
  data: string,
  a: {
    passageiros: Pick<Passageiro, "id" | "destinoId">[];
    destinos: Destino[];
    fixas: RespostasFixas;
    /** Trips already started (answers closed): they keep what they had. */
    fechada: (destinoId: string) => boolean;
    lugares: (d: Destino) => number | null;
  },
): Record<string, RespostaViagem> {
  if (a.fixas.vouSempre.length === 0 && a.fixas.naoVou.length === 0) return doDia;
  let resultado = doDia;
  for (const d of a.destinos) {
    if (!aconteceEm(d, data) || a.fechada(d.id)) continue;
    const prazo = textoDoPrazoIso(d, data);
    const doDestino = a.passageiros.filter((p) => p.destinoId === d.id && resultado[p.id] === undefined);
    const automaticas = doDestino
      .map((p) => ({ id: p.id, fixa: respostaFixa(a.fixas, p.id, data, prazo) }))
      .filter((x): x is { id: string; fixa: { resposta: RespostaViagem; em: string } } => x.fixa !== undefined)
      .sort((x, y) => x.fixa.em.localeCompare(y.fixa.em));
    if (automaticas.length === 0) continue;
    const lugares = a.lugares(d);
    let vao = a.passageiros.filter((p) => p.destinoId === d.id && resultado[p.id] === "vai").length;
    const novas: Record<string, RespostaViagem> = {};
    for (const x of automaticas) {
      if (x.fixa.resposta === "vai") {
        if (lugares !== null && vao >= lugares) continue;
        vao++;
      }
      novas[x.id] = x.fixa.resposta;
    }
    resultado = { ...resultado, ...novas };
  }
  return resultado;
}

/** Checks a "Não vou de… até…" period; the text of the problem, or null when it is fine. */
export function problemaDoPeriodo(de: string, ate: string, hoje: string): string | null {
  if (!de || !ate) return "Escolha o primeiro e o último dia.";
  if (de < hoje) return "O primeiro dia não pode ser antes de hoje.";
  if (ate < de) return "O último dia não pode ser antes do primeiro.";
  return null;
}
