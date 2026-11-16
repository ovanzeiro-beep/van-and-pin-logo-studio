import type { RespostaViagem } from "@/data/exemplo";
import { deuCerto, naoDeu, SEM_RESPOSTA, type Resultado } from "@/lib/acoes";
import { dataDeHoje, emBrasilia } from "@/lib/agora";
import { somarDias } from "@/lib/datas";
import type { RespostasFixas } from "@/lib/respostas-fixas";
import {
  carregarRespostasDoBanco,
  ligarVouSempre,
  marcarNaoVouNoPeriodo,
  responder,
  tirarNaoVouDoPeriodo,
  type MomentoDaResposta,
} from "@/lib/respostas-store";
import { supabase, USA_BANCO } from "@/lib/supabase";

// W5 (docs/banco-de-dados.md, section 8.3): "Vou" / "Não vou", "Vou sempre" and "Não vou de… até…" in the database.
// The database checks the rules (only the person, only until the deadline, a day with a trip, a free seat); when it
// says it worked, the screen changes with the same rules as before. The vanzeiro's phone sees the answers within 30 s.

type LinhaResposta = { matricula_id: string; data: string; resposta: RespostaViagem; respondida_em: string; prazo: string };
type LinhaVouSempre = { matricula_id: string; desde: string; ate: string | null };
type LinhaNaoVou = { id: string; matricula_id: string; de: string; ate: string; em: string; tirado_em: string | null };

/** "2026-11-13T08:10:00Z" → "2026-11-13 05:10" (Brasília), the way the app keeps moments. */
export const momentoDe = (instante: string) => {
  const b = emBrasilia(new Date(instante));
  return `${b.data} ${b.hora}`;
};

const usaBanco = () => USA_BANCO.destinos && supabase() !== null;

function motivo(erro: { message?: string; code?: string } | null): string {
  if (!erro) return SEM_RESPOSTA;
  if (erro.code === "P0001" && erro.message) return erro.message;
  if (/fetch|network/i.test(erro.message ?? "")) return SEM_RESPOSTA;
  return "Não deu para salvar. Tente de novo em instantes.";
}

export function respostasDasLinhas(r: LinhaResposta[], vs: LinhaVouSempre[], nv: LinhaNaoVou[]) {
  const respostas: Record<string, Record<string, RespostaViagem>> = {};
  const momentos: Record<string, Record<string, MomentoDaResposta>> = {};
  for (const l of r) {
    (respostas[l.data] ??= {})[l.matricula_id] = l.resposta;
    (momentos[l.data] ??= {})[l.matricula_id] = { em: momentoDe(l.respondida_em), prazo: momentoDe(l.prazo) };
  }
  const fixas: RespostasFixas = {
    vouSempre: vs.map((l) => ({ passageiroId: l.matricula_id, desde: momentoDe(l.desde), ate: l.ate ? momentoDe(l.ate) : null })),
    naoVou: nv.map((l) => ({ id: l.id, passageiroId: l.matricula_id, de: l.de, ate: l.ate, em: momentoDe(l.em), tiradoEm: l.tirado_em ? momentoDe(l.tirado_em) : null })),
  };
  return { respostas, momentos, fixas };
}

/** The answers of the last 60 days on (enough for today, the next days and the discounts of the month). */
export async function carregarRespostas(): Promise<void> {
  const sb = supabase();
  if (!USA_BANCO.destinos || !sb) return;
  const desde = somarDias(dataDeHoje(), -60);
  const [r, vs, nv] = await Promise.all([
    sb.from("respostas").select("matricula_id, data, resposta, respondida_em, prazo").gte("data", desde),
    sb.from("vou_sempre").select("matricula_id, desde, ate"),
    sb.from("nao_vou_periodos").select("id, matricula_id, de, ate, em, tirado_em"),
  ]);
  if (r.error || vs.error || nv.error) return;
  carregarRespostasDoBanco(respostasDasLinhas(r.data as LinhaResposta[], vs.data as LinhaVouSempre[], nv.data as LinhaNaoVou[]));
}

/** "Vou" / "Não vou". */
export async function responderNoBanco(matriculaId: string, data: string, resposta: RespostaViagem): Promise<Resultado> {
  if (!usaBanco()) return responder(matriculaId, data, resposta);
  const { error } = await supabase()!.rpc("responder", { matricula: matriculaId, dia: data, resposta });
  if (error) return naoDeu(motivo(error));
  const r = responder(matriculaId, data, resposta);
  // The database is what counts: if the screen's own rules disagree, read the answers again.
  if (!r.ok) await carregarRespostas();
  return deuCerto;
}

export async function ligarVouSempreNoBanco(matriculaId: string, ligar: boolean): Promise<Resultado> {
  if (!usaBanco()) return ligarVouSempre(matriculaId, ligar);
  const { error } = await supabase()!.rpc("ligar_vou_sempre", { matricula: matriculaId, ligar });
  if (error) return naoDeu(motivo(error));
  return ligarVouSempre(matriculaId, ligar);
}

export async function marcarNaoVouNoBanco(matriculaId: string, de: string, ate: string): Promise<Resultado> {
  if (!usaBanco()) return marcarNaoVouNoPeriodo(matriculaId, de, ate);
  const { data, error } = await supabase()!.rpc("marcar_nao_vou", { matricula: matriculaId, primeiro: de, ultimo: ate });
  if (error) return naoDeu(motivo(error));
  return marcarNaoVouNoPeriodo(matriculaId, de, ate, data as string);
}

export async function tirarNaoVouNoBanco(periodoId: string): Promise<Resultado> {
  if (!usaBanco()) return tirarNaoVouDoPeriodo(periodoId);
  const { error } = await supabase()!.rpc("tirar_nao_vou", { periodo: periodoId });
  if (error) return naoDeu(motivo(error));
  return tirarNaoVouDoPeriodo(periodoId);
}
