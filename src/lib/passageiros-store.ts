import { useMemo, useSyncExternalStore } from "react";
import { passageirosExemplo, pedidosExemplo, type Passageiro, type PedidoEntrada } from "@/data/exemplo";
import { avaliarMudanca, type Embarque } from "@/lib/endereco";
import { aplicarOrdemNaCidade } from "@/lib/organizar";
import { atualizarMeusDados, identidadePassageiro, moverParaNaCidade, somenteDigitos, telefoneJaNoDestino, type MeusDados } from "@/lib/passageiros";
import { garantirProximaCobranca } from "@/lib/cobrancas-store";
import { destinoCheio, VAN_CHEIA } from "@/lib/lugares";
import { obterPerfilDoVanzeiro } from "@/lib/vanzeiro-store";
import { criarAviso, useAvisosNaoLidos } from "@/lib/avisos-store";
import { dataDeHoje } from "@/lib/agora";
import { nomeDestino } from "@/lib/destinos";
import { obterDestinos } from "@/lib/destinos-store";
import { idDoVanzeiro } from "@/lib/sessao";
import { novoId } from "@/lib/ids";
import { useSoDoMeuPainel } from "@/lib/painel";
import { deuCerto, naoDeu, SEM_DESTINO, type Resultado } from "@/lib/acoes";
import { nomeProprio } from "@/lib/formatos";

// In-memory records for the visual stage: changes last until the page is reloaded.
// They are kept the way the database will keep them: every membership stays (with the day it ended),
// every pedido stays (with its situation). The lists the screens read are worked out from them.
let matriculas: Passageiro[] = numerarOrdem(passageirosExemplo);
let todosPedidos: PedidoEntrada[] = pedidosExemplo.map((p) => ({ ...p, situacao: "aguardando" as const }));

/** Address changes asked by passengers (see mudarMeuEmbarque). */
let mudancas: MudancaDeEndereco[] = [];
let mudancasAguardando: MudancaDeEndereco[] = [];
const SEM_MUDANCAS: MudancaDeEndereco[] = [];

// What the screens read (worked out again after every change).
let passageiros: Passageiro[] = [];
let pedidos: PedidoEntrada[] = [];
/** Accepted pedido → the passenger created from it, so the person who asked finds their van. */
let aceitos: Record<string, string> = {};
const SEM_ACEITOS: Record<string, string> = {};
/** Memberships that ended (destino deleted or the person left), so the person still sees what they owe there. */
let saidas: Passageiro[] = [];
const SEM_SAIDAS: Passageiro[] = [];
const ouvintes = new Set<() => void>();

/** Pickup order inside each city of each destino, as its own number (1, 2, 3…), following the list order. */
function numerarOrdem(lista: Passageiro[]): Passageiro[] {
  const contagem = new Map<string, number>();
  return lista.map((p) => {
    if (p.saiuEm) return p;
    const chave = `${p.destinoId}|${p.cidade}`;
    const ordem = (contagem.get(chave) ?? 0) + 1;
    contagem.set(chave, ordem);
    return p.ordem === ordem ? p : { ...p, ordem };
  });
}

function recalcular() {
  matriculas = numerarOrdem(matriculas);
  passageiros = matriculas.filter((p) => !p.saiuEm);
  saidas = matriculas.filter((p) => !!p.saiuEm);
  if (saidas.length === 0) saidas = SEM_SAIDAS;
  pedidos = todosPedidos.filter((p) => (p.situacao ?? "aguardando") === "aguardando");
  mudancasAguardando = mudancas.filter((m) => m.situacao === "aguardando");
  if (mudancasAguardando.length === 0) mudancasAguardando = SEM_MUDANCAS;
  aceitos = Object.fromEntries(todosPedidos.flatMap((p) => (p.situacao === "aceito" && p.matriculaId ? [[p.id, p.matriculaId]] : [])));
}
recalcular();

function avisar() {
  recalcular();
  ouvintes.forEach((o) => o());
}

export const obterMatriculas = () => matriculas;

/** Calls `o` after every change in passengers and pedidos (for the phone notifications). */
export function ouvirPassageiros(o: () => void) {
  ouvintes.add(o);
  return () => {
    ouvintes.delete(o);
  };
}
export const obterTodosOsPedidos = () => todosPedidos;

function inscrever(o: () => void) {
  ouvintes.add(o);
  return () => ouvintes.delete(o);
}

export const obterPassageiros = () => passageiros;
export const obterPedidos = () => pedidos;
export const obterSaidas = () => saidas;
export const obterAceitos = () => aceitos;

export function useSaidas() {
  return useSyncExternalStore(inscrever, obterSaidas, () => SEM_SAIDAS);
}

export function useAceitos() {
  return useSyncExternalStore(inscrever, () => aceitos, () => SEM_ACEITOS);
}

export function usePassageiros() {
  return useSoDoMeuPainel(useSyncExternalStore(inscrever, obterPassageiros, () => passageirosExemplo));
}

export function usePedidos() {
  return useSoDoMeuPainel(useSyncExternalStore(inscrever, obterPedidos, () => pedidosExemplo));
}

export function usePassageirosDoDestino(destinoId: string) {
  const lista = usePassageiros();
  return useMemo(() => lista.filter((p) => p.destinoId === destinoId), [lista, destinoId]);
}

export function usePedidosDoDestino(destinoId: string) {
  const lista = usePedidos();
  return useMemo(() => lista.filter((p) => p.destinoId === destinoId), [lista, destinoId]);
}

export function usePassageiro(id: string) {
  return usePassageiros().find((p) => p.id === id);
}

export function usePedido(id: string | undefined) {
  return usePedidos().find((p) => p.id === id);
}

/** Number shown on the bell: join requests + address changes to approve + unread notifications for the vanzeiro. */
export function useAvisosVanzeiro() {
  const pedidosCount = usePedidos().length + useMudancasAguardando().length;
  const avisosNaoLidos = useAvisosNaoLidos(idDoVanzeiro(), "vanzeiro");
  return pedidosCount + avisosNaoLidos.length;
}

/** Dragging in the destino: the passenger takes the place of `alvoId` in the pickup order of their city. */
export function reordenarPassageiro(id: string, alvoId: string): Resultado {
  if (!passageiros.some((p) => p.id === id)) return naoDeu("Não achamos este passageiro. Ele pode já ter saído do destino.");
  const nova = moverParaNaCidade(passageiros, id, alvoId);
  if (nova === passageiros) return deuCerto;
  matriculas = [...nova, ...saidas];
  avisar();
  return deuCerto;
}

/** N3: "Organizar pela distância" in one city: the new pickup order (the ids of that city, in order). */
export function organizarCidade(destinoId: string, cidade: string, ids: string[]): Resultado {
  const nova = aplicarOrdemNaCidade(passageiros, destinoId, cidade, ids);
  if (nova === passageiros) return deuCerto;
  matriculas = [...nova, ...saidas];
  avisar();
  return deuCerto;
}

/** conferirLugares: false when the database already accepted it (the database is what counts). */
export function salvarPassageiro(p: Passageiro, pedidoId?: string, conferirLugares = true): Resultado {
  const existente = passageiros.find((x) => x.destinoId === p.destinoId && identidadePassageiro(x) === identidadePassageiro(p));
  if (existente && existente.id !== p.id) return naoDeu("Esta pessoa já está neste destino.");
  // E1: a new person in the destino needs a free seat in the van.
  const entrando = !passageiros.some((x) => x.id === p.id && x.destinoId === p.destinoId);
  const ocupados = passageiros.filter((x) => x.destinoId === p.destinoId).length;
  if (conferirLugares && entrando && destinoCheio(ocupados, obterPerfilDoVanzeiro(p.vanzeiroId).van.lugares)) return naoDeu(VAN_CHEIA);
  if (telefoneJaNoDestino(passageiros, p.destinoId, p.telefone, p)) return naoDeu("Já tem outro passageiro com este telefone neste destino.");
  matriculas = matriculas.some((x) => x.id === p.id)
    ? matriculas.map((x) => (x.id === p.id ? p : x))
    : [...matriculas, p];
  const pedido = pedidoId ? pedidos.find((x) => x.id === pedidoId) : undefined;
  if (pedido) mudarPedido(pedido.id, { situacao: "aceito", matriculaId: p.id, respondidoEm: dataDeHoje() });
  avisar();
  garantirProximaCobranca(p);
  // The person who asked hears about it on the bell.
  if (pedido) {
    const destino = obterDestinos().find((d) => d.id === p.destinoId);
    criarAviso({
      vanzeiroId: p.vanzeiroId,
      tipo: "pedido_aceito",
      paraVanzeiroOuPassageiroId: identidadePassageiro(p),
      passageiroId: p.id,
      destinoId: p.destinoId,
      dataCriacao: dataDeHoje(),
      lido: false,
      textoResumido: `O vanzeiro aceitou seu pedido para ${destino ? nomeDestino(destino) : "o destino"}`,
    });
  }
  return deuCerto;
}

/** The passenger's own "Editar" on their Perfil (all destinos of the same person). */
export function salvarDadosDoPassageiro(euId: string, dados: MeusDados): Resultado {
  const eu = passageiros.find((p) => p.id === euId);
  if (!eu) return naoDeu(SEM_DESTINO);
  const novos = atualizarMeusDados(passageiros, eu, dados);
  matriculas = matriculas.map((m) => novos.find((n) => n.id === m.id) ?? m);
  avisar();
  return deuCerto;
}

// ---------- where the passenger boards: changes and the vanzeiro's approval ----------

export type MudancaDeEndereco = {
  id: string;
  vanzeiroId: string;
  destinoId: string;
  matriculaId: string;
  nome: string;
  de: Embarque;
  para: Embarque;
  distanciaKm: number | null;
  pedidoEm: string;
  /** "cancelada": the person left the destino (or was removed, or it was deleted) before the vanzeiro answered. */
  situacao: "aguardando" | "aceita" | "recusada" | "cancelada";
  respondidoEm?: string | undefined;
};


export const obterMudancasDeEndereco = () => mudancas;
export const obterMudancasAguardando = () => mudancasAguardando;

export function useMudancasAguardando() {
  return useSoDoMeuPainel(useSyncExternalStore(inscrever, () => mudancasAguardando, () => SEM_MUDANCAS));
}

const embarqueDe = (p: Passageiro): Embarque => ({ cidade: p.cidade, endereco: p.endereco, ponto: p.ponto ?? null });

function aplicarEmbarque(id: string, e: Embarque) {
  matriculas = matriculas.map((p) => (p.id === id ? { ...p, cidade: e.cidade, endereco: nomeProprio(e.endereco), ponto: e.ponto ?? undefined } : p));
}

/**
 * The passenger changes where they board: up to 1 km from the agreed point it is saved at once ("salvo");
 * farther, it waits for the vanzeiro ("aguardando") and the old address counts until then.
 */
export function mudarMeuEmbarque(matriculaId: string, novo: Embarque): ({ ok: true; situacao: "salvo" | "aguardando" }) | { ok: false; motivo: string } {
  const p = passageiros.find((x) => x.id === matriculaId);
  if (!p) return { ok: false, motivo: SEM_DESTINO };
  const { distanciaKm, precisaAprovar } = avaliarMudanca(p, novo);
  const outras = mudancas.filter((m) => !(m.matriculaId === matriculaId && m.situacao === "aguardando"));
  if (!precisaAprovar) {
    mudancas = outras;
    aplicarEmbarque(matriculaId, novo);
    avisar();
    return { ok: true, situacao: "salvo" };
  }
  mudancas = [
    ...outras,
    {
      id: novoId("mudanca"),
      vanzeiroId: p.vanzeiroId,
      destinoId: p.destinoId,
      matriculaId,
      nome: p.nome,
      de: embarqueDe(p),
      para: { ...novo, endereco: nomeProprio(novo.endereco) },
      distanciaKm,
      pedidoEm: dataDeHoje(),
      situacao: "aguardando",
    },
  ];
  avisar();
  return { ok: true, situacao: "aguardando" };
}

function responderMudanca(id: string, aceitar: boolean): Resultado {
  const m = mudancas.find((x) => x.id === id && x.situacao === "aguardando");
  if (!m) return naoDeu("Este pedido de endereço já foi respondido.");
  if (!passageiros.some((p) => p.id === m.matriculaId)) return naoDeu("Este passageiro já saiu do destino.");
  mudancas = mudancas.map((x) => (x.id === id ? { ...x, situacao: aceitar ? "aceita" : "recusada", respondidoEm: dataDeHoje() } : x));
  if (aceitar) aplicarEmbarque(m.matriculaId, m.para);
  avisar();
  const p = matriculas.find((x) => x.id === m.matriculaId);
  const destino = obterDestinos().find((d) => d.id === m.destinoId);
  if (p) {
    criarAviso({
      vanzeiroId: m.vanzeiroId,
      tipo: aceitar ? "endereco_aceito" : "endereco_recusado",
      paraVanzeiroOuPassageiroId: identidadePassageiro(p),
      passageiroId: p.id,
      destinoId: m.destinoId,
      dataCriacao: dataDeHoje(),
      lido: false,
      textoResumido: aceitar
        ? `O vanzeiro aceitou seu novo endereço: ${m.para.endereco}${destino ? `, em ${nomeDestino(destino)}` : ""}`
        : `O vanzeiro não aceitou o novo endereço. Continua valendo: ${m.de.endereco}`,
    });
  }
  return deuCerto;
}

export const aceitarMudancaDeEndereco = (id: string) => responderMudanca(id, true);
export const recusarMudancaDeEndereco = (id: string) => responderMudanca(id, false);

/** A destino was deleted: its passengers and pedidos leave with it. */
/** Whoever leaves takes their waiting address change along: it is cancelled, never applied later. */
function cancelarMudancasDe(matriculaIds: string[]) {
  const hoje = dataDeHoje();
  mudancas = mudancas.map((m) => (m.situacao === "aguardando" && matriculaIds.includes(m.matriculaId) ? { ...m, situacao: "cancelada", respondidoEm: hoje } : m));
}

export function removerDoDestino(destinoId: string) {
  const hoje = dataDeHoje();
  cancelarMudancasDe(passageiros.filter((p) => p.destinoId === destinoId).map((p) => p.id));
  matriculas = matriculas.map((p) => (p.destinoId === destinoId && !p.saiuEm ? { ...p, saiuEm: hoje } : p));
  for (const p of pedidos.filter((x) => x.destinoId === destinoId)) mudarPedido(p.id, { situacao: "recusado", respondidoEm: hoje });
  avisar();
}

function mudarPedido(id: string, mudanca: Partial<PedidoEntrada>) {
  todosPedidos = todosPedidos.map((p) => (p.id === id ? { ...p, ...mudanca } : p));
}

/** "Sair deste destino": the person leaves only this membership. */
export function sairDaMatricula(id: string) {
  const p = passageiros.find((x) => x.id === id);
  if (!p) return;
  cancelarMudancasDe([id]);
  matriculas = matriculas.map((x) => (x.id === id ? { ...x, saiuEm: dataDeHoje() } : x));
  avisar();
}

/**
 * G1: someone the vanzeiro added by hand (no account yet) asked to join the same destino with the same phone.
 * Instead of a second passenger, the vanzeiro links the person's account to that record ("Ligar ao cadastro").
 */
export function cadastroDoPedido(lista: Passageiro[], pedido: Pick<PedidoEntrada, "destinoId" | "telefone">) {
  return lista.find((x) => x.destinoId === pedido.destinoId && !x.pessoaId && somenteDigitos(x.telefone) === somenteDigitos(pedido.telefone));
}

/**
 * Correção 6 (Opção A): the vanzeiro no longer links directly. He gets a 6-digit code and sends it by WhatsApp to the
 * phone THAT WAS ALREADY IN THE RECORD; only when the person types it in the app does the account get the record.
 * Without the database (samples, tests) the same rule runs here; with it, the database does it.
 */
const confirmacoes = new Map<string, { codigo: string; matriculaId: string; tentativas: number; criadoEm: number }>();
/** The code is good for 10 minutes (Correção 6). */
export const VALIDADE_DO_CODIGO_MS = 10 * 60 * 1000;

export type CodigoDoCadastro = { ok: true; codigo: string; telefone: string; nome: string } | { ok: false; motivo: string };

export function pedirConfirmacaoDoCadastro(pedidoId: string, agora: string): CodigoDoCadastro {
  const pedido = pedidos.find((p) => p.id === pedidoId);
  if (!pedido) return { ok: false, motivo: "Este pedido já foi respondido." };
  const cadastro = cadastroDoPedido(passageiros, pedido);
  if (!cadastro) return { ok: false, motivo: "Não achamos um cadastro com este telefone neste destino." };
  const n = crypto.getRandomValues(new Uint32Array(1))[0]! % 1_000_000;
  const codigo = String(n).padStart(6, "0");
  confirmacoes.set(pedidoId, { codigo, matriculaId: cadastro.id, tentativas: 0, criadoEm: Date.now() });
  mudarPedido(pedidoId, { confirmacaoPedidaEm: agora });
  avisar();
  return { ok: true, codigo, telefone: cadastro.telefone, nome: cadastro.nome };
}

/** The answers of the database: 'ok', 'errado', 'bloqueado', 'vencido', 'sem_codigo', 'respondido', 'mudou'. */
export const RESPOSTA_DO_CODIGO: Record<string, string> = {
  errado: "Código errado. Confira a mensagem do vanzeiro e tente de novo.",
  bloqueado: "Muitas tentativas. Peça um código novo ao vanzeiro.",
  vencido: "Este código venceu (vale 10 minutos). Peça um código novo ao vanzeiro.",
  sem_codigo: "O vanzeiro ainda não mandou o código. Aguarde a mensagem dele.",
  respondido: "Este pedido já foi respondido.",
  mudou: "O cadastro mudou. Fale com o vanzeiro.",
};

export function confirmarCadastroComCodigo(pedidoId: string, codigo: string): Resultado {
  const pedido = pedidos.find((p) => p.id === pedidoId);
  if (!pedido) return naoDeu(RESPOSTA_DO_CODIGO["respondido"]!);
  const k = confirmacoes.get(pedidoId);
  if (!k) return naoDeu(RESPOSTA_DO_CODIGO["sem_codigo"]!);
  if (k.tentativas >= 5) return naoDeu(RESPOSTA_DO_CODIGO["bloqueado"]!);
  if (Date.now() - k.criadoEm > VALIDADE_DO_CODIGO_MS) return naoDeu(RESPOSTA_DO_CODIGO["vencido"]!);
  if (somenteDigitos(codigo) !== k.codigo) {
    k.tentativas++;
    return naoDeu(RESPOSTA_DO_CODIGO[k.tentativas >= 5 ? "bloqueado" : "errado"]!);
  }
  const cadastro = passageiros.find((x) => x.id === k.matriculaId && !x.pessoaId && somenteDigitos(x.telefone) === somenteDigitos(pedido.telefone));
  if (!cadastro) return naoDeu(RESPOSTA_DO_CODIGO["mudou"]!);
  confirmacoes.delete(pedidoId);
  ligarAoCadastro(pedido, cadastro);
  return deuCerto;
}

/** The database already linked (the person typed the right code): the screen follows. */
export function cadastroLigado(pedidoId: string): Resultado {
  const pedido = pedidos.find((p) => p.id === pedidoId);
  const cadastro = pedido && cadastroDoPedido(passageiros, pedido);
  if (!pedido || !cadastro) return deuCerto;
  confirmacoes.delete(pedidoId);
  ligarAoCadastro(pedido, cadastro);
  return deuCerto;
}

function ligarAoCadastro(pedido: PedidoEntrada, cadastro: Passageiro) {
  const ligado = { ...cadastro, ...(pedido.pessoaId ? { pessoaId: pedido.pessoaId } : {}) };
  matriculas = matriculas.map((x) => (x.id === cadastro.id ? ligado : x));
  mudarPedido(pedido.id, { situacao: "aceito", matriculaId: cadastro.id, respondidoEm: dataDeHoje() });
  avisar();
}

export function recusarPedido(id: string): Resultado {
  const pedido = pedidos.find((p) => p.id === id);
  if (!pedido) return naoDeu("Este pedido já foi respondido.");
  mudarPedido(id, { situacao: "recusado", respondidoEm: dataDeHoje() });
  avisar();
  // Someone already in the van (asking for another destino) hears about it on the bell.
  if (pedido?.pessoaId) {
    const destino = obterDestinos().find((d) => d.id === pedido.destinoId);
    criarAviso({
      vanzeiroId: pedido.vanzeiroId,
      tipo: "pedido_recusado",
      paraVanzeiroOuPassageiroId: pedido.pessoaId,
      destinoId: pedido.destinoId,
      dataCriacao: dataDeHoje(),
      lido: false,
      textoResumido: `O vanzeiro não aceitou seu pedido para ${destino ? nomeDestino(destino) : "o destino"}`,
    });
  }
  return deuCerto;
}

/** W4: what came from the database (memberships, pedidos, address changes) replaces what is in memory. */
export function carregarPassageirosDoBanco(d: { matriculas: Passageiro[]; pedidos: PedidoEntrada[]; mudancas: MudancaDeEndereco[] }) {
  matriculas = d.matriculas;
  todosPedidos = d.pedidos;
  mudancas = d.mudancas;
  avisar();
}

/** New vanzeiro account: no passengers, no pedidos. */
export function limparPassageiros() {
  matriculas = [];
  todosPedidos = [];
  mudancas = [];
  avisar();
}

/** A person used an invite code: the request waits on the vanzeiro's bell. */
export function adicionarPedido(pedido: Omit<PedidoEntrada, "id">) {
  const novo: PedidoEntrada = { ...pedido, id: novoId("pedido"), situacao: "aguardando", pedidoEm: dataDeHoje() };
  todosPedidos = [...todosPedidos, novo];
  avisar();
  return novo.id;
}
