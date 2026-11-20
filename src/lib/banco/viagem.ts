import type { Destino, ViagemEncerrada } from "@/data/exemplo";
import { deuCerto, naoDeu, SEM_RESPOSTA, type Resultado } from "@/lib/acoes";
import { dataDeHoje, horaDeAgora, instanteDeAgora } from "@/lib/agora";
import { enviarPendentes, guardarSemSinal, semSinal, temPendente, viagensPendentes, type ViagemPendente } from "@/lib/banco/fila";
import { momentoDe } from "@/lib/banco/respostas";
import { registrarEmbarque, type Falta } from "@/lib/cobrancas-store";
import { obterPassageiros } from "@/lib/passageiros-store";
import { obterSessao } from "@/lib/sessao";
import { supabase, USA_BANCO } from "@/lib/supabase";
import {
  embarcou,
  iniciarViagem,
  naoEstava,
  type FaseViagem,
  type ViagemDoDia,
} from "@/lib/viagem";
import {
  atualizarViagem,
  carregarViagensDoDia,
  comecarViagem,
  confirmarNaVan,
  emAndamento,
  marcarEmbarcou,
  marcarNaoEstava,
  obterViagensDoDia,
} from "@/lib/viagem-store";
import { carregarViagensEncerradas } from "@/lib/viagens-encerradas-store";

// W6 (docs/banco-de-dados.md, section 8.3): the trip in the database. Every tap of the vanzeiro (start, Embarcou,
// Não estava no ponto, stop, check, arrival, return, Desceu, end) is saved at once: if the app closes or reloads, the
// trip goes on from where it was. Without signal, the taps wait on the phone (src/lib/banco/fila.ts). The passenger never reads the whole trip (it has the other passengers): only their own
// situation (`minha_viagem_de_hoje`), and "Estou na van" goes through `estou_na_van`.

type LinhaViagem = ViagemPendente & { comecou_em: string };
type MinhaViagem = {
  viagem_id: string;
  fase: FaseViagem;
  na_ordem: boolean;
  embarcou: boolean;
  conferencia: "na-van" | "ficou" | null;
  comecou_em: string;
  volta_as?: string | null;
  nao_estava?: boolean;
};

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
    naoEstavam: m.nao_estava ? [matriculaId] : [],
    ficaram: m.conferencia === "ficou" ? [matriculaId] : [],
    conferencia: m.conferencia ? { [matriculaId]: m.conferencia } : {},
    peloCelular: naVan ? [matriculaId] : [],
    paradasIda: 0,
    paradasVolta: 0,
    naVolta: [],
    desceram: [],
    comecouEm: momentoDe(m.comecou_em).slice(11),
    voltaAs: m.volta_as ?? undefined,
    // Only this person's place: the pickup order of the others is not on this phone (CORREÇÃO 4).
    parcial: true,
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
  const conta = obterSessao().conta;
  const mesmaConta = () => obterSessao().conta?.id === conta?.id;
  const pendentesDeHoje = () =>
    Object.fromEntries(
      viagensPendentes()
        .filter((l) => l.data === hoje)
        .map((l) => [l.destino_id, l.estado]),
    );
  const locais = pendentesDeHoje();
  if (Object.keys(locais).length > 0) {
    carregarViagensDoDia({ ...obterViagensDoDia().viagens, ...locais });
  }

  await enviarPendentes();
  if (!mesmaConta()) return;
  const [deHoje, antes] = await Promise.all([
    sb.from("viagens").select("*").eq("data", hoje),
    sb.from("viagens").select("*").lt("data", hoje).eq("fase", "encerrada").order("data", { ascending: false }).limit(300),
  ]);
  if (!mesmaConta()) return;
  if (!antes.error) carregarViagensEncerradas((antes.data as LinhaViagem[]).map(encerradaDaLinha));
  if (deHoje.error) return;

  const viagens = Object.fromEntries(
    (deHoje.data as LinhaViagem[]).map((l) => [l.destino_id, l.estado]),
  );
  // The passenger side only reads the passenger's own place in each trip.
  const minhas = conta ? obterPassageiros().filter((p) => p.pessoaId === conta.id && !viagens[p.destinoId]) : [];
  const vistas = await Promise.all(minhas.map((p) => sb.rpc("minha_viagem_de_hoje", { matricula: p.id }).then((r) => ({ p, linha: (r.data as MinhaViagem[] | null)?.[0] }))));
  if (!mesmaConta()) return;
  for (const { p, linha } of vistas) if (linha) viagens[p.destinoId] = viagemDoPassageiro(p.id, { id: p.destinoId, vanzeiroId: p.vanzeiroId }, linha);
  carregarViagensDoDia({ ...viagens, ...pendentesDeHoje() });
}

const SEM_ESPACO = "Não deu para guardar no aparelho. Libere espaço ou conecte-se e tente de novo.";

function guardarViagem(v: ViagemDoDia, faltas?: Falta[]): Resultado {
  return guardarSemSinal(linhaDaViagem(v), faltas) ? deuCerto : naoDeu(SEM_ESPACO);
}

/** "Iniciar viagem": save before closing answers and opening the trip. */
export async function comecarViagemNoBanco(destino: Destino, ordem: string[]): Promise<Resultado> {
  if (!usaBanco()) return comecarViagem(destino, ordem);
  const conta = obterSessao().conta?.id;
  const v: ViagemDoDia = { ...iniciarViagem(destino, ordem, dataDeHoje()), comecouEm: horaDeAgora() };
  const { error } = await supabase()!.from("viagens").insert({ id: v.id, vanzeiro_id: v.vanzeiroId, destino_id: v.destinoId, data: v.data, fase: v.fase, estado: v });
  if (obterSessao().conta?.id !== conta) return naoDeu(SEM_RESPOSTA);
  if (error && !semSinal(error)) return naoDeu(motivo(error));
  return comecarViagem(destino, ordem, error ? guardarViagem : undefined);
}

let passos = Promise.resolve<Resultado>(deuCerto);

/** Save first, so a tap that did not fit on the phone is never shown as accepted. */
function passoNoBanco(
  passo: (v: ViagemDoDia) => ViagemDoDia,
  embarqueId?: string,
): Promise<Resultado> {
  const conta = obterSessao().conta?.id;
  const executar = async (): Promise<Resultado> => {
    if (obterSessao().conta?.id !== conta) return naoDeu(SEM_RESPOSTA);
    const antes = emAndamento(obterViagensDoDia());
    if (!antes) return naoDeu("Nenhuma viagem está acontecendo agora.");
    let depois = passo(antes);
    if (depois === antes) return deuCerto;
    if (depois.fase === "encerrada") depois = { ...depois, terminouEm: horaDeAgora() };

    let pendente = temPendente(depois.id);
    if (!pendente) {
      const { error } = await supabase()!
        .from("viagens")
        .update({
          fase: depois.fase,
          estado: depois,
          ...(depois.fase === "encerrada" ? { terminou_em: instanteDeAgora() } : {}),
        })
        .eq("id", depois.id);
      if (obterSessao().conta?.id !== conta) return naoDeu(SEM_RESPOSTA);
      if (error && !semSinal(error)) return naoDeu(motivo(error));
      pendente = Boolean(error);
    }
    if (pendente) {
      const guardou = guardarViagem(depois);
      if (!guardou.ok) return guardou;
    }
    if (emAndamento(obterViagensDoDia())?.id !== antes.id) return naoDeu(SEM_RESPOSTA);
    const r = atualizarViagem(() => depois);
    if (pendente) void enviarPendentes();
    else if (r.ok && embarqueId) {
      const p = obterPassageiros().find((passageiro) => passageiro.id === embarqueId);
      if (p) registrarEmbarque(p, depois.data, depois.id);
    }
    return r;
  };
  passos = passos.then(executar, executar);
  return passos;
}

export const marcarEmbarcouNoBanco = (id: string) =>
  usaBanco() ? passoNoBanco((v) => embarcou(v, id), id) : marcarEmbarcou(id);
export const marcarNaoEstavaNoBanco = (id: string) =>
  usaBanco() ? passoNoBanco((v) => naoEstava(v, id)) : marcarNaoEstava(id);
export const atualizarViagemNoBanco = (passo: (v: ViagemDoDia) => ViagemDoDia) =>
  usaBanco() ? passoNoBanco(passo) : atualizarViagem(passo);

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
