import { useEffect, useMemo, useSyncExternalStore } from "react";
import type { Destino } from "@/data/exemplo";
import { agora, dataDeHoje, horaDeAgora } from "@/lib/agora";
import { prazoPassou } from "@/lib/destinos";
import { obterDestinos } from "@/lib/destinos-store";
import {
  criarProximasCobrancas,
  obterCobrancas,
  registrarEmbarque,
  registrarFalta,
  type Falta,
} from "@/lib/cobrancas-store";
import { obterMomentoDaResposta, obterRespostasDoDia, fecharRespostas } from "@/lib/respostas-store";
import { avisoDeVanSaiu, avisosDoRelogio } from "@/lib/avisos";
import { criarAvisoUmaVez } from "@/lib/avisos-store";
import { obterPassageiros } from "@/lib/passageiros-store";
import { confirmarPeloCelular, embarcou, iniciarViagem, naoEstava, viagensDoDia, type Agora, type ViagemDoDia } from "@/lib/viagem";
import { useDonoDoPainel } from "@/lib/painel";
import { deuCerto, naoDeu, type Resultado } from "@/lib/acoes";

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
  const todas = useSyncExternalStore(inscrever, () => estado, () => inicial);
  // U3: inside the vanzeiro panel, only that vanzeiro's trips of the day.
  const dono = useDonoDoPainel();
  return useMemo(
    () => (dono === null ? todas : { ...todas, viagens: Object.fromEntries(Object.entries(todas.viagens).filter(([, v]) => v.vanzeiroId === dono)) }),
    [todas, dono],
  );
}

/** W6: the trips of today read from the database replace what is in memory (the chosen tab stays). */
export function carregarViagensDoDia(viagens: Record<string, ViagemDoDia>) {
  mudar({ ...estado, viagens });
}

/** W6: puts a trip back as it was (when the database refused a step). */
export function restaurarViagem(v: ViagemDoDia) {
  mudar({ ...estado, viagens: { ...estado.viagens, [v.destinoId]: v } });
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

export function comecarViagem(
  destino: Destino,
  ordem: string[],
  guardar?: (viagem: ViagemDoDia, faltas: Falta[]) => Resultado,
): Resultado {
  if (emAndamento(estado)) return naoDeu("Já tem uma viagem acontecendo. Termine ela antes de começar outra.");
  if (estado.viagens[destino.id]) return naoDeu("A viagem de hoje deste destino já foi feita.");
  const data = dataDeHoje();
  const viagem = { ...iniciarViagem(destino, ordem, data), comecouEm: horaDeAgora() };
  const respostas = obterRespostasDoDia(data);
  const faltantes = obterPassageiros().filter(
    (p) => p.destinoId === destino.id && respostas[p.id] === "nao-vai",
  );
  if (guardar) {
    const resultado = guardar(
      viagem,
      faltantes.map((p) => ({
        passageiroId: p.id,
        data,
        avisouNoPrazo: true,
        avisouEm: obterMomentoDaResposta(p.id, data)?.em,
      })),
    );
    if (!resultado.ok) return resultado;
  }
  fecharRespostas(destino.id, data);
  if (!guardar) {
    for (const p of faltantes) registrarFalta(p, data, true, obterMomentoDaResposta(p.id, data)?.em);
  }
  mudar({ escolhida: destino.id, viagens: { ...estado.viagens, [destino.id]: viagem } });
  for (const id of ordem) {
    const p = passageiro(id);
    if (p) criarAvisoUmaVez(avisoDeVanSaiu(p, destino, dataDeHoje()));
  }
  return deuCerto;
}

/** Applies one step of the trip in progress. */
export function atualizarViagem(passo: (v: ViagemDoDia) => ViagemDoDia): Resultado {
  const atual = emAndamento(estado);
  if (!atual) return naoDeu("Nenhuma viagem está acontecendo agora.");
  let nova = passo(atual);
  if (nova === atual) return deuCerto;
  if (nova.fase === "encerrada") nova = { ...nova, terminouEm: horaDeAgora() };
  mudar({ ...estado, viagens: { ...estado.viagens, [atual.destinoId]: nova } });
  return deuCerto;
}

const passageiro = (id: string) => obterPassageiros().find((p) => p.id === id);

/** "Embarcou": a trip made, which the Financeiro counts. */
export function marcarEmbarcou(id: string): Resultado {
  const antes = emAndamento(estado);
  const r = atualizarViagem((v) => embarcou(v, id));
  const p = passageiro(id);
  if (p && antes && emAndamento(estado) !== antes) registrarEmbarque(p, antes.data, antes.id);
  return r;
}

/** "Não estava no ponto": a falta, which the Financeiro counts. */
export function marcarNaoEstava(id: string): Resultado {
  return atualizarViagem((v) => naoEstava(v, id));
}

/** "Estou na van" tapped on the passenger's phone during a check. */
export function confirmarNaVan(id: string): Resultado {
  return atualizarViagem((v) => confirmarPeloCelular(v, id));
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
