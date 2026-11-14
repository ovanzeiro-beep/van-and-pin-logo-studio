import type { DiaSemana, Destino, PrazoConfirmacao, TipoDestino } from "@/data/exemplo";
import { gerarConviteUnico } from "@/lib/convite";

export const DIAS_DA_SEMANA: { id: DiaSemana; curto: string }[] = [
  { id: "seg", curto: "Seg" },
  { id: "ter", curto: "Ter" },
  { id: "qua", curto: "Qua" },
  { id: "qui", curto: "Qui" },
  { id: "sex", curto: "Sex" },
  { id: "sab", curto: "Sáb" },
  { id: "dom", curto: "Dom" },
];

export const PRAZOS: { id: PrazoConfirmacao; curto: string; texto: string }[] = [
  { id: "30min", curto: "30 min antes", texto: "30 min antes da saída" },
  { id: "1h", curto: "1 h antes", texto: "1 hora antes da saída" },
  { id: "2h", curto: "2 h antes", texto: "2 horas antes da saída" },
  { id: "noite-anterior", curto: "Noite anterior, 20h", texto: "Na noite anterior, às 20h" },
];

export const PRAZO_TEXTO = Object.fromEntries(PRAZOS.map((p) => [p.id, p.texto])) as Record<PrazoConfirmacao, string>;

const MINUTOS_ANTES: Record<Exclude<PrazoConfirmacao, "noite-anterior">, number> = { "30min": 30, "1h": 60, "2h": 120 };

function somarDiasIso(iso: string, dias: number) {
  const [a = 0, m = 1, d = 1] = iso.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d + dias)).toISOString().slice(0, 10);
}

/** Exact moment confirmations close for the trip on `data` (AAAA-MM-DD + HH:MM). */
export function prazoDaViagem(d: Pick<Destino, "saida" | "prazo">, data: string): { data: string; hora: string } {
  if (d.prazo === "noite-anterior") return { data: somarDiasIso(data, -1), hora: "20:00" };
  const [h = 0, min = 0] = d.saida.split(":").map(Number);
  let total = h * 60 + min - MINUTOS_ANTES[d.prazo];
  let dia = data;
  if (total < 0) {
    total += 24 * 60;
    dia = somarDiasIso(data, -1);
  }
  const hora = `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
  return { data: dia, hora };
}

/** "05:40", or "20:00 do dia anterior" when the deadline falls on the day before. */
export function textoDoPrazo(d: Pick<Destino, "saida" | "prazo">, data: string) {
  const p = prazoDaViagem(d, data);
  return p.data === data ? p.hora : `${p.hora} do dia anterior`;
}

/** Whether "agora" is already past the deadline. */
export function prazoPassou(d: Pick<Destino, "saida" | "prazo">, data: string, agora: { data: string; hora: string }) {
  const p = prazoDaViagem(d, data);
  return `${agora.data}T${agora.hora}` >= `${p.data}T${p.hora}`;
}

export const TIPO_ROTULO: Record<TipoDestino, string> = { fixa: "Rota fixa", avulsa: "Viagem avulsa" };

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const SEMANA = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

export function nomeDestino(d: { origem: string; destino: string }) {
  return `${d.origem} → ${d.destino}`;
}

/** "Seg a sex", "Sex, sáb e dom", "Todos os dias". */
export function formatarDias(dias: DiaSemana[]) {
  const ordem = DIAS_DA_SEMANA.map((d) => d.id);
  const idx = [...new Set(dias)].map((d) => ordem.indexOf(d)).sort((a, b) => a - b);
  if (idx.length === 0) return "Nenhum dia";
  if (idx.length === 7) return "Todos os dias";
  const seguidos = idx.every((v, i) => i === 0 || v === (idx[i - 1] ?? -2) + 1);
  const nomes = idx.map((i, n) => {
    const curto = DIAS_DA_SEMANA[i]?.curto ?? "";
    return n === 0 ? curto : curto.toLowerCase();
  });
  const primeiro = nomes[0] ?? "";
  const ultimo = nomes[nomes.length - 1] ?? "";
  if (seguidos && nomes.length >= 4) return `${primeiro} a ${ultimo}`;
  if (nomes.length === 1) return primeiro;
  return `${nomes.slice(0, -1).join(", ")} e ${ultimo}`;
}

/** "2026-11-28" → "Sáb, 28 de nov". */
export function formatarData(iso: string) {
  const [a, m, d] = iso.split("-").map(Number);
  if (!a || !m || !d) return "Sem data";
  const semana = SEMANA[new Date(Date.UTC(a, m - 1, d)).getUTCDay()] ?? "";
  return `${semana.charAt(0).toUpperCase()}${semana.slice(1)}, ${d} de ${MESES[m - 1] ?? ""}`;
}

export function quandoAcontece(d: Pick<Destino, "tipo" | "dias" | "data">): string {
  return d.tipo === "fixa" ? formatarDias(d.dias) : d.data ? formatarData(d.data) : "Sem data";
}

/** Origem, paradas e destino, na ordem da viagem. */
export function caminhoCompleto(d: Pick<Destino, "origem" | "destino" | "paradas">) {
  return [d.origem, ...d.paradas, d.destino];
}

export function moverItem<T>(lista: T[], de: number, para: number) {
  if (para < 0 || para >= lista.length) return lista;
  const nova = [...lista];
  const [item] = nova.splice(de, 1);
  if (item === undefined) return lista;
  nova.splice(para, 0, item);
  return nova;
}

/** What the vanzeiro fills in while creating or editing a destino. */
export type Rascunho = {
  origem: string;
  destino: string;
  tipo: TipoDestino | null;
  dias: DiaSemana[];
  data: string;
  saida: string;
  temVolta: boolean | null;
  volta: string;
  paradas: string[];
  prazo: PrazoConfirmacao;
};

export function rascunhoVazio(): Rascunho {
  return { origem: "", destino: "", tipo: null, dias: [], data: "", saida: "", temVolta: null, volta: "", paradas: [], prazo: "1h" };
}

export function rascunhoDeDestino(d: Destino): Rascunho {
  return {
    origem: d.origem,
    destino: d.destino,
    tipo: d.tipo,
    dias: d.dias,
    data: d.data ?? "",
    saida: d.saida,
    temVolta: d.volta !== null,
    volta: d.volta ?? "",
    paradas: d.paradas,
    prazo: d.prazo,
  };
}

/** Whether the vanzeiro can leave this step (1, 2 or 3). */
export function passoCompleto(passo: number, r: Rascunho) {
  if (passo === 1) return r.origem.trim() !== "" && r.destino.trim() !== "" && r.tipo !== null;
  if (passo === 2) {
    const quando = r.tipo === "fixa" ? r.dias.length > 0 : r.data !== "";
    return quando && r.saida !== "" && r.temVolta !== null && (!r.temVolta || r.volta !== "");
  }
  return true;
}

export function destinoDeRascunho(r: Rascunho, anterior?: Destino): Destino {
  const tipo = r.tipo ?? "fixa";
  return {
    id: anterior?.id ?? `destino-${Date.now()}`,
    origem: r.origem.trim(),
    destino: r.destino.trim(),
    tipo,
    dias: tipo === "fixa" ? DIAS_DA_SEMANA.map((d) => d.id).filter((d) => r.dias.includes(d)) : [],
    data: tipo === "avulsa" ? r.data : null,
    saida: r.saida,
    volta: r.temVolta ? r.volta : null,
    paradas: r.paradas.map((p) => p.trim()).filter(Boolean),
    convite: anterior?.convite ?? gerarConvite(),
    prazo: r.prazo,
    ativo: anterior?.ativo ?? true,
  };
}

/** Short invite code, e.g. "VAN-4821". */
/** Gera um convite único (usar gerarConviteUnico de convite.ts para novos destinos). */
export function gerarConvite() {
  return gerarConviteUnico();
}

export function mensagemConvite(d: Pick<Destino, "origem" | "destino" | "convite">) {
  return `Oi! Para entrar na minha van (${nomeDestino(d)}), abra o app O Vanzeiro e use o código ${d.convite}.`;
}
