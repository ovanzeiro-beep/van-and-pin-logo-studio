import { useEffect } from "react";
import type { Passageiro, PedidoEntrada } from "@/data/exemplo";
import { deuCerto, naoDeu, SEM_RESPOSTA, type Resultado } from "@/lib/acoes";
import { carregarPerfisEDestinos } from "@/lib/banco/destinos";
import type { Embarque } from "@/lib/endereco";
import { removerPassageiroDoDestino, sairDoDestino } from "@/lib/exclusoes";
import { nomeDePessoa, nomeProprio } from "@/lib/formatos";
import {
  aceitarMudancaDeEndereco,
  carregarPassageirosDoBanco,
  obterMatriculas,
  obterPassageiros,
  obterPedidos,
  recusarMudancaDeEndereco,
  recusarPedido,
  reordenarPassageiro,
  salvarPassageiro,
  type MudancaDeEndereco,
} from "@/lib/passageiros-store";
import { somenteDigitos, type MeusDados } from "@/lib/passageiros";
import { mudarSessaoPassageiro, obterSessao } from "@/lib/sessao";
import { salvarMeusDados } from "@/lib/sessao-passageiro";
import { supabase, USA_BANCO } from "@/lib/supabase";
import { carregarRespostas } from "@/lib/banco/respostas";
import { carregarViagens } from "@/lib/banco/viagem";
import { carregarDinheiro } from "@/lib/banco/dinheiro";
import { carregarAvisos } from "@/lib/banco/avisos";

// W4 (docs/banco-de-dados.md, section 8.3): memberships (passengers in a destino), join requests and address changes
// in the database. Invite → pedido → accepted → passenger panel works between two phones: the app looks for news
// every 30 seconds and when it comes back to the screen. Each action saves in Supabase first; then the screen changes.

type LinhaMatricula = {
  id: string;
  vanzeiro_id: string;
  destino_id: string;
  pessoa_id: string | null;
  nome: string;
  telefone: string;
  cidade: string;
  endereco: string;
  ponto_lat: number | null;
  ponto_lng: number | null;
  ordem: number | null;
  plano: Passageiro["plano"];
  valor: number;
  vencimento: number | null;
  desconta_faltas: boolean;
  valor_falta: number | null;
  saiu_em: string | null;
};
type LinhaPedido = {
  id: string;
  vanzeiro_id: string;
  destino_id: string;
  pessoa_id: string | null;
  nome: string;
  telefone: string;
  cidade: string | null;
  endereco: string | null;
  ponto_lat: number | null;
  ponto_lng: number | null;
  situacao: NonNullable<PedidoEntrada["situacao"]>;
  matricula_id: string | null;
  pedido_em: string;
  respondido_em: string | null;
};
type LinhaMudanca = {
  id: string;
  vanzeiro_id: string;
  destino_id: string;
  matricula_id: string;
  nome: string;
  de: Embarque;
  para: Embarque;
  distancia_km: number | null;
  pedido_em: string;
  situacao: MudancaDeEndereco["situacao"];
  respondido_em: string | null;
};

const usaBanco = () => USA_BANCO.destinos && supabase() !== null;
const ponto = (lat: number | null, lng: number | null) => (lat !== null && lng !== null ? { lat, lng } : undefined);

function motivo(erro: { message?: string; code?: string } | null): string {
  if (!erro) return SEM_RESPOSTA;
  if (erro.code === "P0001" && erro.message) return erro.message;
  if (erro.code === "23505" && /telefone/.test(erro.message ?? "")) return "Já tem outro passageiro com este telefone neste destino.";
  if (erro.code === "23505") return "Esta pessoa já está neste destino.";
  if (/fetch|network/i.test(erro.message ?? "")) return SEM_RESPOSTA;
  return "Não deu para salvar. Tente de novo em instantes.";
}

export function passageiroDaLinha(l: LinhaMatricula): Passageiro {
  const p = ponto(l.ponto_lat, l.ponto_lng);
  return {
    id: l.id,
    vanzeiroId: l.vanzeiro_id,
    destinoId: l.destino_id,
    ...(l.pessoa_id ? { pessoaId: l.pessoa_id } : {}),
    nome: l.nome,
    telefone: l.telefone,
    cidade: l.cidade,
    endereco: l.endereco,
    plano: l.plano,
    valor: l.valor,
    vencimento: l.vencimento,
    descontaFaltas: l.desconta_faltas,
    valorFalta: l.valor_falta,
    ...(l.ordem !== null ? { ordem: l.ordem } : {}),
    ...(p ? { ponto: p } : {}),
    ...(l.saiu_em ? { saiuEm: l.saiu_em } : {}),
  };
}

/** The columns the vanzeiro can save (never the account of the person: that only comes through the accepted pedido). */
export function linhaDoPassageiro(p: Passageiro) {
  return {
    id: p.id,
    vanzeiro_id: p.vanzeiroId,
    destino_id: p.destinoId,
    nome: p.nome,
    telefone: p.telefone,
    cidade: p.cidade,
    endereco: p.endereco,
    ponto_lat: p.ponto?.lat ?? null,
    ponto_lng: p.ponto?.lng ?? null,
    ordem: p.ordem ?? null,
    plano: p.plano,
    valor: p.valor,
    vencimento: p.vencimento,
    desconta_faltas: p.descontaFaltas,
    valor_falta: p.valorFalta,
  };
}

export const pedidoDaLinha = (l: LinhaPedido): PedidoEntrada => ({
  id: l.id,
  vanzeiroId: l.vanzeiro_id,
  destinoId: l.destino_id,
  ...(l.pessoa_id ? { pessoaId: l.pessoa_id } : {}),
  nome: l.nome,
  telefone: l.telefone,
  ...(l.cidade ? { cidade: l.cidade } : {}),
  ...(l.endereco ? { endereco: l.endereco } : {}),
  ...(ponto(l.ponto_lat, l.ponto_lng) ? { ponto: ponto(l.ponto_lat, l.ponto_lng) } : {}),
  situacao: l.situacao,
  ...(l.matricula_id ? { matriculaId: l.matricula_id } : {}),
  pedidoEm: l.pedido_em,
  ...(l.respondido_em ? { respondidoEm: l.respondido_em } : {}),
});

const mudancaDaLinha = (l: LinhaMudanca): MudancaDeEndereco => ({
  id: l.id,
  vanzeiroId: l.vanzeiro_id,
  destinoId: l.destino_id,
  matriculaId: l.matricula_id,
  nome: l.nome,
  de: { cidade: l.de.cidade, endereco: l.de.endereco, ponto: l.de.ponto ?? null },
  para: { cidade: l.para.cidade, endereco: l.para.endereco, ponto: l.para.ponto ?? null },
  distanciaKm: l.distancia_km,
  pedidoEm: l.pedido_em,
  situacao: l.situacao,
  ...(l.respondido_em ? { respondidoEm: l.respondido_em } : {}),
});

/** Memberships, pedidos and address changes this person may see (as vanzeiro and as passenger). */
export async function carregarPassageirosEPedidos(): Promise<void> {
  const sb = supabase();
  if (!USA_BANCO.destinos || !sb) return;
  const [m, p, mu] = await Promise.all([
    sb.from("matriculas").select("*").order("destino_id").order("cidade").order("ordem", { ascending: true, nullsFirst: false }),
    sb.from("pedidos").select("*").order("pedido_em"),
    sb.from("mudancas_endereco").select("*").order("pedido_em"),
  ]);
  if (m.error || p.error || mu.error) return;
  carregarPassageirosDoBanco({
    matriculas: (m.data as LinhaMatricula[]).map(passageiroDaLinha),
    pedidos: (p.data as LinhaPedido[]).map(pedidoDaLinha),
    mudancas: (mu.data as LinhaMudanca[]).map(mudancaDaLinha),
  });
  // The passenger side: without a van, a pedido of this account still waiting puts the screen on "aguardando".
  // Only a waiting one: an old pedido (accepted in a destino that was deleted, or refused) never takes the person
  // away from the invite code screen while they type a new code. A refusal shows in the bell.
  const conta = obterSessao().conta;
  if (conta && !obterPassageiros().some((x) => x.pessoaId === conta.id)) {
    const esperando = (p.data as LinhaPedido[]).filter((x) => x.pessoa_id === conta.id && x.situacao === "aguardando").at(-1);
    const atual = obterSessao().passageiro.pedidoId;
    // An accepted pedido of a destino that no longer has this person (deleted, or they left): back to the code screen.
    const aceitoSemDestino = (p.data as LinhaPedido[]).some((x) => x.id === atual && x.situacao === "aceito");
    if (esperando && atual !== esperando.id) mudarSessaoPassageiro({ pedidoId: esperando.id });
    else if (!esperando && aceitoSemDestino) mudarSessaoPassageiro({ pedidoId: null });
  }
}

/** Everything the screens show, read again from the database. */
export async function atualizarDoBanco(): Promise<void> {
  await carregarPerfisEDestinos();
  await carregarPassageirosEPedidos();
  await carregarRespostas();
  await carregarViagens();
  await carregarDinheiro();
  await carregarAvisos();
}

/** In the root of the app: news from the other phones every 30 seconds and when the app comes back to the screen. */
export function useNovidadesDoBanco() {
  useEffect(() => {
    if (!USA_BANCO.destinos) return;
    const atualizar = () => {
      if (obterSessao().conta && document.visibilityState === "visible") void atualizarDoBanco();
    };
    const t = setInterval(atualizar, 30_000);
    document.addEventListener("visibilitychange", atualizar);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", atualizar);
    };
  }, []);
}

// ---------- passenger ----------

/** "Pedir para entrar" with the invite code (the database finds the destino and the vanzeiro). */
export async function pedirParaEntrarNoBanco(convite: string, nome: string, telefone: string, embarque?: Embarque): Promise<Resultado> {
  const sb = supabase();
  if (!usaBanco() || !sb) return naoDeu(SEM_RESPOSTA);
  const { data, error } = await sb.rpc("pedir_para_entrar", {
    codigo: convite,
    nome: nomeDePessoa(nome),
    telefone: somenteDigitos(telefone),
    cidade: embarque?.cidade ?? null,
    endereco: embarque ? nomeProprio(embarque.endereco) : null,
    lat: embarque?.ponto?.lat ?? null,
    lng: embarque?.ponto?.lng ?? null,
  });
  if (error) return naoDeu(motivo(error));
  mudarSessaoPassageiro({ nome: nomeDePessoa(nome), telefone: somenteDigitos(telefone), pedidoId: data as string });
  await carregarPassageirosEPedidos();
  return deuCerto;
}

/** "Mudar onde embarco": the database measures the distance (up to 1 km saves; farther waits for the vanzeiro). */
export async function mudarMeuEmbarqueNoBanco(matriculaId: string, novo: Embarque): Promise<{ ok: true; situacao: "salvo" | "aguardando" } | { ok: false; motivo: string }> {
  const sb = supabase()!;
  const { data, error } = await sb.rpc("mudar_meu_embarque", {
    matricula: matriculaId,
    nova_cidade: novo.cidade,
    novo_endereco: nomeProprio(novo.endereco),
    lat: novo.ponto?.lat ?? null,
    lng: novo.ponto?.lng ?? null,
    distancia_km: null,
  });
  if (error) return { ok: false, motivo: motivo(error) };
  await carregarPassageirosEPedidos();
  return { ok: true, situacao: data === "aguardando" ? "aguardando" : "salvo" };
}

export async function salvarMeusDadosNoBanco(euId: string, dados: MeusDados): Promise<Resultado> {
  if (!usaBanco()) return salvarMeusDados(euId, dados);
  const { error } = await supabase()!.rpc("salvar_meus_dados", { novo_nome: nomeDePessoa(dados.nome), novo_telefone: somenteDigitos(dados.telefone) });
  if (error) return naoDeu(motivo(error));
  return salvarMeusDados(euId, dados);
}

export async function sairDoDestinoNoBanco(matriculaId: string): Promise<Resultado> {
  if (!usaBanco()) return sairDoDestino(matriculaId);
  const { error } = await supabase()!.rpc("sair_do_destino", { matricula: matriculaId });
  if (error) return naoDeu(motivo(error));
  return sairDoDestino(matriculaId);
}

// ---------- vanzeiro ----------

/** "Salvar" in the passenger steps: accepting a pedido (the membership is born with the person's account), a new
 * passenger registered by the vanzeiro, or an edit. */
export async function salvarPassageiroNoBanco(p: Passageiro, pedidoId?: string): Promise<Resultado> {
  if (!usaBanco()) return salvarPassageiro(p, pedidoId);
  const sb = supabase()!;
  if (pedidoId) {
    const { data, error } = await sb.rpc("aceitar_pedido", { pedido: pedidoId, matricula: linhaDoPassageiro(p) });
    if (error) return naoDeu(motivo(error));
    const pessoaId = obterPedidos().find((x) => x.id === pedidoId)?.pessoaId;
    return salvarPassageiro({ ...p, id: (data as string) ?? p.id, ...(pessoaId ? { pessoaId } : {}) }, pedidoId);
  }
  const existe = obterMatriculas().some((x) => x.id === p.id);
  const linha = linhaDoPassageiro(p);
  const { error } = existe ? await sb.from("matriculas").update(linha).eq("id", p.id) : await sb.from("matriculas").insert(linha);
  if (error) return naoDeu(motivo(error));
  return salvarPassageiro(p);
}

export async function recusarPedidoNoBanco(pedidoId: string): Promise<Resultado> {
  if (!usaBanco()) return recusarPedido(pedidoId);
  const { error } = await supabase()!.rpc("recusar_pedido", { pedido: pedidoId });
  if (error) return naoDeu(motivo(error));
  return recusarPedido(pedidoId);
}

export async function responderMudancaNoBanco(mudancaId: string, aceitar: boolean): Promise<Resultado> {
  if (!usaBanco()) return aceitar ? aceitarMudancaDeEndereco(mudancaId) : recusarMudancaDeEndereco(mudancaId);
  const { error } = await supabase()!.rpc("responder_mudanca", { mudanca: mudancaId, aceitar });
  if (error) return naoDeu(motivo(error));
  return aceitar ? aceitarMudancaDeEndereco(mudancaId) : recusarMudancaDeEndereco(mudancaId);
}

export async function removerPassageiroNoBanco(matriculaId: string): Promise<Resultado> {
  if (!usaBanco()) return removerPassageiroDoDestino(matriculaId);
  const r = removerPassageiroDoDestino(matriculaId);
  if (!r.ok) return r;
  const saiu = obterMatriculas().find((x) => x.id === matriculaId)?.saiuEm ?? null;
  const { error } = await supabase()!.from("matriculas").update({ saiu_em: saiu }).eq("id", matriculaId);
  if (error) {
    await carregarPassageirosEPedidos();
    return naoDeu(motivo(error));
  }
  return deuCerto;
}

/** Dragging the name: the new pickup order of that city is saved for each passenger. */
export async function reordenarNoBanco(id: string, alvoId: string): Promise<Resultado> {
  if (!usaBanco()) return reordenarPassageiro(id, alvoId);
  const r = reordenarPassageiro(id, alvoId);
  if (!r.ok) return r;
  const movido = obterPassageiros().find((x) => x.id === id);
  if (!movido) return r;
  const daCidade = obterPassageiros().filter((x) => x.destinoId === movido.destinoId && x.cidade === movido.cidade);
  const resultados = await Promise.all(daCidade.map((x) => supabase()!.from("matriculas").update({ ordem: x.ordem ?? null }).eq("id", x.id)));
  const erro = resultados.find((x) => x.error)?.error ?? null;
  if (erro) {
    await carregarPassageirosEPedidos();
    return naoDeu(motivo(erro));
  }
  return deuCerto;
}

