import { useSyncExternalStore } from "react";
import { vanzeiroExemplo, type RespostaViagem } from "@/data/exemplo";
import { agora, dataDeHoje } from "@/lib/agora";

import { obterDestinos } from "@/lib/destinos-store";
import { obterPassageiros } from "@/lib/passageiros-store";
import { prazoPassou } from "@/lib/destinos";

// "Vou" / "Não vou" of each passenger, per trip day. Both panels read this same list,
// so what the passenger answers shows up for the vanzeiro (Início and Viagem).
type Respostas = Record<string, Record<string, RespostaViagem>>;
const inicial: Respostas = { [dataDeHoje()]: { ...vanzeiroExemplo.respostasHoje } };
let respostas = inicial;
const VAZIO: Record<string, RespostaViagem> = {};
const ouvintes = new Set<() => void>();
const fechadas = new Set<string>();
export const fecharRespostas = (destinoId: string, data: string) => fechadas.add(`${destinoId}_${data}`);

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
  if (!d || fechadas.has(`${d.id}_${data}`) || prazoPassou(d, data, agora())) return;
  respostas = { ...respostas, [data]: { ...(respostas[data] ?? {}), [passageiroId]: resposta } };
  ouvintes.forEach((o) => o());
}

export const obterRespostasParaTeste = (data: string) => respostasDoDia(respostas, data);

/** New vanzeiro account: no answers yet. */
export function limparRespostas() {
  respostas = {};
  fechadas.clear();
  ouvintes.forEach((o) => o());
}
