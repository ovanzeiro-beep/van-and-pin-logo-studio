import { useEffect, useSyncExternalStore } from "react";
import type { Destino } from "@/data/exemplo";
import { agora, dataDeHoje, horaDeAgora } from "@/lib/agora";
import { prazoPassou } from "@/lib/destinos";
import { obterDestinos } from "@/lib/destinos-store";
import { criarProximasCobrancas, obterCobrancas, registrarEmbarque, registrarFalta } from "@/lib/cobrancas-store";
import { obterMomentoDaResposta, obterRespostasDoDia, fecharRespostas } from "@/lib/respostas-store";
import { avisoDeVanSaiu, avisosDoRelogio } from "@/lib/avisos";
import { criarAvisoUmaVez } from "@/lib/avisos-store";
import { obterPassageiros } from "@/lib/passageiros-store";
import { confirmarPeloCelular, embarcou, iniciarViagem, naoEstava, viagensDoDia, type Agora, type ViagemDoDia } from "@/lib/viagem";

// In-memory trips of the day for the visual stage: they last until the page is reloaded,
// and survive switching tabs in the middle of a trip.
type Estado = { escolhida: string; viagens: Record<string, ViagemDoDia> };
/** No choice yet: Início and Viagem both show the next trip of the day. */
const inicial: Estado = { escolhida: "", viagens: {} };
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

/** New vanzeiro account: no trips. */
export function limparViagens() {
  mudar({ escolhida: "", viagens: {} });
}

export const obterViagensDoDia = () => estado;

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
  fecharRespostas(destino.id, dataDeHoje());
  const respostas = obterRespostasDoDia(dataDeHoje());
  for (const p of obterPassageiros().filter((p) => p.destinoId === destino.id)) {
    if (respostas[p.id] === "nao-vai") registrarFalta(p, dataDeHoje(), true, obterMomentoDaResposta(p.id, dataDeHoje())?.em);
  }
  mudar({ escolhida: destino.id, viagens: { ...estado.viagens, [destino.id]: { ...iniciarViagem(destino, ordem, dataDeHoje()), comecouEm: horaDeAgora() } } });
  for (const id of ordem) {
    const p = passageiro(id);
    if (p) criarAvisoUmaVez(avisoDeVanSaiu(p, destino, dataDeHoje()));
  }
}

/** Applies one step of the trip in progress. */
export function atualizarViagem(passo: (v: ViagemDoDia) => ViagemDoDia) {
  const atual = emAndamento(estado);
  if (!atual) return;
  let nova = passo(atual);
  if (nova === atual) return;
  if (nova.fase === "encerrada") nova = { ...nova, terminouEm: horaDeAgora() };
  mudar({ ...estado, viagens: { ...estado.viagens, [atual.destinoId]: nova } });
}

const passageiro = (id: string) => obterPassageiros().find((p) => p.id === id);

/** "Embarcou": a trip made, which the Financeiro counts. */
export function marcarEmbarcou(id: string) {
  const antes = emAndamento(estado);
  atualizarViagem((v) => embarcou(v, id));
  const p = passageiro(id);
  if (p && antes && emAndamento(estado) !== antes) registrarEmbarque(p, antes.data, antes.id);
}

/** "Não estava no ponto": a falta, which the Financeiro counts. */
export function marcarNaoEstava(id: string) {
  atualizarViagem((v) => naoEstava(v, id));
}

/** "Estou na van" tapped on the passenger's phone during a check. */
export function confirmarNaVan(id: string) {
  atualizarViagem((v) => confirmarPeloCelular(v, id));
}

/** When a trip's deadline passes, an on-time "Não vou" counts as a falta, even if the trip is never started in the app. */
export function registrarFaltasDoPrazo(momento: Agora = agora()) {
  const respostas = obterRespostasDoDia(momento.data);
  for (const d of viagensDoDia(obterDestinos(), momento.data)) {
    if (!prazoPassou(d, momento.data, momento)) continue;
    for (const p of obterPassageiros().filter((x) => x.destinoId === d.id)) {
      if (respostas[p.id] === "nao-vai") registrarFalta(p, momento.data, true, obterMomentoDaResposta(p.id, momento.data)?.em);
    }
  }
}

/** What depends on the clock: faltas when a deadline passes, and the next charge when one falls due. */
export function passarDoTempo() {
  registrarFaltasDoPrazo();
  criarProximasCobrancas(obterPassageiros());
  for (const aviso of avisosDoRelogio(agora(), obterDestinos(), obterPassageiros(), obterCobrancas(), obterRespostasDoDia)) criarAvisoUmaVez(aviso);
}

/** Watches the clock while the app is open: on opening and then every minute. */
export function useRelogioDoApp() {
  useEffect(() => {
    passarDoTempo();
    const t = setInterval(passarDoTempo, 60_000);
    return () => clearInterval(t);
  }, []);
}
