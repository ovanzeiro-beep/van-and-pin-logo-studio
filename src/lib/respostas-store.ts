import { useSyncExternalStore } from "react";
import { DATA_DE_HOJE, vanzeiroExemplo, type RespostaViagem } from "@/data/exemplo";

// "Vou" / "Não vou" of each passenger, per trip day. Both panels read this same list,
// so what the passenger answers shows up for the vanzeiro (Início and Viagem).
type Respostas = Record<string, Record<string, RespostaViagem>>;
const inicial: Respostas = { [DATA_DE_HOJE]: { ...vanzeiroExemplo.respostasHoje } };
let respostas = inicial;
const VAZIO: Record<string, RespostaViagem> = {};
const ouvintes = new Set<() => void>();

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
  respostas = { ...respostas, [data]: { ...(respostas[data] ?? {}), [passageiroId]: resposta } };
  ouvintes.forEach((o) => o());
}

export const obterRespostasParaTeste = (data: string) => respostasDoDia(respostas, data);
