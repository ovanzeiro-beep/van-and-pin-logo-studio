import type { FormaPagamento } from "@/data/exemplo";
import { deuCerto, naoDeu, SEM_RESPOSTA, type Resultado } from "@/lib/acoes";
import { dataDeHoje } from "@/lib/agora";
import type { Cobranca } from "@/lib/cobrancas";
import {
  cancelarCobranca,
  carregarDinheiroDoBanco,
  inscreverNoDinheiro,
  marcarComoPago,
  obterCobrancas,
  obterRegistroDasViagens,
  registrarEmbarque,
  registrarFalta,
  type Embarque,
  type Falta,
} from "@/lib/cobrancas-store";
import { frase } from "@/lib/formatos";
import { problemaDoGasto, type Gasto, type TipoDeGasto } from "@/lib/gastos";
import { anotarGasto, apagarGasto, carregarGastosDoBanco } from "@/lib/gastos-store";
import { obterMatriculas, obterPassageiros } from "@/lib/passageiros-store";
import { novoId } from "@/lib/ids";
import { obterSessao } from "@/lib/sessao";
import { supabase, USA_BANCO } from "@/lib/supabase";
import type { ViagemDoDia } from "@/lib/viagem";

// W7 (docs/banco-de-dados.md, section 8.3): money in the database. The app keeps creating the charges by itself, with the
// same rules as before (a trip made, the next month, an on-time "Não vou"); each new charge, boarding and falta is saved
// in the background a moment later. "Marcar como pago", "Cancelar" and the expenses are saved first, then shown.
// A charge is never edited: the database refuses it (trigger cobranca_sem_edicao).

export type LinhaCobranca = {
  id: string;
  vanzeiro_id: string;
  viagem_id: string | null;
  matricula_id: string;
  destino_id: string;
  nome: string;
  telefone: string;
  tipo: Cobranca["tipo"];
  referencia: string;
  vencimento: string;
  valor_base: number;
  faltas: number;
  valor_falta: number;
  periodo_de: string | null;
  periodo_ate: string | null;
  pagamento_data: string | null;
  pagamento_forma: FormaPagamento | null;
  cancelamento_data: string | null;
  cancelamento_motivo: string | null;
};
type LinhaEmbarque = { matricula_id: string; data: string; viagem_id: string | null };
type LinhaFalta = {
  matricula_id: string;
  data: string;
  avisou_no_prazo: boolean;
  avisou_em: string | null;
};
type LinhaGasto = {
  id: string;
  vanzeiro_id: string;
  tipo: TipoDeGasto;
  descricao: string;
  valor: number;
  data: string;
};

export const linhaDaCobranca = (c: Cobranca): LinhaCobranca => ({
  id: c.id,
  vanzeiro_id: c.vanzeiroId,
  viagem_id: c.viagemId ?? null,
  matricula_id: c.passageiroId,
  destino_id: c.destinoId,
  nome: c.nome,
  telefone: c.telefone,
  tipo: c.tipo,
  referencia: c.referencia,
  vencimento: c.vencimento,
  valor_base: c.valorBase,
  faltas: c.faltas,
  valor_falta: c.valorFalta,
  periodo_de: c.periodoFaltas?.de ?? null,
  periodo_ate: c.periodoFaltas?.ate ?? null,
  pagamento_data: c.pagamento?.data ?? null,
  pagamento_forma: c.pagamento?.forma ?? null,
  cancelamento_data: c.cancelamento?.data ?? null,
  cancelamento_motivo: c.cancelamento?.motivo ?? null,
});

export const cobrancaDaLinha = (l: LinhaCobranca): Cobranca => ({
  id: l.id,
  vanzeiroId: l.vanzeiro_id,
  ...(l.viagem_id ? { viagemId: l.viagem_id } : {}),
  passageiroId: l.matricula_id,
  destinoId: l.destino_id,
  nome: l.nome,
  telefone: l.telefone,
  tipo: l.tipo,
  referencia: l.referencia,
  vencimento: l.vencimento,
  valorBase: l.valor_base,
  faltas: l.faltas,
  valorFalta: l.valor_falta,
  periodoFaltas: l.periodo_de && l.periodo_ate ? { de: l.periodo_de, ate: l.periodo_ate } : null,
  pagamento:
    l.pagamento_data && l.pagamento_forma
      ? { data: l.pagamento_data, forma: l.pagamento_forma }
      : null,
  cancelamento: l.cancelamento_data
    ? { data: l.cancelamento_data, motivo: l.cancelamento_motivo ?? "" }
    : null,
});

const embarqueDaLinha = (l: LinhaEmbarque): Embarque => ({
  passageiroId: l.matricula_id,
  data: l.data,
  ...(l.viagem_id ? { viagemId: l.viagem_id } : {}),
});
const faltaDaLinha = (l: LinhaFalta): Falta => ({
  passageiroId: l.matricula_id,
  data: l.data,
  avisouNoPrazo: l.avisou_no_prazo,
  ...(l.avisou_em ? { avisouEm: l.avisou_em } : {}),
});
const gastoDaLinha = (l: LinhaGasto): Gasto => ({
  id: l.id,
  vanzeiroId: l.vanzeiro_id,
  tipo: l.tipo,
  descricao: l.descricao,
  valor: l.valor,
  data: l.data,
});

const usaBanco = () => USA_BANCO.destinos && supabase() !== null;

function motivo(erro: { message?: string; code?: string } | null): string {
  if (!erro) return SEM_RESPOSTA;
  if (erro.code === "P0001" && erro.message) return erro.message;
  if (/fetch|network/i.test(erro.message ?? "")) return SEM_RESPOSTA;
  return "Não deu para salvar. Tente de novo em instantes.";
}

// ---------- what the database already has (to save only what changed) ----------

const chaveDoDia = (passageiroId: string, data: string) => `${passageiroId}|${data}`;
let salvas = new Map<string, string>();
let embarquesSalvos = new Set<string>();
let faltasSalvas = new Set<string>();

function lembrarDoBanco(cobrancas: Cobranca[], embarques: Embarque[], faltas: Falta[]) {
  salvas = new Map(cobrancas.map((c) => [c.id, JSON.stringify(linhaDaCobranca(c))]));
  embarquesSalvos = new Set(embarques.map((e) => chaveDoDia(e.passageiroId, e.data)));
  faltasSalvas = new Set(faltas.map((f) => chaveDoDia(f.passageiroId, f.data)));
}

/** Only the logged-in vanzeiro writes their own money (the passenger's phone only reads). */
const souDono = (vanzeiroId: string) => obterSessao().conta?.id === vanzeiroId;

let fila: Promise<boolean> = Promise.resolve(true);

/** Saves the new charges, boardings and faltas, and the changes in open charges. true when everything is saved. */
export function sincronizarDinheiro(): Promise<boolean> {
  fila = fila.then(salvarMudancas, salvarMudancas);
  return fila;
}

async function salvarMudancas(): Promise<boolean> {
  const sb = supabase();
  const conta = obterSessao().conta?.id;
  if (!usaBanco() || !sb || !conta) return true;
  const mesmaConta = () => obterSessao().conta?.id === conta;
  const minhas = obterCobrancas().filter((c) => souDono(c.vanzeiroId));
  const donoDaMatricula = new Map(obterPassageiros().map((p) => [p.id, p.vanzeiroId]));
  const registro = obterRegistroDasViagens();
  const novas = minhas.filter((c) => !salvas.has(c.id)).map(linhaDaCobranca);
  const mudadas = minhas
    .map(linhaDaCobranca)
    .filter((l) => salvas.has(l.id) && salvas.get(l.id) !== JSON.stringify(l));
  // Boardings and faltas come from this phone's trips; the database only accepts the vanzeiro's own passengers.
  const meus = (passageiroId: string) => {
    const dono = donoDaMatricula.get(passageiroId);
    return dono === undefined || souDono(dono);
  };
  const embarques = registro.embarques.filter(
    (e) => meus(e.passageiroId) && !embarquesSalvos.has(chaveDoDia(e.passageiroId, e.data)),
  );
  const faltas = registro.faltas.filter(
    (f) => meus(f.passageiroId) && !faltasSalvas.has(chaveDoDia(f.passageiroId, f.data)),
  );
  let tudo = true;
  if (embarques.length) {
    const { error } = await sb.from("embarques").upsert(
      embarques.map((e) => ({
        matricula_id: e.passageiroId,
        data: e.data,
        viagem_id: e.viagemId ?? null,
      })),
      { onConflict: "matricula_id,data", ignoreDuplicates: true },
    );
    if (!mesmaConta()) return false;
    if (error) tudo = false;
    else embarques.forEach((e) => embarquesSalvos.add(chaveDoDia(e.passageiroId, e.data)));
  }
  if (faltas.length) {
    const { error } = await sb.from("faltas").upsert(
      faltas.map((f) => ({
        matricula_id: f.passageiroId,
        data: f.data,
        avisou_no_prazo: f.avisouNoPrazo,
        avisou_em: f.avisouEm ?? null,
      })),
      { onConflict: "matricula_id,data", ignoreDuplicates: true },
    );
    if (!mesmaConta()) return false;
    if (error) tudo = false;
    else faltas.forEach((f) => faltasSalvas.add(chaveDoDia(f.passageiroId, f.data)));
  }
  if (novas.length) {
    const { error } = await sb
      .from("cobrancas")
      .upsert(novas, { onConflict: "id", ignoreDuplicates: true });
    if (!mesmaConta()) return false;
    if (error) tudo = false;
    else novas.forEach((l) => salvas.set(l.id, JSON.stringify(l)));
  }
  for (const l of mudadas) {
    const { error } = await sb
      .from("cobrancas")
      .update({
        faltas: l.faltas,
        valor_falta: l.valor_falta,
        periodo_de: l.periodo_de,
        periodo_ate: l.periodo_ate,
        pagamento_data: l.pagamento_data,
        pagamento_forma: l.pagamento_forma,
        cancelamento_data: l.cancelamento_data,
        cancelamento_motivo: l.cancelamento_motivo,
      })
      .eq("id", l.id);
    if (!mesmaConta()) return false;
    if (error) tudo = false;
    else salvas.set(l.id, JSON.stringify(l));
  }
  return tudo;
}

// A moment after any change in memory, it goes to the database.
let espera: ReturnType<typeof setTimeout> | null = null;
if (typeof window !== "undefined") {
  inscreverNoDinheiro(() => {
    if (!usaBanco() || !obterSessao().conta) return;
    if (espera) clearTimeout(espera);
    espera = setTimeout(() => {
      espera = null;
      void sincronizarDinheiro();
    }, 400);
  });
}

// ---------- reading ----------

/** Read all visible charges, even when the API caps the number of rows per response. */
async function carregarCobrancas(sb: NonNullable<ReturnType<typeof supabase>>, conta: string | undefined) {
  const linhas: LinhaCobranca[] = [];
  let ultimoId: string | undefined;
  do {
    let consulta = sb.from("cobrancas").select("*", { count: "exact" }).order("id").limit(1000);
    if (ultimoId !== undefined) consulta = consulta.gt("id", ultimoId);
    const { data, error, count } = await consulta;
    if (error || !data || obterSessao().conta?.id !== conta) return null;
    const pagina = data as LinhaCobranca[];
    linhas.push(...pagina);
    if (pagina.length === 0 || pagina.length === count) return linhas;
    ultimoId = pagina[pagina.length - 1]!.id;
  } while (true);
}

/** Charges, boardings, faltas and expenses this account can see (the vanzeiro: theirs; the passenger: their own). */
export async function carregarDinheiro(): Promise<boolean> {
  const sb = supabase();
  if (!USA_BANCO.destinos || !sb) return false;
  const conta = obterSessao().conta?.id;
  // What this phone created and has not saved yet goes first, so reading does not lose it.
  const salvouTudo = await sincronizarDinheiro();
  const [c, e, f, g] = await Promise.all([
    carregarCobrancas(sb, conta),
    sb.from("embarques").select("matricula_id, data, viagem_id"),
    sb.from("faltas").select("matricula_id, data, avisou_no_prazo, avisou_em"),
    sb.from("gastos").select("id, vanzeiro_id, tipo, descricao, valor, data"),
  ]);
  if (obterSessao().conta?.id !== conta) return false;
  if (!g.error) carregarGastosDoBanco((g.data as LinhaGasto[]).map(gastoDaLinha));
  if (!salvouTudo || !c || e.error || f.error) return false;
  const cobrancas = c.map(cobrancaDaLinha);
  const embarques = (e.data as LinhaEmbarque[]).map(embarqueDaLinha);
  const faltas = (f.data as LinhaFalta[]).map(faltaDaLinha);
  lembrarDoBanco(cobrancas, embarques, faltas);
  carregarDinheiroDoBanco(cobrancas, { embarques, faltas });
  return true;
}

/** Replay the financial consequences after the trip exists on the server. */
export async function reconciliarRegistrosDaViagem(
  v: ViagemDoDia,
  faltas: Falta[],
): Promise<boolean> {
  if (!souDono(v.vanzeiroId)) return false;
  const ids = [...v.embarcaram, ...faltas.map((f) => f.passageiroId)];
  if (!ids.length) return true;
  const doDestino = obterMatriculas().filter(
    (p) => p.vanzeiroId === v.vanzeiroId && p.destinoId === v.destinoId,
  );
  const matriculas = new Map(doDestino.map((p) => [p.id, p]));
  if (ids.some((id) => !matriculas.has(id))) return false;
  if (!(await carregarDinheiro()) || !souDono(v.vanzeiroId)) return false;

  for (const id of v.embarcaram) registrarEmbarque(matriculas.get(id)!, v.data, v.id, true);
  for (const f of faltas) {
    registrarFalta(matriculas.get(f.passageiroId)!, f.data, f.avisouNoPrazo, f.avisouEm);
  }
  return sincronizarDinheiro();
}

// ---------- the vanzeiro's actions ----------

async function mudarCobranca(
  id: string,
  mudanca: Partial<LinhaCobranca>,
  naMemoria: () => Resultado,
): Promise<Resultado> {
  if (!usaBanco()) return naMemoria();
  const c = obterCobrancas().find((x) => x.id === id);
  if (!c) return naoDeu("Não achamos esta cobrança.");
  if (c.pagamento) return naoDeu("Esta cobrança já estava paga.");
  if (c.cancelamento) return naoDeu("Esta cobrança já estava cancelada.");
  // A charge created a moment ago may still be on its way to the database.
  await sincronizarDinheiro();
  if (!salvas.has(id)) return naoDeu(SEM_RESPOSTA);
  const { error } = await supabase()!.from("cobrancas").update(mudanca).eq("id", id);
  if (error) return naoDeu(motivo(error));
  const r = naMemoria();
  const depois = obterCobrancas().find((x) => x.id === id);
  if (depois) salvas.set(id, JSON.stringify(linhaDaCobranca(depois)));
  return r;
}

/** "Marcar como pago" (Dinheiro or Pix), on the vanzeiro's phone only. */
export function marcarComoPagoNoBanco(id: string, forma: FormaPagamento): Promise<Resultado> {
  return mudarCobranca(id, { pagamento_data: dataDeHoje(), pagamento_forma: forma }, () =>
    marcarComoPago(id, forma),
  );
}

/** "Cancelar cobrança", with the reason. */
export async function cancelarCobrancaNoBanco(
  id: string,
  motivoDoCancelamento: string,
): Promise<Resultado> {
  if (!motivoDoCancelamento.trim()) return naoDeu("Escreva o motivo do cancelamento.");
  return mudarCobranca(
    id,
    { cancelamento_data: dataDeHoje(), cancelamento_motivo: frase(motivoDoCancelamento) },
    () => cancelarCobranca(id, motivoDoCancelamento),
  );
}

/** "Anotar gasto": saved first, then on the list. */
export async function anotarGastoNoBanco(g: {
  tipo: TipoDeGasto;
  descricao: string;
  valor: number;
  data: string;
}): Promise<Resultado> {
  const conta = obterSessao().conta;
  if (!usaBanco() || !conta) return anotarGasto(g);
  const problema = problemaDoGasto(g, dataDeHoje());
  if (problema) return naoDeu(problema);
  const id = novoId("gasto");
  const { error } = await supabase()!
    .from("gastos")
    .insert({
      id,
      vanzeiro_id: conta.id,
      tipo: g.tipo,
      descricao: g.tipo === "outros" ? frase(g.descricao) : "",
      valor: g.valor,
      data: g.data,
    });
  if (error) return naoDeu(motivo(error));
  return anotarGasto(g, id);
}

/** "Apagar gasto" (an expense is never edited: delete and write it again). */
export async function apagarGastoNoBanco(id: string): Promise<Resultado> {
  if (!usaBanco() || !obterSessao().conta) return apagarGasto(id);
  const { error } = await supabase()!.from("gastos").delete().eq("id", id);
  if (error) return naoDeu(motivo(error));
  return apagarGasto(id);
}
