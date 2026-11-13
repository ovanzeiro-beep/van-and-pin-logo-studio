import type { Destino, DiaSemana, Passageiro, RespostaViagem } from "@/data/exemplo";
import { somarDias } from "@/lib/cobrancas";
import { pontosDeEmbarque } from "@/lib/passageiros";

export type SituacaoVan = { situacao: string; detalhe: string; etapa: number };

/** The van's live status ("A caminho" etc.) only applies on the day of the trip. */
export function situacaoDaVan(viagem: { ehHoje: boolean }, van: SituacaoVan): SituacaoVan {
  if (!viagem.ehHoje) {
    return { situacao: "Aguardando o dia da viagem", detalhe: "A van ainda não saiu para a sua viagem", etapa: -1 };
  }
  return { situacao: van.situacao, detalhe: van.detalhe, etapa: van.etapa };
}

// ---------- the vanzeiro's trip of the day ----------


const DIAS: DiaSemana[] = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"];

export function diaDaSemana(iso: string): DiaSemana {
  const [a = 0, m = 1, d = 1] = iso.split("-").map(Number);
  return DIAS[new Date(Date.UTC(a, m - 1, d)).getUTCDay()] ?? "dom";
}

export function aconteceEm(d: Pick<Destino, "ativo" | "tipo" | "dias" | "data">, iso: string) {
  if (!d.ativo) return false;
  return d.tipo === "fixa" ? d.dias.includes(diaDaSemana(iso)) : d.data === iso;
}

/** Active trips on a day, earliest departure first. */
export function viagensDoDia<T extends Destino>(destinos: T[], iso: string): T[] {
  return destinos.filter((d) => aconteceEm(d, iso)).sort((a, b) => a.saida.localeCompare(b.saida));
}

/** First trip after today (looks up to 90 days ahead). */
export function proximaViagem<T extends Destino>(destinos: T[], hoje: string): { data: string; destino: T } | null {
  for (let i = 1; i <= 90; i++) {
    const data = somarDias(hoje, i);
    const [destino] = viagensDoDia(destinos, data);
    if (destino) return { data, destino };
  }
  return null;
}

/** Who goes, in the order the van passes (following the destino's stops), plus who didn't answer and who doesn't go. */
export function listaDaViagem<T extends Passageiro>(
  passageiros: T[],
  destino: Pick<Destino, "id" | "origem" | "destino" | "paradas">,
  respostas: Record<string, RespostaViagem>,
) {
  const pontos = pontosDeEmbarque(destino);
  const posicao = (p: T) => {
    const i = pontos.indexOf(p.cidade);
    return i === -1 ? pontos.length : i;
  };
  const doDestino = passageiros.filter((p) => p.destinoId === destino.id);
  const vao = doDestino.filter((p) => respostas[p.id] === "vai").sort((a, b) => posicao(a) - posicao(b));
  return {
    vao,
    semResposta: doDestino.filter((p) => respostas[p.id] === undefined),
    naoVao: doDestino.filter((p) => respostas[p.id] === "nao-vai"),
  };
}

export type FaseViagem = "busca" | "parada" | "conferencia" | "chegada" | "conferencia-volta" | "volta" | "encerrada";
export type Conferido = "na-van" | "ficou";

export type ViagemDoDia = {
  destinoId: string;
  data: string;
  temVolta: boolean;
  fase: FaseViagem;
  /** Who goes, in pickup order. */
  ordem: string[];
  embarcaram: string[];
  naoEstavam: string[];
  /** Got off on purpose at a stop (or stayed at the destino): out of the next checks. */
  ficaram: string[];
  /** Current check, while it is open. */
  conferencia: Record<string, Conferido>;
  paradasIda: number;
  paradasVolta: number;
  /** Who boarded at the destino for the return. */
  naVolta: string[];
  desceram: string[];
};

export function iniciarViagem(destino: Pick<Destino, "id" | "volta">, ordem: string[], data: string): ViagemDoDia {
  return {
    destinoId: destino.id,
    data,
    temVolta: destino.volta !== null,
    fase: "busca",
    ordem,
    embarcaram: [],
    naoEstavam: [],
    ficaram: [],
    conferencia: {},
    paradasIda: 0,
    paradasVolta: 0,
    naVolta: [],
    desceram: [],
  };
}

const emTrecho = (v: ViagemDoDia) => (v.naVolta.length > 0 || v.fase === "volta" ? "volta" : "ida");

/** Next passenger to pick up, or undefined when everyone was handled. */
export function proximoDaBusca(v: ViagemDoDia) {
  return v.ordem.find((id) => !v.embarcaram.includes(id) && !v.naoEstavam.includes(id));
}

/** Next passenger to drop off on the return: reverse order of the pickup. */
export function proximoDaVolta(v: ViagemDoDia) {
  return [...v.ordem].reverse().find((id) => v.naVolta.includes(id) && !v.desceram.includes(id) && !v.ficaram.includes(id));
}

/** Who is in the van right now. */
export function aBordo(v: ViagemDoDia) {
  if (emTrecho(v) === "volta") return v.ordem.filter((id) => v.naVolta.includes(id) && !v.desceram.includes(id) && !v.ficaram.includes(id));
  return v.ordem.filter((id) => v.embarcaram.includes(id) && !v.ficaram.includes(id));
}

/** Who the current check lists, in pickup order. */
export function listaDaConferencia(v: ViagemDoDia) {
  if (v.fase === "conferencia-volta") return v.ordem.filter((id) => v.embarcaram.includes(id) && !v.ficaram.includes(id));
  return aBordo(v);
}

export function conferenciaCompleta(v: ViagemDoDia) {
  return listaDaConferencia(v).every((id) => v.conferencia[id] !== undefined);
}

export function embarcou(v: ViagemDoDia, id: string): ViagemDoDia {
  if (v.fase !== "busca" || proximoDaBusca(v) !== id) return v;
  return { ...v, embarcaram: [...v.embarcaram, id] };
}

export function naoEstava(v: ViagemDoDia, id: string): ViagemDoDia {
  if (v.fase !== "busca" || proximoDaBusca(v) !== id) return v;
  return { ...v, naoEstavam: [...v.naoEstavam, id] };
}

export function fazerParada(v: ViagemDoDia): ViagemDoDia {
  if (v.fase !== "busca" && v.fase !== "volta") return v;
  return v.fase === "busca"
    ? { ...v, fase: "parada", paradasIda: v.paradasIda + 1 }
    : { ...v, fase: "parada", paradasVolta: v.paradasVolta + 1 };
}

/** Back from a stop: check who is in the van (nobody aboard → straight back on the road). */
export function retomarViagem(v: ViagemDoDia): ViagemDoDia {
  if (v.fase !== "parada") return v;
  if (aBordo(v).length === 0) return { ...v, fase: emTrecho(v) === "volta" ? "volta" : "busca" };
  return { ...v, fase: "conferencia", conferencia: {} };
}

export function conferir(v: ViagemDoDia, id: string, estado: Conferido): ViagemDoDia {
  if (v.fase !== "conferencia" && v.fase !== "conferencia-volta") return v;
  if (!listaDaConferencia(v).includes(id)) return v;
  return { ...v, conferencia: { ...v.conferencia, [id]: estado } };
}

/** Only works when everyone was checked. */
export function seguirViagem(v: ViagemDoDia): ViagemDoDia {
  if ((v.fase !== "conferencia" && v.fase !== "conferencia-volta") || !conferenciaCompleta(v)) return v;
  const lista = listaDaConferencia(v);
  const ficaram = lista.filter((id) => v.conferencia[id] === "ficou");
  if (v.fase === "conferencia-volta") {
    const naVolta = lista.filter((id) => v.conferencia[id] === "na-van");
    return { ...v, ficaram: [...v.ficaram, ...ficaram], naVolta, conferencia: {}, fase: naVolta.length ? "volta" : "encerrada" };
  }
  return { ...v, ficaram: [...v.ficaram, ...ficaram], conferencia: {}, fase: emTrecho(v) === "volta" ? "volta" : "busca" };
}

export function chegarAoDestino(v: ViagemDoDia): ViagemDoDia {
  if (v.fase !== "busca" || proximoDaBusca(v) !== undefined) return v;
  return { ...v, fase: "chegada" };
}

/** The return starts by checking who boarded at the destino (nobody to take back → trip ends). */
export function iniciarVolta(v: ViagemDoDia): ViagemDoDia {
  if (v.fase !== "chegada" || !v.temVolta) return v;
  const lista = v.ordem.filter((id) => v.embarcaram.includes(id) && !v.ficaram.includes(id));
  return lista.length ? { ...v, fase: "conferencia-volta", conferencia: {} } : { ...v, fase: "encerrada" };
}

export function desceu(v: ViagemDoDia, id: string): ViagemDoDia {
  if (v.fase !== "volta" || proximoDaVolta(v) !== id) return v;
  const depois = { ...v, desceram: [...v.desceram, id] };
  return proximoDaVolta(depois) === undefined ? { ...depois, fase: "encerrada" } : depois;
}

export function encerrarViagem(v: ViagemDoDia): ViagemDoDia {
  return v.fase === "chegada" ? { ...v, fase: "encerrada" } : v;
}

/** Opens the address in Google Maps (the app on the phone). */
export function linkDoMapa(p: Pick<Passageiro, "endereco" | "cidade">) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${p.endereco}, ${p.cidade}`)}`;
}
