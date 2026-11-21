import type { Destino } from "@/data/exemplo";
import { deuCerto, naoDeu, SEM_RESPOSTA, type Resultado } from "@/lib/acoes";
import { instanteDeAgora } from "@/lib/agora";
import { gerarConviteUnico, inicializarCodigosUsados } from "@/lib/convite";
import { cancelarViagemDoDia, desfazerCancelamento } from "@/lib/dias-sem-viagem";
import { carregarDestinos, obterDestinos, salvarDestino } from "@/lib/destinos-store";
import { excluirDestino, pausarOuAtivarDestino, viagemEmAndamentoNoDestino } from "@/lib/exclusoes";
import { supabase, USA_BANCO } from "@/lib/supabase";
import { carregarPerfis, obterPerfilDoVanzeiro, salvarPerfilVanzeiro, type PerfilVanzeiro } from "@/lib/vanzeiro-store";
import { obterPedidos } from "@/lib/passageiros-store";
import { dataDeHoje } from "@/lib/agora";
import { carregarDinheiro } from "@/lib/banco/dinheiro";

// W2 and W3 (docs/banco-de-dados.md, section 8.3): the vanzeiro's profile and the destinos in the database.
// Each action first saves in Supabase; only when the database says it worked does the screen change (the same
// rules as before run in memory). In the automatic tests (and if a part goes back to memory) it is memory only.

type LinhaDestino = {
  id: string;
  vanzeiro_id: string;
  origem: string;
  destino: string;
  tipo: Destino["tipo"];
  dias: Destino["dias"];
  data: string | null;
  saida: string;
  volta: string | null;
  volta_data: string | null;
  paradas: string[];
  cafe_parada: string | null;
  cafe_local?: string | null;
  cafe_minutos: number | null;
  convite: string;
  prazo: Destino["prazo"];
  ativo: boolean;
};
type LinhaDiaSemViagem = { destino_id: string; data: string; motivo: string; cancelado_em: string };
type LinhaPerfil = { id: string; nome: string; telefone: string; pix: string; van_modelo: string; van_placa: string; van_lugares: number | null; saiu_do_app_em?: string | null };

const usaBanco = () => USA_BANCO.destinos && supabase() !== null;

/** Supabase's answer in simple Portuguese (the rules of the database already speak Portuguese). */
function motivo(erro: { message?: string; code?: string } | null): string {
  if (!erro) return SEM_RESPOSTA;
  if (erro.code === "23505" && /convite/.test(erro.message ?? "")) return "Este código de convite já é de outro destino. Tente de novo.";
  if (erro.code === "P0001" && erro.message) return erro.message;
  if (/fetch|network/i.test(erro.message ?? "")) return SEM_RESPOSTA;
  return "Não deu para salvar. Tente de novo em instantes.";
}

export function destinoDaLinha(l: LinhaDestino, dias: LinhaDiaSemViagem[]): Destino {
  const meus = dias.filter((x) => x.destino_id === l.id).map((x) => ({ data: x.data, motivo: x.motivo, canceladoEm: x.cancelado_em }));
  return {
    id: l.id,
    vanzeiroId: l.vanzeiro_id,
    origem: l.origem,
    destino: l.destino,
    tipo: l.tipo,
    dias: l.dias ?? [],
    data: l.data,
    saida: l.saida,
    volta: l.volta,
    voltaData: l.volta_data,
    paradas: l.paradas ?? [],
    cafe: l.cafe_parada && l.cafe_minutos ? { parada: l.cafe_parada, minutos: l.cafe_minutos, ...(l.cafe_local ? { local: l.cafe_local } : {}) } : null,
    convite: l.convite,
    prazo: l.prazo,
    ativo: l.ativo,
    ...(meus.length > 0 ? { diasCancelados: meus } : {}),
  };
}

export function linhaDoDestino(d: Destino): LinhaDestino {
  return {
    id: d.id,
    vanzeiro_id: d.vanzeiroId,
    origem: d.origem,
    destino: d.destino,
    tipo: d.tipo,
    dias: d.dias,
    data: d.data,
    saida: d.saida,
    volta: d.volta,
    volta_data: d.voltaData,
    paradas: d.paradas,
    cafe_parada: d.cafe?.parada ?? null,
    cafe_local: d.cafe?.local ?? null,
    cafe_minutos: d.cafe?.minutos ?? null,
    convite: d.convite,
    prazo: d.prazo,
    ativo: d.ativo,
  };
}

export const perfilDaLinha = (l: LinhaPerfil): PerfilVanzeiro => ({
  nome: l.nome,
  telefone: l.telefone,
  pix: l.pix,
  van: { modelo: l.van_modelo, placa: l.van_placa, lugares: l.van_lugares },
  saiuDoAppEm: l.saiu_do_app_em ?? null,
});

/** On login: the profiles this person may see and their destinos (not deleted), from the database. */
export async function carregarPerfisEDestinos(): Promise<void> {
  const sb = supabase();
  if (!USA_BANCO.destinos || !sb) return;
  const [perfis, destinos, dias] = await Promise.all([
    sb.from("perfis_vanzeiro").select("id, nome, telefone, pix, van_modelo, van_placa, van_lugares, saiu_do_app_em"),
    sb.from("destinos").select("id, vanzeiro_id, origem, destino, tipo, dias, data, saida, volta, volta_data, paradas, cafe_parada, cafe_minutos, cafe_local, convite, prazo, ativo, criado_em").is("excluido_em", null).order("criado_em", { ascending: false }),
    sb.from("dias_sem_viagem").select("destino_id, data, motivo, cancelado_em"),
  ]);
  if (perfis.data) carregarPerfis(Object.fromEntries((perfis.data as LinhaPerfil[]).map((l) => [l.id, perfilDaLinha(l)])));
  if (destinos.data) {
    const lista = (destinos.data as LinhaDestino[]).map((l) => destinoDaLinha(l, (dias.data ?? []) as LinhaDiaSemViagem[]));
    inicializarCodigosUsados(lista);
    carregarDestinos(lista);
  }
}

/** "Salvar" in the destino steps. A new destino whose code is taken by another vanzeiro gets a new code. */
export async function salvarDestinoNoBanco(d: Destino): Promise<Resultado> {
  if (!usaBanco()) return salvarDestino(d);
  const sb = supabase()!;
  const novo = !obterDestinos().some((x) => x.id === d.id);
  let atual = d;
  for (let tentativa = 0; tentativa < 5; tentativa++) {
    // Correção 6: the database chooses the code (and never changes it): the app keeps the one it answers.
    const { data, error } = await sb.from("destinos").upsert(linhaDoDestino(atual)).select("convite").maybeSingle();
    if (!error) return salvarDestino(data?.convite ? { ...atual, convite: data.convite as string } : atual);
    if (!(novo && error.code === "23505" && /convite/.test(error.message ?? ""))) return naoDeu(motivo(error));
    atual = { ...atual, convite: gerarConviteUnico() };
  }
  return naoDeu("Não deu para criar um código de convite. Tente de novo.");
}

export async function pausarOuAtivarNoBanco(destinoId: string): Promise<Resultado> {
  const d = obterDestinos().find((x) => x.id === destinoId);
  if (!usaBanco() || !d) return pausarOuAtivarDestino(destinoId);
  // The memory rules first (a trip in progress can't be paused), then the database.
  const r = pausarOuAtivarDestino(destinoId);
  if (!r.ok) return r;
  const { error } = await supabase()!.from("destinos").update({ ativo: !d.ativo }).eq("id", destinoId);
  if (error) {
    pausarOuAtivarDestino(destinoId);
    return naoDeu(motivo(error));
  }
  return deuCerto;
}

export async function cancelarDiaNoBanco(destinoId: string, data: string, motivoTexto: string): Promise<Resultado> {
  if (!usaBanco()) return cancelarViagemDoDia(destinoId, data, motivoTexto);
  const r = cancelarViagemDoDia(destinoId, data, motivoTexto);
  if (!r.ok) return r;
  const dia = obterDestinos().find((x) => x.id === destinoId)?.diasCancelados?.find((x) => x.data === data);
  const { error } = await supabase()!.from("dias_sem_viagem").upsert({ destino_id: destinoId, data, motivo: dia?.motivo ?? motivoTexto.trim() });
  if (error) {
    desfazerCancelamento(destinoId, data);
    return naoDeu(motivo(error));
  }
  return deuCerto;
}

export async function desfazerDiaNoBanco(destinoId: string, data: string): Promise<Resultado> {
  if (!usaBanco()) return desfazerCancelamento(destinoId, data);
  const { error } = await supabase()!.from("dias_sem_viagem").delete().eq("destino_id", destinoId).eq("data", data);
  if (error) return naoDeu(motivo(error));
  return desfazerCancelamento(destinoId, data);
}

/** "Excluir destino": in the database it is marked as deleted (history and charges stay). */
export async function excluirDestinoNoBanco(destinoId: string): Promise<Resultado> {
  if (!usaBanco()) return excluirDestino(destinoId);
  if (viagemEmAndamentoNoDestino(destinoId)) return excluirDestino(destinoId);
  const sb = supabase()!;
  const { error } = await sb.from("destinos").update({ excluido_em: instanteDeAgora(), ativo: false }).eq("id", destinoId);
  if (error) return naoDeu(motivo(error));
  // Its passengers leave it and the waiting pedidos are refused (W4).
  await sb.from("matriculas").update({ saiu_em: dataDeHoje() }).eq("destino_id", destinoId).is("saiu_em", null);
  await Promise.all(obterPedidos().filter((x) => x.destinoId === destinoId).map((x) => sb.rpc("recusar_pedido", { pedido: x.id })));
  const r = excluirDestino(destinoId);
  // Correção 2: the database cancelled only the future periods; the screen reads the charges back.
  await carregarDinheiro().catch(() => false);
  return r;
}

/** "Salvar" in the vanzeiro's Perfil. */
export async function salvarPerfilNoBanco(vanzeiroId: string, perfil: PerfilVanzeiro): Promise<Resultado> {
  if (!usaBanco()) return salvarPerfilVanzeiro(perfil);
  // The same standard format as in memory (src/lib/formatos.ts), so the database gets exactly what the screen shows.
  const antes = obterPerfilDoVanzeiro(vanzeiroId);
  const r = salvarPerfilVanzeiro(perfil);
  const p = obterPerfilDoVanzeiro(vanzeiroId);
  const { error } = await supabase()!.from("perfis_vanzeiro").upsert({
    id: vanzeiroId,
    nome: p.nome,
    telefone: p.telefone,
    pix: p.pix,
    van_modelo: p.van.modelo,
    van_placa: p.van.placa,
    van_lugares: p.van.lugares,
  });
  if (error) {
    salvarPerfilVanzeiro(antes);
    return naoDeu(motivo(error));
  }
  return r;
}
