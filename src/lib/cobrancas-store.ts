import { useMemo, useSyncExternalStore } from "react";
import {
  DATA_DE_HOJE,
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
import { aplicarEmbarque, aplicarFalta, cancelarPendentes, gerarCobrancas, proximaCobranca, somarDias, type Cobranca } from "@/lib/cobrancas";

/** Sample history: charges the app created from each plan since the start of the history. */
function cobrancasDeExemplo(): Cobranca[] {
  const fimDoMes = somarDias(`${DATA_DE_HOJE.slice(0, 7)}-01`, 40).slice(0, 7) + "-01";
  const ate = somarDias(fimDoMes, -1);
  return passageirosExemplo
    .flatMap((p) =>
      gerarCobrancas(p, INICIO_DO_HISTORICO, ate, DATA_DE_HOJE, { embarques: embarquesExemplo, faltas: faltasExemplo }),
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
  return useSyncExternalStore(inscrever, obterCobrancas, () => inicial);
}

export function useCobranca(id: string) {
  return useCobrancas().find((c) => c.id === id);
}

export function useCobrancasDoPassageiro(passageiroId: string) {
  const lista = useCobrancas();
  return useMemo(() => lista.filter((c) => c.passageiroId === passageiroId), [lista, passageiroId]);
}

/** The only change a charge accepts besides cancelling: it becomes paid, with the payment date. */
export function marcarComoPago(id: string, forma: FormaPagamento, data = DATA_DE_HOJE) {
  cobrancas = cobrancas.map((c) =>
    c.id === id && !c.pagamento && !c.cancelamento ? { ...c, pagamento: { data, forma } } : c,
  );
  avisar();
}

/** Leaves the totals but stays in the history. */
export function cancelarCobranca(id: string, motivo: string, data = DATA_DE_HOJE) {
  cobrancas = cobrancas.map((c) =>
    c.id === id && !c.pagamento && !c.cancelamento ? { ...c, cancelamento: { data, motivo: motivo.trim() } } : c,
  );
  avisar();
}

/** A destino was deleted or a passenger left it: their pendentes are cancelled with the reason. */
export function cancelarPendentesDe(passageiroIds: string[], motivo: string, hoje = DATA_DE_HOJE) {
  cobrancas = cancelarPendentes(cobrancas, passageiroIds, motivo, hoje);
  avisar();
}

/** After saving a mensal/quinzenal passenger with nothing coming, the app creates their next charge. */
export function garantirProximaCobranca(p: Passageiro, hoje = DATA_DE_HOJE) {
  const temFutura = cobrancas.some(
    (c) => c.passageiroId === p.id && !c.cancelamento && c.vencimento >= hoje && c.tipo === p.plano,
  );
  if (temFutura) return;
  const proxima = proximaCobranca(p, hoje);
  if (!proxima || cobrancas.some((c) => c.id === proxima.id)) return;
  cobrancas = [...cobrancas, proxima];
  avisar();
}

// Trip results already sent to the money, so a day is never counted twice.
const registrados = new Set<string>();

/** New vanzeiro account: no charges yet. */
export function limparCobrancas() {
  cobrancas = [];
  registrados.clear();
  avisar();
}

/** "Embarcou" on a trip: counts as a trip made (Por viagem and Diário get that day's charge). */
export function registrarEmbarque(p: Passageiro, data = DATA_DE_HOJE, viagemId?: string) {
  const chave = `embarque_${p.id}_${p.plano === "viagem" ? (viagemId ?? data) : data}`;
  if (registrados.has(chave)) return;
  registrados.add(chave);
  cobrancas = aplicarEmbarque(cobrancas, p, data, DATA_DE_HOJE, viagemId);
  avisar();
}

/** Final on-time "Não vou": discounts only the next open charge when the plan allows it. */
export function registrarFalta(p: Passageiro, data = DATA_DE_HOJE, avisouNoPrazo = false) {
  if (!avisouNoPrazo) return;
  const chave = `falta_${p.id}_${data}`;
  if (registrados.has(chave)) return;
  registrados.add(chave);
  cobrancas = aplicarFalta(cobrancas, p, data, DATA_DE_HOJE, true);
  avisar();
}

export function useCobrancasDasMatriculas(ids: string[]) {
  return useCobrancas().filter((c) => ids.includes(c.passageiroId));
}
