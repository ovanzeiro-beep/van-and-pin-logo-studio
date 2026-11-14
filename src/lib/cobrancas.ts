import { formatarReais, type FormaPagamento, type Passageiro, type PlanoPagamento } from "@/data/exemplo";

/** A charge. Its values never change after creation: it can only be paid or cancelled. */
export type Cobranca = {
  id: string;
  vanzeiroId: string;
  viagemId?: string | undefined;
  passageiroId: string;
  destinoId: string;
  /** Name and phone at creation, so history stays right even if the passenger leaves. */
  nome: string;
  telefone: string;
  tipo: PlanoPagamento;
  /** "Mensalidade de novembro", "Viagem de 14/11"… */
  referencia: string;
  vencimento: string;
  valorBase: number;
  faltas: number;
  valorFalta: number;
  /** Start and end of the period whose faltas were counted (mensal/quinzenal with discount). */
  periodoFaltas: { de: string; ate: string } | null;
  pagamento: { data: string; forma: FormaPagamento } | null;
  cancelamento: { data: string; motivo: string } | null;
};

export type Situacao = "pendente" | "devendo" | "pago" | "cancelada";
export type Filtro = "todas" | "pendentes" | "devendo" | "pagas";

export const SITUACAO_ROTULO: Record<Situacao, string> = {
  pendente: "Pendente",
  devendo: "Devendo",
  pago: "Pago",
  cancelada: "Cancelada",
};

export const FORMA_ROTULO: Record<FormaPagamento, string> = { dinheiro: "Dinheiro", pix: "Pix" };

const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

// ---------- dates (AAAA-MM-DD, no time zone surprises) ----------

function partes(iso: string) {
  const [a = 0, m = 1, d = 1] = iso.split("-").map(Number);
  return { a, m, d };
}

function paraIso(data: Date) {
  return data.toISOString().slice(0, 10);
}

export function somarDias(iso: string, dias: number) {
  const { a, m, d } = partes(iso);
  return paraIso(new Date(Date.UTC(a, m - 1, d + dias)));
}

/** Day `dia` of the given month, clamped to the month length (31 → 30 in november). */
function diaDoMes(a: number, m: number, dia: number) {
  const ultimo = new Date(Date.UTC(a, m, 0)).getUTCDate();
  return paraIso(new Date(Date.UTC(a, m - 1, Math.min(dia, ultimo))));
}

function somarMeses(iso: string, meses: number, dia: number) {
  const { a, m } = partes(iso);
  const total = a * 12 + (m - 1) + meses;
  return diaDoMes(Math.floor(total / 12), (total % 12) + 1, dia);
}

/** "05/11". */
export function diaMes(iso: string) {
  const { m, d } = partes(iso);
  return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}`;
}

export function mesmoMes(a: string, b: string) {
  return a.slice(0, 7) === b.slice(0, 7);
}

// ---------- values and status ----------

export function valorFinal(c: Pick<Cobranca, "valorBase" | "faltas" | "valorFalta">) {
  return Math.max(0, Math.round((c.valorBase - c.faltas * c.valorFalta) * 100) / 100);
}

export function situacao(c: Pick<Cobranca, "pagamento" | "cancelamento" | "vencimento">, hoje: string): Situacao {
  if (c.cancelamento) return "cancelada";
  if (c.pagamento) return "pago";
  return c.vencimento < hoje ? "devendo" : "pendente";
}

const ROTULO_BASE: Record<PlanoPagamento, string> = {
  mensal: "Mensalidade",
  quinzenal: "Quinzena",
  diario: "Diária",
  viagem: "Viagem",
};

/** "Mensalidade R$ 280,00 − 2 faltas × R$ 15,00 = R$ 250,00", or null when there is no discount. */
export function contaDoDesconto(c: Pick<Cobranca, "tipo" | "valorBase" | "faltas" | "valorFalta">) {
  if (c.faltas <= 0) return null;
  const faltas = c.faltas === 1 ? "1 falta" : `${c.faltas} faltas`;
  return `${ROTULO_BASE[c.tipo]} ${formatarReais(c.valorBase)} − ${faltas} × ${formatarReais(c.valorFalta)} = ${formatarReais(valorFinal(c))}`;
}

export function filtrarCobrancas(lista: Cobranca[], filtro: Filtro, hoje: string) {
  const alvo: Record<Exclude<Filtro, "todas">, Situacao> = { pendentes: "pendente", devendo: "devendo", pagas: "pago" };
  const filtradas = filtro === "todas" ? lista : lista.filter((c) => situacao(c, hoje) === alvo[filtro]);
  return ordenarRecentes(filtradas);
}

/** Newest due date first. */
export function ordenarRecentes(lista: Cobranca[]) {
  return [...lista].sort((a, b) => b.vencimento.localeCompare(a.vencimento) || a.nome.localeCompare(b.nome));
}

/**
 * Month summary, shared by Financeiro and Início. The month holds the charges due this month plus
 * any older charge still unpaid. Cancelled charges never count.
 */
export function resumoDoMes(lista: Cobranca[], hoje: string) {
  const r = { aReceber: 0, recebido: 0, devendo: 0, pagos: 0, pendentes: 0, devendoQtd: 0 };
  for (const c of lista) {
    const s = situacao(c, hoje);
    if (s === "cancelada") continue;
    const doMes = mesmoMes(c.vencimento, hoje) || (s === "devendo" && c.vencimento < hoje);
    if (!doMes) continue;
    const v = valorFinal(c);
    if (s === "pago") {
      r.recebido += v;
      r.pagos += 1;
    } else {
      r.aReceber += v;
      if (s === "devendo") {
        r.devendo += v;
        r.devendoQtd += 1;
      } else r.pendentes += 1;
    }
  }
  return r;
}

/** What a passenger owes: the sum of their charges not paid yet (cancelled ones don't count). */
export function totalDevido(lista: Cobranca[], passageiroId: string) {
  return lista
    .filter((c) => c.passageiroId === passageiroId && !c.pagamento && !c.cancelamento)
    .reduce((soma, c) => soma + valorFinal(c), 0);
}

export function mensagemCobranca(c: Cobranca, destino: string, hoje: string) {
  const nome = c.nome.split(" ")[0] ?? c.nome;
  const venceu = situacao(c, hoje) === "devendo";
  return (
    `Olá, ${nome}! Tudo bem? Passando para lembrar da ${c.referencia.charAt(0).toLowerCase()}${c.referencia.slice(1)} ` +
    `da van${destino ? ` (${destino})` : ""}, no valor de ${formatarReais(valorFinal(c))}, ` +
    `${venceu ? "que venceu" : "com vencimento"} em ${diaMes(c.vencimento)}. ` +
    `Se já pagou, pode desconsiderar. Obrigado!`
  );
}

// ---------- automatic creation from the plan ----------

type Dia = { passageiroId: string; data: string; viagemId?: string | undefined; avisouNoPrazo?: boolean };

type Historico = {
  /** Days the passenger boarded (Por viagem and Diário). */
  embarques: Dia[];
  /** Days the passenger missed (discounted on mensal and quinzenal when the plan says so). */
  faltas: Dia[];
};

/** Due dates of a mensal plan between two dates. */
export function vencimentosMensais(dia: number, desde: string, ate: string) {
  const datas: string[] = [];
  for (let v = somarMeses(desde, 0, dia); v <= ate; v = somarMeses(v, 1, dia)) if (v >= desde) datas.push(v);
  return datas;
}

/** Due dates of a quinzenal plan: the due day, then every 15 days. */
export function vencimentosQuinzenais(dia: number, desde: string, ate: string) {
  const datas: string[] = [];
  for (let v = somarMeses(desde, 0, dia); v <= ate; v = somarDias(v, 15)) if (v >= desde) datas.push(v);
  return datas;
}

function referencia(tipo: PlanoPagamento, vencimento: string) {
  if (tipo === "mensal") return `Mensalidade de ${MESES[partes(vencimento).m - 1] ?? ""}`;
  if (tipo === "quinzenal") return `Quinzena de ${diaMes(somarDias(vencimento, -14))} a ${diaMes(vencimento)}`;
  if (tipo === "diario") return `Diária de ${diaMes(vencimento)}`;
  return `Viagem de ${diaMes(vencimento)}`;
}

function nova(p: Passageiro, vencimento: string, faltas = 0, periodo: Cobranca["periodoFaltas"] = null): Cobranca {
  return {
    id: `${p.id}_${vencimento}`,
    vanzeiroId: p.vanzeiroId,
    passageiroId: p.id,
    destinoId: p.destinoId,
    nome: p.nome,
    telefone: p.telefone,
    tipo: p.plano,
    referencia: referencia(p.plano, vencimento),
    vencimento,
    valorBase: p.valor,
    faltas,
    valorFalta: faltas > 0 ? (p.valorFalta ?? 0) : 0,
    periodoFaltas: periodo,
    pagamento: null,
    cancelamento: null,
  };
}

/**
 * Creates a passenger's charges from their plan between `desde` and `ate`:
 * Por viagem → one per trip boarded; Diário → one per day they went;
 * Quinzenal → one every 15 days on the due day; Mensal → one per month on the due day.
 * Faltas counted are those up to `hoje` in the period that ends on the due date.
 */
export function gerarCobrancas(p: Passageiro, desde: string, ate: string, hoje: string, h: Historico): Cobranca[] {
  if (p.plano === "viagem" || p.plano === "diario") {
    const eventos = h.embarques.filter((e) => e.passageiroId === p.id).sort((a, b) => a.data.localeCompare(b.data));
    const unicos = new Map<string, Dia>();
    for (const e of eventos) {
      const chave = p.plano === "viagem" ? (e.viagemId ?? e.data) : e.data;
      if (!unicos.has(chave)) unicos.set(chave, e);
    }
    return [...unicos.entries()].filter(([, e]) => e.data >= desde && e.data <= ate).map(([chave, e]) => ({ ...nova(p, e.data), ...(p.plano === "viagem" && e.viagemId ? { id: `${p.id}_${chave}`, viagemId: chave } : {}) }));
  }
  const dia = p.vencimento ?? 1;
  const datas = p.plano === "mensal" ? vencimentosMensais(dia, desde, ate) : vencimentosQuinzenais(dia, desde, ate);
  return datas.map((v) => {
    if (!p.descontaFaltas) return nova(p, v);
    const de = p.plano === "mensal" ? somarDias(somarMeses(v, -1, dia), 1) : somarDias(v, -14);
    const fim = v < hoje ? v : hoje;
    const faltas = new Set(
      h.faltas.filter((f) => f.passageiroId === p.id && f.avisouNoPrazo === true && f.data >= de && f.data <= fim).map((f) => f.data),
    ).size;
    return nova(p, v, faltas, { de, ate: v });
  });
}

/** Next mensal/quinzenal charge for a passenger who has none coming (new passenger, or plan changed). */
export function proximaCobranca(p: Passageiro, hoje: string): Cobranca | null {
  if (p.plano !== "mensal" && p.plano !== "quinzenal") return null;
  const desde = p.plano === "mensal" ? hoje : somarMeses(hoje, -1, 1);
  const sem = { embarques: [], faltas: [] };
  const [primeira] = gerarCobrancas(p, desde, somarDias(hoje, 45), hoje, sem).filter((c) => c.vencimento >= hoje);
  return primeira ?? null;
}

// ---------- what a trip changes in the money ----------

/**
 * Boarding: Por viagem deduplicates by trip identity (including later returns), Diário by date.
 * Other plans don't change.
 */
export function aplicarEmbarque(lista: Cobranca[], p: Passageiro, data: string, hoje: string, viagemId?: string): Cobranca[] {
  if (p.plano !== "viagem" && p.plano !== "diario") return lista;
  const [c] = gerarCobrancas(p, data, data, hoje, { embarques: [{ passageiroId: p.id, data, viagemId }], faltas: [] });
  if (!c || lista.some((x) => x.id === c.id)) return lista;
  return [...lista, c];
}

/**
 * On-time "Não vou": for mensal/quinzenal passengers with the faltas discount, the falta goes into
 * their next open charge (created now if it doesn't exist yet). Charges already due, paid or
 * cancelled are never touched.
 */
export function aplicarFalta(lista: Cobranca[], p: Passageiro, data: string, hoje: string, avisouNoPrazo = false): Cobranca[] {
  if (!avisouNoPrazo) return lista;
  if ((p.plano !== "mensal" && p.plano !== "quinzenal") || !p.descontaFaltas) return lista;
  const aberta = (c: Cobranca) =>
    c.passageiroId === p.id && c.tipo === p.plano && !c.pagamento && !c.cancelamento && c.vencimento > hoje && c.vencimento >= data;
  const [alvo] = lista.filter(aberta).sort((a, b) => a.vencimento.localeCompare(b.vencimento));
  const valorFalta = p.valorFalta ?? 0;
  if (alvo) {
    return lista.map((c) => (c.id === alvo.id ? { ...c, faltas: c.faltas + 1, valorFalta } : c));
  }
  const desde = p.plano === "mensal" ? data : somarMeses(data, -1, 1);
  const sem = { embarques: [], faltas: [] };
  const [nova] = gerarCobrancas(p, desde, somarDias(data, 45), hoje, sem).filter((c) => c.vencimento > hoje && c.vencimento >= data);
  if (!nova || lista.some((c) => c.id === nova.id)) return lista;
  return [...lista, { ...nova, faltas: 1, valorFalta }];
}

// ---------- leaving a destino (excluir destino / sair deste destino) ----------

/** What happens to the charges of these passengers: how many pendentes get cancelled and how many devendo stay. */
export function resumoDaSaida(lista: Cobranca[], passageiroIds: string[], hoje: string) {
  const delas = lista.filter((c) => passageiroIds.includes(c.passageiroId));
  return {
    pendentes: delas.filter((c) => situacao(c, hoje) === "pendente").length,
    devendo: delas.filter((c) => situacao(c, hoje) === "devendo").length,
  };
}

/**
 * Decision 6: pendentes are cancelled with the reason; devendo keep being collected; paid and
 * cancelled ones stay in the history untouched.
 */
export function cancelarPendentes(lista: Cobranca[], passageiroIds: string[], motivo: string, hoje: string): Cobranca[] {
  return lista.map((c) =>
    passageiroIds.includes(c.passageiroId) && situacao(c, hoje) === "pendente"
      ? { ...c, cancelamento: { data: hoje, motivo } }
      : c,
  );
}

/** Message the passenger sends after paying, so the vanzeiro can check and mark it as paid. */
export function mensagemJaPaguei(c: Cobranca, vanzeiro: string) {
  const nome = vanzeiro.split(" ")[0] ?? vanzeiro;
  return (
    `Olá, ${nome}! Aqui é ${c.nome.split(" ")[0] ?? c.nome}. Já paguei a ${c.referencia.charAt(0).toLowerCase()}${c.referencia.slice(1)} ` +
    `da van, no valor de ${formatarReais(valorFinal(c))}. Pode conferir e marcar como pago, por favor? Obrigado!`
  );
}
