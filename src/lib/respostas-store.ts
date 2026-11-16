import { useMemo, useSyncExternalStore } from "react";
import { vanzeiroExemplo, type RespostaViagem } from "@/data/exemplo";
import { agora, dataDeHoje } from "@/lib/agora";

import { obterDestinos, useDestinos } from "@/lib/destinos-store";
import { obterPassageiros, usePassageiros } from "@/lib/passageiros-store";
import { prazoDaViagem, prazoPassou } from "@/lib/destinos";
import { contarVou, podeDizerVou } from "@/lib/lugares";
import { obterPerfilDoVanzeiro, usePerfilDoVanzeiro } from "@/lib/vanzeiro-store";
import { avisoDePeriodoDeNaoVou, avisoDeResposta } from "@/lib/avisos";
import { trocarAviso } from "@/lib/avisos-store";
import { respostaFixa, respostasComFixas, SEM_RESPOSTAS_FIXAS, textoDoPrazoIso, type RespostasFixas } from "@/lib/respostas-fixas";

// "Vou" / "Não vou" of each passenger, per trip day. Both panels read this same list,
// so what the passenger answers shows up for the vanzeiro (Início and Viagem).
type Respostas = Record<string, Record<string, RespostaViagem>>;
const inicial: Respostas = { [dataDeHoje()]: { ...vanzeiroExemplo.respostasHoje } };
let respostas = inicial;
const VAZIO: Record<string, RespostaViagem> = {};
const ouvintes = new Set<() => void>();
/**
 * When each answer was given (the last one counts) and what the deadline was, both "AAAA-MM-DD HH:MM" in Brasília.
 * This is the proof that someone warned "Não vou" in time, which is what gives the falta discount.
 */
export type MomentoDaResposta = { em: string; prazo: string };
let momentos: Record<string, Record<string, MomentoDaResposta>> = {};
export function obterMomentoDaResposta(passageiroId: string, data: string): MomentoDaResposta | undefined {
  const dada = momentos[data]?.[passageiroId];
  if (dada) return dada;
  // T3: an answer left set ("Vou sempre" / "Não vou de… até…") counts from when it was set.
  const d = obterDestinos().find((x) => x.id === obterPassageiros().find((p) => p.id === passageiroId)?.destinoId);
  if (!d || obterRespostasDoDia(data)[passageiroId] === undefined) return undefined;
  const prazo = textoDoPrazoIso(d, data);
  const fixa = respostaFixa(fixas, passageiroId, data, prazo);
  return fixa ? { em: fixa.em, prazo } : undefined;
}

/** Trips whose answers were closed early (the vanzeiro started the trip), kept as records. */
export type RespostasFechadas = { destinoId: string; data: string };
let fechadas: RespostasFechadas[] = [];
export const obterRespostasFechadas = () => fechadas;
const estaFechada = (destinoId: string, data: string) => fechadas.some((f) => f.destinoId === destinoId && f.data === data);
export function fecharRespostas(destinoId: string, data: string) {
  if (estaFechada(destinoId, data)) return;
  // T3: the answers left set become the answers of this trip, so changing them later doesn't change it.
  const efetivas = obterRespostasDoDia(data);
  const doDestino = obterPassageiros().filter((p) => p.destinoId === destinoId && efetivas[p.id] !== undefined && respostas[data]?.[p.id] === undefined);
  if (doDestino.length > 0) {
    const novosMomentos = Object.fromEntries(doDestino.flatMap((p) => { const m = obterMomentoDaResposta(p.id, data); return m ? [[p.id, m]] : []; }));
    respostas = { ...respostas, [data]: { ...(respostas[data] ?? {}), ...Object.fromEntries(doDestino.map((p) => [p.id, efetivas[p.id]!])) } };
    momentos = { ...momentos, [data]: { ...(momentos[data] ?? {}), ...novosMomentos } };
  }
  fechadas = [...fechadas, { destinoId, data }];
  ouvintes.forEach((o) => o());
}

function inscrever(o: () => void) {
  ouvintes.add(o);
  return () => ouvintes.delete(o);
}

export function useRespostas() {
  return useSyncExternalStore(inscrever, () => respostas, () => inicial);
}

/** T3: the answers left set ("Vou sempre", "Não vou de… até…"). */
let fixas: RespostasFixas = SEM_RESPOSTAS_FIXAS;
export const obterRespostasFixas = () => fixas;
export function useRespostasFixas() {
  return useSyncExternalStore(inscrever, () => fixas, () => SEM_RESPOSTAS_FIXAS);
}

/** The answers of a day as both panels see them: answered on the day, plus the ones left set. */
function efetivas(todas: Respostas, fixasAgora: RespostasFixas, passageiros: ReturnType<typeof obterPassageiros>, destinos: ReturnType<typeof obterDestinos>, data: string) {
  return respostasComFixas(todas[data] ?? VAZIO, data, {
    passageiros,
    destinos,
    fixas: fixasAgora,
    fechada: (destinoId) => estaFechada(destinoId, data),
    lugares: (d) => obterPerfilDoVanzeiro(d.vanzeiroId).van.lugares,
  });
}

/** Reads the answers of any day (screens that show several days). */
export function useLeitorDeRespostas() {
  const todas = useRespostas();
  const f = useRespostasFixas();
  const passageiros = usePassageiros();
  const destinos = useDestinos();
  return useMemo(() => {
    const cache = new Map<string, Record<string, RespostaViagem>>();
    return (data: string) => {
      if (!cache.has(data)) cache.set(data, efetivas(todas, f, passageiros, destinos, data));
      return cache.get(data)!;
    };
  }, [todas, f, passageiros, destinos]);
}

export function useRespostasDoDia(data: string) {
  return useLeitorDeRespostas()(data);
}

/** Saves the answer. The screen only offers it while confirmations are open. */
export function responder(passageiroId: string, data: string, resposta: RespostaViagem) {
  const p = obterPassageiros().find((p) => p.id === passageiroId);
  const d = obterDestinos().find((d) => d.id === p?.destinoId);
  if (!p || !d || estaFechada(d.id, data) || prazoPassou(d, data, agora())) return;
  const doDia = obterRespostasDoDia(data);
  if (doDia[passageiroId] === resposta && respostas[data]?.[passageiroId] !== undefined) return;
  if (resposta === "vai") {
    const vao = contarVou(obterPassageiros(), d.id, doDia);
    if (!podeDizerVou(obterPerfilDoVanzeiro(d.vanzeiroId).van.lugares, vao, doDia[passageiroId])) return;
  }
  respostas = { ...respostas, [data]: { ...(respostas[data] ?? {}), [passageiroId]: resposta } };
  const agoraMesmo = agora();
  const prazo = prazoDaViagem(d, data);
  momentos = { ...momentos, [data]: { ...(momentos[data] ?? {}), [passageiroId]: { em: `${agoraMesmo.data} ${agoraMesmo.hora}`, prazo: `${prazo.data} ${prazo.hora}` } } };
  ouvintes.forEach((o) => o());
  trocarAviso(avisoDeResposta(p, d, data, resposta, dataDeHoje()));
}

/** Passenger screens: "Van lotada" instead of "Vou" when every seat of this trip is taken. */
export function useVanLotadaPara(passageiroId: string, destinoId: string, data: string) {
  const doDia = useRespostasDoDia(data);
  const vanzeiroId = useDestinos().find((d) => d.id === destinoId)?.vanzeiroId ?? "";
  const lugares = usePerfilDoVanzeiro(vanzeiroId).van.lugares;
  const vao = contarVou(usePassageiros(), destinoId, doDia);
  return !podeDizerVou(lugares, vao, doDia[passageiroId]);
}

/** The answers of a day (with the ones left set), outside the screens. */
export const obterRespostasDoDia = (data: string) => efetivas(respostas, fixas, obterPassageiros(), obterDestinos(), data);

const momentoDeAgora = () => {
  const a = agora();
  return `${a.data} ${a.hora}`;
};
const mudarFixas = (novas: RespostasFixas) => {
  fixas = novas;
  ouvintes.forEach((o) => o());
};

/** "Vou sempre" on or off, for one destino (one membership). */
export function ligarVouSempre(passageiroId: string, ligar: boolean) {
  const ligado = fixas.vouSempre.some((v) => v.passageiroId === passageiroId && v.ate === null);
  if (ligar === ligado) return;
  const em = momentoDeAgora();
  mudarFixas({
    ...fixas,
    vouSempre: ligar
      ? [...fixas.vouSempre, { passageiroId, desde: em, ate: null }]
      : fixas.vouSempre.map((v) => (v.passageiroId === passageiroId && v.ate === null ? { ...v, ate: em } : v)),
  });
}

/** T7: the vanzeiro gets a notice in the bell when a period is marked or taken off. */
function avisarPeriodo(periodo: { id: string; passageiroId: string; de: string; ate: string }, acao: "marcou" | "tirou") {
  const p = obterPassageiros().find((x) => x.id === periodo.passageiroId);
  const d = obterDestinos().find((x) => x.id === p?.destinoId);
  if (p && d) trocarAviso(avisoDePeriodoDeNaoVou(p, d, periodo, acao, dataDeHoje()));
}

export function marcarNaoVouNoPeriodo(passageiroId: string, de: string, ate: string) {
  const novo = { id: `nv-${fixas.naoVou.length + 1}-${passageiroId}`, passageiroId, de, ate, em: momentoDeAgora(), tiradoEm: null };
  mudarFixas({ ...fixas, naoVou: [...fixas.naoVou, novo] });
  avisarPeriodo(novo, "marcou");
}

/** Takes a period off; days whose deadline already passed keep their "Não vou". */
export function tirarNaoVouDoPeriodo(id: string) {
  const periodo = fixas.naoVou.find((n) => n.id === id && n.tiradoEm === null);
  if (!periodo) return;
  mudarFixas({ ...fixas, naoVou: fixas.naoVou.map((n) => (n === periodo ? { ...n, tiradoEm: momentoDeAgora() } : n)) });
  avisarPeriodo(periodo, "tirou");
}

export const vouSempreLigado = (f: RespostasFixas, passageiroId: string) => f.vouSempre.some((v) => v.passageiroId === passageiroId && v.ate === null);
/** Periods still marked that are not over yet. */
export const periodosDeNaoVou = (f: RespostasFixas, passageiroId: string, hoje: string) =>
  f.naoVou.filter((n) => n.passageiroId === passageiroId && n.tiradoEm === null && n.ate >= hoje).sort((a, b) => a.de.localeCompare(b.de));

/** New vanzeiro account: no answers yet. */
export function limparRespostas() {
  respostas = {};
  momentos = {};
  fechadas = [];
  fixas = SEM_RESPOSTAS_FIXAS;
  ouvintes.forEach((o) => o());
}
