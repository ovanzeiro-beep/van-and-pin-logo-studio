import { useSyncExternalStore } from "react";

// Correção 5 (decisão A): when the vanzeiro left the app, the passenger can INFORM a settlement made outside the app.
// It is the passenger's statement (date), never a payment: the charge itself does not change.
let acertos: Record<string, string> = {};
const ouvintes = new Set<() => void>();
const avisar = () => ouvintes.forEach((o) => o());
const inscrever = (o: () => void) => {
  ouvintes.add(o);
  return () => {
    ouvintes.delete(o);
  };
};

/** charge id → day the passenger informed the settlement (YYYY-MM-DD). */
export const obterAcertos = () => acertos;
export function carregarAcertos(lista: Record<string, string>) {
  acertos = lista;
  avisar();
}
export function registrarAcerto(cobrancaId: string, dia: string) {
  if (acertos[cobrancaId]) return;
  acertos = { ...acertos, [cobrancaId]: dia };
  avisar();
}
export function useAcertoInformado(cobrancaId: string) {
  return useSyncExternalStore(inscrever, () => acertos[cobrancaId], () => undefined);
}
