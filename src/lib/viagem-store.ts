import { useSyncExternalStore } from "react";
import { DATA_DE_HOJE, vanzeiroExemplo, type Destino } from "@/data/exemplo";
import { registrarEmbarque, registrarFalta } from "@/lib/cobrancas-store";
import { obterRespostasParaTeste, fecharRespostas } from "@/lib/respostas-store";
import { obterPassageiros } from "@/lib/passageiros-store";
import { confirmarPeloCelular, embarcou, iniciarViagem, naoEstava, type ViagemDoDia } from "@/lib/viagem";

// In-memory trips of the day for the visual stage: they last until the page is reloaded,
// and survive switching tabs in the middle of a trip.
type Estado = { escolhida: string; viagens: Record<string, ViagemDoDia> };
const inicial: Estado = { escolhida: vanzeiroExemplo.viagemHoje.destinoId, viagens: {} };
let estado = inicial;
const ouvintes = new Set<() => void>();

function mudar(novo: Estado) {
  estado = novo;
  ouvintes.forEach((o) => o());
}

function inscrever(o: () => void) {
  ouvintes.add(o);
  return () => ouvintes.delete(o);
}

export function useViagensDoDia() {
  return useSyncExternalStore(inscrever, () => estado, () => inicial);
}

/** The trip in progress, if any (only one at a time). */
export function emAndamento(e: Estado) {
  return Object.values(e.viagens).find((v) => v.fase !== "encerrada");
}

export function escolherViagem(destinoId: string) {
  if (emAndamento(estado)) return;
  mudar({ ...estado, escolhida: destinoId });
}

export function comecarViagem(destino: Destino, ordem: string[]) {
  if (emAndamento(estado) || estado.viagens[destino.id]) return;
  fecharRespostas(destino.id, DATA_DE_HOJE);
  const respostas = obterRespostasParaTeste(DATA_DE_HOJE);
  for (const p of obterPassageiros().filter((p) => p.destinoId === destino.id)) {
    if (respostas[p.id] === "nao-vai") registrarFalta(p, DATA_DE_HOJE, true);
  }
  mudar({ escolhida: destino.id, viagens: { ...estado.viagens, [destino.id]: iniciarViagem(destino, ordem, DATA_DE_HOJE) } });
}

/** Applies one step of the trip in progress. */
export function atualizarViagem(passo: (v: ViagemDoDia) => ViagemDoDia) {
  const atual = emAndamento(estado);
  if (!atual) return;
  const nova = passo(atual);
  if (nova !== atual) mudar({ ...estado, viagens: { ...estado.viagens, [atual.destinoId]: nova } });
}

const passageiro = (id: string) => obterPassageiros().find((p) => p.id === id);

/** "Embarcou": a trip made, which the Financeiro counts. */
export function marcarEmbarcou(id: string) {
  const antes = emAndamento(estado);
  atualizarViagem((v) => embarcou(v, id));
  const p = passageiro(id);
  if (p && antes && emAndamento(estado) !== antes) registrarEmbarque(p, antes.data, `${antes.destinoId}_${antes.data}`);
}

/** "Não estava no ponto": a falta, which the Financeiro counts. */
export function marcarNaoEstava(id: string) {
  atualizarViagem((v) => naoEstava(v, id));
}

/** "Estou na van" tapped on the passenger's phone during a check. */
export function confirmarNaVan(id: string) {
  atualizarViagem((v) => confirmarPeloCelular(v, id));
}
