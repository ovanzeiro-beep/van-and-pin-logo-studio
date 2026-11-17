import type { Destino, ViagemEncerrada } from "@/data/exemplo";
import { deuCerto, naoDeu, SEM_RESPOSTA, type Resultado } from "@/lib/acoes";
import { dataDeHoje, horaDeAgora, instanteDeAgora } from "@/lib/agora";
import { enviarPendentes, guardarSemSinal, semSinal, temPendente, viagensPendentes, type ViagemPendente } from "@/lib/banco/fila";
import { momentoDe } from "@/lib/banco/respostas";
import { obterPassageiros } from "@/lib/passageiros-store";
import { obterSessao } from "@/lib/sessao";
import { supabase, USA_BANCO } from "@/lib/supabase";
import { iniciarViagem, type FaseViagem, type ViagemDoDia } from "@/lib/viagem";
import {
  atualizarViagem,
  carregarViagensDoDia,
  comecarViagem,
  confirmarNaVan,
  emAndamento,
  marcarEmbarcou,
  marcarNaoEstava,
  obterViagensDoDia,
  restaurarViagem,
} from "@/lib/viagem-store";
import { carregarViagensEncerradas } from "@/lib/viagens-encerradas-store";

// W6 (docs/banco-de-dados.md, section 8.3): the trip in the database. Every tap of the vanzeiro (start, Embarcou,
// Não estava no ponto, stop, check, arrival, return, Desceu, end) is saved at once: if the app closes or reloads, the
// trip goes on from where it was. Without signal, the taps wait on the phone (src/lib/banco/fila.ts). The passenger never reads the whole trip (it has the other passengers): only their own
// situation (`minha_viagem_de_hoje`), and "Estou na van" goes through `estou_na_van`.

type LinhaViagem = { id: string; vanzeiro_id: string; destino_id: string; data: string; fase: FaseViagem; estado: ViagemDoDia; comecou_em: string; terminou_em: string | null };
type MinhaViagem = { viagem_id: string; fase: FaseViagem; na_ordem: boolean; embarcou: boolean; conferencia: "na-van" | "ficou" | null; comecou_em: string; volta_as?: string | null };

const usaBanco = () => USA_BANCO.destinos && supabase() !== null;

/** The whole row of a trip, as it goes to the database (and waits on the phone without signal). */
const linhaDaViagem = (v: ViagemDoDia): ViagemPendente => ({
  id: v.id,
  vanzeiro_id: v.vanzeiroId,
  destino_id: v.destinoId,
  data: v.data,
  fase: v.fase,
  estado: v,
  terminou_em: v.fase === "encerrada" ? instanteDeAgora() : null,
});

function motivo(erro: { message?: string; code?: string } | null): string {
  if (!erro) return SEM_RESPOSTA;
  if (erro.code === "23505" && /uma_em_andamento/.test(erro.message ?? "")) return "Já tem uma viagem acontecendo. Termine ela antes de começar outra.";
  if (erro.code === "23505") return "A viagem de hoje deste destino já foi feita.";
  if (erro.code === "P0001" && erro.message) return erro.message;
  if (/fetch|network/i.test(erro.message ?? "")) return SEM_RESPOSTA;
  return "Não deu para salvar. Tente de novo em instantes.";
}

/** How the passenger's phone sees today's trip: only their own place in it. */
export function viagemDoPassageiro(matriculaId: string, destino: Pick<Destino, "id" | "vanzeiroId">, m: MinhaViagem): ViagemDoDia {
  const naVan = m.conferencia === "na-van";
  return {
    id: m.viagem_id,
    vanzeiroId: destino.vanzeiroId,
    destinoId: destino.id,
    data: dataDeHoje(),
    temVolta: false,
    foto: { nome: "", saida: "", volta: "" },
    fase: m.fase,
    ordem: m.na_ordem ? [matriculaId] : [],
    embarcaram: m.embarcou ? [matriculaId] : [],
    naoEstavam: [],
    ficaram: m.conferencia === "ficou" ? [matriculaId] : [],
    conferencia: m.conferencia ? { [matriculaId]: m.conferencia } : {},
    peloCelular: naVan ? [matriculaId] : [],
    paradasIda: 0,
    paradasVolta: 0,
    naVolta: [],
    desceram: [],
    comecouEm: momentoDe(m.comecou_em).slice(11),
    voltaAs: m.volta_as ?? undefined,
  };
}

export const encerradaDaLinha = (l: LinhaViagem): ViagemEncerrada => ({
  vanzeiroId: l.vanzeiro_id,
  destinoId: l.destino_id,
  data: l.data,
  temVolta: l.estado.temVolta,
  foto: l.estado.foto,
  embarcaram: l.estado.embarcaram,
  naoEstavam: l.estado.naoEstavam,
  ficaram: l.estado.ficaram,
});

/** Today's trips (whole, for the vanzeiro; only their own place, for the passenger) and the finished ones before. */
export async function carregarViagens(): Promise<void> {
  const sb = supabase();
  if (!USA_BANCO.destinos || !sb) return;
  const hoje = dataDeHoje();
  // What was done without signal goes first.
  await enviarPendentes();
  const [deHoje, antes] = await Promise.all([
    sb.from("viagens").select("*").eq("data", hoje),
    sb.from("viagens").select("*").lt("data", hoje).eq("fase", "encerrada").order("data", { ascending: false }).limit(300),
  ]);
  if (deHoje.error || antes.error) return;
  const viagens: Record<string, ViagemDoDia> = {};
  for (const l of deHoje.data as LinhaViagem[]) viagens[l.destino_id] = l.estado;
  // Taps still waiting for signal are newer than what the database has.
  for (const l of viagensPendentes()) if (l.data === hoje) viagens[l.destino_id] = l.estado;
  // The passenger side: the destinos this account is in (and does not drive).
  const conta = obterSessao().conta;
  const minhas = conta ? obterPassageiros().filter((p) => p.pessoaId === conta.id && !viagens[p.destinoId]) : [];
  const vistas = await Promise.all(minhas.map((p) => sb.rpc("minha_viagem_de_hoje", { matricula: p.id }).then((r) => ({ p, linha: (r.data as MinhaViagem[] | null)?.[0] }))));
  for (const { p, linha } of vistas) if (linha) viagens[p.destinoId] = viagemDoPassageiro(p.id, { id: p.destinoId, vanzeiroId: p.vanzeiroId }, linha);
  carregarViagensDoDia(viagens);
  carregarViagensEncerradas((antes.data as LinhaViagem[]).map(encerradaDaLinha));
}

/** "Iniciar viagem": saved first; then the same steps as before (answers closed, faltas, "a van saiu"). */
export async function comecarViagemNoBanco(destino: Destino, ordem: string[]): Promise<Resultado> {
  if (!usaBanco()) return comecarViagem(destino, ordem);
  const v: ViagemDoDia = { ...iniciarViagem(destino, ordem, dataDeHoje()), comecouEm: horaDeAgora() };
  const { error } = await supabase()!.from("viagens").insert({ id: v.id, vanzeiro_id: v.vanzeiroId, destino_id: v.destinoId, data: v.data, fase: v.fase, estado: v });
  if (error && !semSinal(error)) return naoDeu(motivo(error));
  const r = comecarViagem(destino, ordem);
  // Without signal the trip starts anyway; it goes to the database when the signal comes back.
  const comecou = obterViagensDoDia().viagens[destino.id];
  if (error && r.ok && comecou) guardarSemSinal(linhaDaViagem(comecou));
  return r;
}

/** One step of the trip in progress: done on the screen, saved at once; if the database refuses, it goes back. */
async function passoNoBanco(passo: () => Resultado): Promise<Resultado> {
  if (!usaBanco()) return passo();
  const antes = emAndamento(obterViagensDoDia());
  const r = passo();
  if (!r.ok || !antes) return r;
  const depois = obterViagensDoDia().viagens[antes.destinoId];
  if (!depois || depois === antes) return r;
  // Something is already waiting for signal: this tap waits with it (in order), and they go together.
  if (temPendente(depois.id)) {
    guardarSemSinal(linhaDaViagem(depois));
    void enviarPendentes();
    return deuCerto;
  }
  const { error } = await supabase()!
    .from("viagens")
    .update({ fase: depois.fase, estado: depois, ...(depois.fase === "encerrada" ? { terminou_em: instanteDeAgora() } : {}) })
    .eq("id", depois.id);
  if (error && semSinal(error)) {
    guardarSemSinal(linhaDaViagem(depois));
    return deuCerto;
  }
  if (error) {
    restaurarViagem(antes);
    return naoDeu(motivo(error));
  }
  return deuCerto;
}

export const marcarEmbarcouNoBanco = (id: string) => passoNoBanco(() => marcarEmbarcou(id));
export const marcarNaoEstavaNoBanco = (id: string) => passoNoBanco(() => marcarNaoEstava(id));
export const atualizarViagemNoBanco = (fazer: (v: ViagemDoDia) => ViagemDoDia) => passoNoBanco(() => atualizarViagem(fazer));

/** "Estou na van" on the passenger's phone. */
export async function confirmarNaVanNoBanco(matriculaId: string): Promise<Resultado> {
  if (!usaBanco()) return confirmarNaVan(matriculaId);
  const destinoId = obterPassageiros().find((p) => p.id === matriculaId)?.destinoId;
  const viagem = destinoId ? obterViagensDoDia().viagens[destinoId] : undefined;
  if (!viagem) return naoDeu("Nenhuma viagem está acontecendo agora.");
  const { error } = await supabase()!.rpc("estou_na_van", { viagem: viagem.id, matricula: matriculaId });
  if (error) return naoDeu(motivo(error));
  await carregarViagens();
  return deuCerto;
}
