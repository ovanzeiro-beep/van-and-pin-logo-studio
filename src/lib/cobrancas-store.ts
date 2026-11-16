import { useMemo, useSyncExternalStore } from "react";
import {
  INICIO_DO_HISTORICO,
  PAGAS_ATE_EXEMPLO,
  cancelamentosExemplo,
  embarquesExemplo,
  faltasExemplo,
  pagamentosExemplo,
  passageirosExemplo,
  type FormaPagamento,
  type Passageiro,
} from "@/data/exemplo";
import { dataDeHoje } from "@/lib/agora";
import { aplicarEmbarque, aplicarFalta, cancelarPendentes, gerarCobrancas, proximaCobranca, type Cobranca } from "@/lib/cobrancas";
import { somarDias } from "@/lib/datas";
import { useSoDoMeuPainel } from "@/lib/painel";

/** Sample history: charges the app created from each plan since the start of the history. */
function cobrancasDeExemplo(): Cobranca[] {
  const fimDoMes = somarDias(`${dataDeHoje().slice(0, 7)}-01`, 40).slice(0, 7) + "-01";
  const ate = somarDias(fimDoMes, -1);
  return passageirosExemplo
    .flatMap((p) =>
      gerarCobrancas(p, INICIO_DO_HISTORICO, ate, dataDeHoje(), { embarques: embarquesExemplo, faltas: faltasExemplo }),
    )
    .map((c) => {
      const pago = pagamentosExemplo[c.id];
      const cancelado = cancelamentosExemplo[c.id];
      if (cancelado) return { ...c, cancelamento: cancelado };
      if (pago) return { ...c, pagamento: pago };
      if (c.vencimento <= PAGAS_ATE_EXEMPLO) return { ...c, pagamento: { data: c.vencimento, forma: "pix" as const } };
      return c;
    });
}

// In-memory list for the visual stage: changes last until the page is reloaded.
const inicial = cobrancasDeExemplo();
let cobrancas = inicial;
const ouvintes = new Set<() => void>();

function avisar() {
  ouvintes.forEach((o) => o());
}

function inscrever(o: () => void) {
  ouvintes.add(o);
  return () => ouvintes.delete(o);
}

export const obterCobrancas = () => cobrancas;

export function useCobrancas() {
  return useSoDoMeuPainel(useSyncExternalStore(inscrever, obterCobrancas, () => inicial));
}

export function useCobranca(id: string) {
  return useCobrancas().find((c) => c.id === id);
}

export function useCobrancasDoPassageiro(passageiroId: string) {
  const lista = useCobrancas();
  return useMemo(() => lista.filter((c) => c.passageiroId === passageiroId), [lista, passageiroId]);
}

/** The only change a charge accepts besides cancelling: it becomes paid, with the payment date. */
export function marcarComoPago(id: string, forma: FormaPagamento, data = dataDeHoje()) {
  cobrancas = cobrancas.map((c) =>
    c.id === id && !c.pagamento && !c.cancelamento ? { ...c, pagamento: { data, forma } } : c,
  );
  avisar();
}

/** Leaves the totals but stays in the history. */
export function cancelarCobranca(id: string, motivo: string, data = dataDeHoje()) {
  cobrancas = cobrancas.map((c) =>
    c.id === id && !c.pagamento && !c.cancelamento ? { ...c, cancelamento: { data, motivo: motivo.trim() } } : c,
  );
  avisar();
}

/** A destino was deleted or a passenger left it: their pendentes are cancelled with the reason. */
export function cancelarPendentesDe(passageiroIds: string[], motivo: string, hoje = dataDeHoje()) {
  cobrancas = cancelarPendentes(cobrancas, passageiroIds, motivo, hoje);
  avisar();
}

/** After saving a mensal/quinzenal passenger with nothing coming, the app creates their next charge. */
export function garantirProximaCobranca(p: Passageiro, hoje = dataDeHoje()) {
  const temFutura = cobrancas.some(
    (c) => c.passageiroId === p.id && !c.cancelamento && c.vencimento >= hoje && c.tipo === p.plano,
  );
  if (temFutura) return;
  const proxima = proximaCobranca(p, hoje);
  if (!proxima || cobrancas.some((c) => c.id === proxima.id)) return;
  cobrancas = [...cobrancas, proxima];
  avisar();
}

/** Decision 9: when a mensal/quinzenal charge falls due, the next one is created (one ahead of today, never two). */
export function criarProximasCobrancas(passageiros: Passageiro[], hoje = dataDeHoje()) {
  let mudou = false;
  for (const p of passageiros) {
    if (p.plano !== "mensal" && p.plano !== "quinzenal") continue;
    if (cobrancas.some((c) => c.passageiroId === p.id && !c.cancelamento && c.tipo === p.plano && c.vencimento > hoje)) continue;
    const [proxima] = gerarCobrancas(p, somarDias(hoje, 1), somarDias(hoje, 45), hoje, { embarques: [], faltas: [] });
    if (!proxima || cobrancas.some((c) => c.id === proxima.id)) continue;
    cobrancas = [...cobrancas, proxima];
    mudou = true;
  }
  if (mudou) avisar();
}

// What happened on each trip, kept as records (as the database will keep them): who boarded and who
// warned "Não vou" in time. The passenger's history reads them, and they keep a day from being counted twice.
export type Embarque = { passageiroId: string; data: string; viagemId?: string | undefined };
/** avisouEm: when the person said "Não vou" ("AAAA-MM-DD HH:MM", Brasília), when the app knows it. */
export type Falta = { passageiroId: string; data: string; avisouNoPrazo: boolean; avisouEm?: string | undefined };
type Registro = { embarques: Embarque[]; faltas: Falta[] };
const registroInicial: Registro = { embarques: [...embarquesExemplo], faltas: [...faltasExemplo] };
let registro = registroInicial;

export const obterRegistroDasViagens = () => registro;

export function useRegistroDasViagens() {
  return useSyncExternalStore(inscrever, obterRegistroDasViagens, () => registroInicial);
}

/** New vanzeiro account: no charges yet. */
export function limparCobrancas() {
  cobrancas = [];
  registro = { embarques: [], faltas: [] };
  avisar();
}

/** "Embarcou" on a trip: counts as a trip made (Por viagem and Diário get that day's charge). */
export function registrarEmbarque(p: Passageiro, data = dataDeHoje(), viagemId?: string) {
  const mesmo = (e: Embarque) =>
    e.passageiroId === p.id && (p.plano === "viagem" ? (e.viagemId ?? e.data) === (viagemId ?? data) : e.data === data);
  if (registro.embarques.some(mesmo)) return;
  registro = { ...registro, embarques: [...registro.embarques, { passageiroId: p.id, data, viagemId }] };
  cobrancas = aplicarEmbarque(cobrancas, p, data, dataDeHoje(), viagemId);
  avisar();
}

/** Final on-time "Não vou": discounts only the next open charge when the plan allows it. */
export function registrarFalta(p: Passageiro, data = dataDeHoje(), avisouNoPrazo = false, avisouEm?: string) {
  if (!avisouNoPrazo) return;
  if (registro.faltas.some((f) => f.passageiroId === p.id && f.data === data)) return;
  registro = { ...registro, faltas: [...registro.faltas, { passageiroId: p.id, data, avisouNoPrazo: true, ...(avisouEm ? { avisouEm } : {}) }] };
  cobrancas = aplicarFalta(cobrancas, p, data, dataDeHoje(), true);
  avisar();
}

export function useCobrancasDasMatriculas(ids: string[]) {
  return useCobrancas().filter((c) => ids.includes(c.passageiroId));
}
