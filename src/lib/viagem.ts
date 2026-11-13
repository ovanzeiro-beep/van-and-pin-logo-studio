import type { Destino, DiaSemana, Passageiro, RespostaViagem } from "@/data/exemplo";
import { somarDias } from "@/lib/cobrancas";
import { pontosDeEmbarque } from "@/lib/passageiros";
import { formatarData, prazoPassou } from "@/lib/destinos";

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

// ---------- the passenger's side ----------

export type Agora = { data: string; hora: string };

/** "Vou" / "Não vou" can change until the deadline, and never after the van has left. */
export function confirmacaoAberta(
  d: Pick<Destino, "saida" | "prazo">,
  data: string,
  agora: Agora,
  viagemComecou: boolean,
) {
  return !viagemComecou && !prazoPassou(d, data, agora);
}

/** Trip days of a destino in the next `dias` days, today included. */
export function proximasDatas(d: Destino, hoje: string, dias = 7) {
  const datas: string[] = [];
  for (let i = 0; i < dias; i++) {
    const data = somarDias(hoje, i);
    if (aconteceEm(d, data)) datas.push(data);
  }
  return datas;
}

export type ItemHistorico = { data: string; embarcou: boolean };

/**
 * Past trips of a passenger (last `dias` days, plus today once the trip has their result):
 * a falta is "Faltou"; Por viagem/Diário only went on days they boarded; mensal/quinzenal went otherwise.
 */
export function historicoDoPassageiro(
  p: Pick<Passageiro, "id" | "plano">,
  d: Destino,
  hoje: string,
  h: { embarques: { passageiroId: string; data: string }[]; faltas: { passageiroId: string; data: string }[] },
  viagemDeHoje: ViagemDoDia | undefined,
  dias = 14,
): ItemHistorico[] {
  const itens: ItemHistorico[] = [];
  if (viagemDeHoje) {
    if (viagemDeHoje.embarcaram.includes(p.id)) itens.push({ data: hoje, embarcou: true });
    else if (viagemDeHoje.naoEstavam.includes(p.id)) itens.push({ data: hoje, embarcou: false });
  }
  const porDia = p.plano === "viagem" || p.plano === "diario";
  for (let i = 1; i <= dias; i++) {
    const data = somarDias(hoje, -i);
    if (!aconteceEm({ ...d, ativo: true }, data)) continue;
    const faltou = h.faltas.some((f) => f.passageiroId === p.id && f.data === data);
    const foi = h.embarques.some((e) => e.passageiroId === p.id && e.data === data);
    if (faltou) itens.push({ data, embarcou: false });
    else if (!porDia || foi) itens.push({ data, embarcou: true });
  }
  return itens;
}

export type SituacaoParaPassageiro = {
  situacao: string;
  detalhe: string;
  /** 0 = saiu da garagem, 1 = a caminho do seu ponto, 2 = você está na van; -1 = nada ainda. */
  etapa: number;
  alerta: boolean;
};

/** The van card on the passenger's Início follows the vanzeiro's Viagem tab. */
export function situacaoParaPassageiro(a: {
  passageiroId: string;
  destino: Destino;
  hoje: string;
  /** Next trip date (today included), or null. */
  proximaData: string | null;
  viagem: ViagemDoDia | undefined;
  resposta: RespostaViagem | undefined;
  aberta: boolean;
}): SituacaoParaPassageiro {
  const { passageiroId: id, viagem: v } = a;
  if (!aconteceEm(a.destino, a.hoje) && !v) {
    const detalhe = a.proximaData ? `Próxima viagem: ${formatarData(a.proximaData)}` : "Nenhuma viagem marcada";
    return { situacao: "Aguardando o dia da viagem", detalhe, etapa: -1, alerta: false };
  }
  if (!v) {
    if (a.resposta === "nao-vai") return { situacao: "Você não vai hoje", detalhe: "O vanzeiro já sabe", etapa: -1, alerta: false };
    if (!a.resposta && !a.aberta) return { situacao: "A van não vai passar", detalhe: "Você não confirmou a tempo", etapa: -1, alerta: true };
    return { situacao: "Aguardando a saída", detalhe: `A van sai às ${a.destino.saida}`, etapa: -1, alerta: false };
  }
  if (v.naoEstavam.includes(id)) return { situacao: "Você não estava no ponto", detalhe: "A van passou e seguiu viagem", etapa: -1, alerta: true };
  if (v.embarcaram.includes(id)) {
    if (v.desceram.includes(id) || v.fase === "encerrada") return { situacao: "Viagem encerrada", detalhe: "Até a próxima!", etapa: 2, alerta: false };
    return { situacao: "Na van", detalhe: "Boa viagem!", etapa: 2, alerta: false };
  }
  if (!v.ordem.includes(id)) {
    return a.resposta === "nao-vai"
      ? { situacao: "Você não vai hoje", detalhe: "O vanzeiro já sabe", etapa: -1, alerta: false }
      : { situacao: "A van não vai passar", detalhe: "Você não confirmou a tempo", etapa: -1, alerta: true };
  }
  if (proximoDaBusca(v) === id) return { situacao: "Você é o próximo", detalhe: "Fique pronto no seu ponto", etapa: 1, alerta: false };
  const antes = v.ordem.slice(0, v.ordem.indexOf(id)).filter((x) => !v.embarcaram.includes(x) && !v.naoEstavam.includes(x)).length;
  return {
    situacao: "Viagem começou",
    detalhe: antes === 1 ? "Falta 1 pessoa antes de você" : `Faltam ${antes} pessoas antes de você`,
    etapa: 0,
    alerta: false,
  };
}
