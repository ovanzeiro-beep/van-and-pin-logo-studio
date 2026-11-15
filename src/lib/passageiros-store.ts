import { useMemo, useSyncExternalStore } from "react";
import { passageirosExemplo, pedidosExemplo, type Passageiro, type PedidoEntrada } from "@/data/exemplo";
import { avaliarMudanca, type Embarque } from "@/lib/endereco";
import { atualizarMeusDados, identidadePassageiro, moverNaCidade, moverParaNaCidade, telefoneJaNoDestino, type MeusDados } from "@/lib/passageiros";
import { garantirProximaCobranca } from "@/lib/cobrancas-store";
import { criarAviso, useAvisosNaoLidos } from "@/lib/avisos-store";
import { dataDeHoje } from "@/lib/agora";
import { nomeDestino } from "@/lib/destinos";
import { obterDestinos } from "@/lib/destinos-store";
import { idDoVanzeiro } from "@/lib/sessao";

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
  return useSyncExternalStore(inscrever, obterPassageiros, () => passageirosExemplo);
}

export function usePedidos() {
  return useSyncExternalStore(inscrever, obterPedidos, () => pedidosExemplo);
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
  const avisosNaoLidos = useAvisosNaoLidos(idDoVanzeiro());
  return pedidosCount + avisosNaoLidos.length;
}

/** Adds or replaces a passenger. When it came from a pedido, the pedido leaves the waiting list. */
/** "↑ / ↓" in the destino: changes the pickup order inside the passenger's city. */
export function moverPassageiro(id: string, direcao: -1 | 1) {
  const nova = moverNaCidade(passageiros, id, direcao);
  if (nova === passageiros) return;
  matriculas = [...nova, ...saidas];
  avisar();
}

/** Dragging in the destino: the passenger takes the place of `alvoId` in the pickup order of their city. */
export function reordenarPassageiro(id: string, alvoId: string) {
  const nova = moverParaNaCidade(passageiros, id, alvoId);
  if (nova === passageiros) return;
  matriculas = [...nova, ...saidas];
  avisar();
}

export function salvarPassageiro(p: Passageiro, pedidoId?: string) {
  const existente = passageiros.find((x) => x.destinoId === p.destinoId && identidadePassageiro(x) === identidadePassageiro(p));
  if (existente && existente.id !== p.id) return;
  if (telefoneJaNoDestino(passageiros, p.destinoId, p.telefone, p)) return;
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
}

/** The passenger's own "Editar" on their Perfil (all destinos of the same person). */
export function salvarDadosDoPassageiro(euId: string, dados: MeusDados) {
  const eu = passageiros.find((p) => p.id === euId);
  if (!eu) return;
  const novos = atualizarMeusDados(passageiros, eu, dados);
  matriculas = matriculas.map((m) => novos.find((n) => n.id === m.id) ?? m);
  avisar();
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
  return useSyncExternalStore(inscrever, () => mudancasAguardando, () => SEM_MUDANCAS);
}

const embarqueDe = (p: Passageiro): Embarque => ({ cidade: p.cidade, endereco: p.endereco, ponto: p.ponto ?? null });

function aplicarEmbarque(id: string, e: Embarque) {
  matriculas = matriculas.map((p) => (p.id === id ? { ...p, cidade: e.cidade, endereco: e.endereco.trim(), ponto: e.ponto ?? undefined } : p));
}

/**
 * The passenger changes where they board: up to 1 km from the agreed point it is saved at once ("salvo");
 * farther, it waits for the vanzeiro ("aguardando") and the old address counts until then.
 */
export function mudarMeuEmbarque(matriculaId: string, novo: Embarque): "salvo" | "aguardando" | null {
  const p = passageiros.find((x) => x.id === matriculaId);
  if (!p) return null;
  const { distanciaKm, precisaAprovar } = avaliarMudanca(p, novo);
  const outras = mudancas.filter((m) => !(m.matriculaId === matriculaId && m.situacao === "aguardando"));
  if (!precisaAprovar) {
    mudancas = outras;
    aplicarEmbarque(matriculaId, novo);
    avisar();
    return "salvo";
  }
  mudancas = [
    ...outras,
    {
      id: `mudanca-${Date.now()}`,
      vanzeiroId: p.vanzeiroId,
      destinoId: p.destinoId,
      matriculaId,
      nome: p.nome,
      de: embarqueDe(p),
      para: { ...novo, endereco: novo.endereco.trim() },
      distanciaKm,
      pedidoEm: dataDeHoje(),
      situacao: "aguardando",
    },
  ];
  avisar();
  return "aguardando";
}

function responderMudanca(id: string, aceitar: boolean) {
  const m = mudancas.find((x) => x.id === id && x.situacao === "aguardando");
  if (!m || !passageiros.some((p) => p.id === m.matriculaId)) return;
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

export function recusarPedido(id: string) {
  const pedido = pedidos.find((p) => p.id === id);
  if (!pedido) return;
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
  const novo: PedidoEntrada = { ...pedido, id: `pedido-${Date.now()}`, situacao: "aguardando", pedidoEm: dataDeHoje() };
  todosPedidos = [...todosPedidos, novo];
  avisar();
  return novo.id;
}
