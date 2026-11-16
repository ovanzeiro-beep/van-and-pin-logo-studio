import { useSyncExternalStore } from "react";
import { vanzeiroExemplo, type RespostaViagem } from "@/data/exemplo";
import { agora, dataDeHoje } from "@/lib/agora";

import { obterDestinos, useDestinos } from "@/lib/destinos-store";
import { obterPassageiros, usePassageiros } from "@/lib/passageiros-store";
import { prazoPassou } from "@/lib/destinos";
import { contarVou, podeDizerVou } from "@/lib/lugares";
import { obterPerfilDoVanzeiro, usePerfilDoVanzeiro } from "@/lib/vanzeiro-store";
import { avisoDeResposta } from "@/lib/avisos";
import { trocarAviso } from "@/lib/avisos-store";

// "Vou" / "Não vou" of each passenger, per trip day. Both panels read this same list,
// so what the passenger answers shows up for the vanzeiro (Início and Viagem).
type Respostas = Record<string, Record<string, RespostaViagem>>;
const inicial: Respostas = { [dataDeHoje()]: { ...vanzeiroExemplo.respostasHoje } };
let respostas = inicial;
const VAZIO: Record<string, RespostaViagem> = {};
const ouvintes = new Set<() => void>();
/** Trips whose answers were closed early (the vanzeiro started the trip), kept as records. */
export type RespostasFechadas = { destinoId: string; data: string };
let fechadas: RespostasFechadas[] = [];
export const obterRespostasFechadas = () => fechadas;
const estaFechada = (destinoId: string, data: string) => fechadas.some((f) => f.destinoId === destinoId && f.data === data);
export function fecharRespostas(destinoId: string, data: string) {
  if (!estaFechada(destinoId, data)) fechadas = [...fechadas, { destinoId, data }];
}

function inscrever(o: () => void) {
  ouvintes.add(o);
  return () => ouvintes.delete(o);
}

export function useRespostas() {
  return useSyncExternalStore(inscrever, () => respostas, () => inicial);
}

export function useRespostasDoDia(data: string) {
  return useRespostas()[data] ?? VAZIO;
}

export const respostasDoDia = (todas: Respostas, data: string) => todas[data] ?? VAZIO;

/** Saves the answer. The screen only offers it while confirmations are open. */
export function responder(passageiroId: string, data: string, resposta: RespostaViagem) {
  const p = obterPassageiros().find((p) => p.id === passageiroId);
  const d = obterDestinos().find((d) => d.id === p?.destinoId);
  if (!p || !d || estaFechada(d.id, data) || prazoPassou(d, data, agora())) return;
  if (respostas[data]?.[passageiroId] === resposta) return;
  if (resposta === "vai") {
    const doDia = respostas[data] ?? {};
    const vao = contarVou(obterPassageiros(), d.id, doDia);
    if (!podeDizerVou(obterPerfilDoVanzeiro(d.vanzeiroId).van.lugares, vao, doDia[passageiroId])) return;
  }
  respostas = { ...respostas, [data]: { ...(respostas[data] ?? {}), [passageiroId]: resposta } };
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

export const obterRespostasParaTeste = (data: string) => respostasDoDia(respostas, data);

/** New vanzeiro account: no answers yet. */
export function limparRespostas() {
  respostas = {};
  fechadas = [];
  ouvintes.forEach((o) => o());
}
