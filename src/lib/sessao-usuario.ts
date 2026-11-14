import { useSyncExternalStore } from "react";
import { vanzeiroExemplo, passageirosExemplo, passageiroExemplo, type Passageiro } from "@/data/exemplo";

/** Único usuário logado (vanzeiro ou passageiro), com papel e dados. */
export type Usuario = {
  id: string;
  papel: "vanzeiro" | "passageiro";
  nome: string;
  telefone: string;
  /** Específico de vanzeiro */
  pix?: string;
  van?: { modelo: string; placa: string };
  /** Específico de passageiro */
  passageiroId?: string | null;
  pedidoId?: string | null;
};

// Estado inicial: Juliana como passageira
const juliana = passageirosExemplo.find((p) => p.id === passageiroExemplo.passageiroId);
const inicial: Usuario = {
  id: passageiroExemplo.passageiroId,
  papel: "passageiro",
  nome: juliana?.nome ?? "",
  telefone: juliana?.telefone ?? "",
  passageiroId: passageiroExemplo.passageiroId,
  pedidoId: null,
};

let usuario = inicial;
const ouvintes = new Set<() => void>();

function inscrever(o: () => void) {
  ouvintes.add(o);
  return () => ouvintes.delete(o);
}

function notificar() {
  ouvintes.forEach((o) => o());
}

/** Usuário atualmente logado. */
export function useUsuarioAtual() {
  return useSyncExternalStore(inscrever, () => usuario, () => inicial);
}

/** ID do usuário (vanzeiro-carlos ou passageiro-id). */
export function useIdDoUsuario() {
  return useSyncExternalStore(inscrever, () => usuario.id, () => inicial.id);
}

/** Papel do usuário logado (vanzeiro ou passageiro). */
export function usePapelAtual() {
  return useSyncExternalStore(inscrever, () => usuario.papel, () => inicial.papel);
}

// -------- Funções para mudar de usuário --------

/** Criar conta nova de vanzeiro. */
export function logarComoVanzeiroNovo(nome: string) {
  usuario = {
    id: "vanzeiro-carlos",
    papel: "vanzeiro",
    nome: nome.trim(),
    telefone: "",
    pix: "",
    van: { modelo: "", placa: "" },
  };
  notificar();
}

/** Entrar como vanzeiro de exemplo. */
export function logarComoVanzeiroExemplo() {
  usuario = {
    id: "vanzeiro-carlos",
    papel: "vanzeiro",
    nome: vanzeiroExemplo.nomeCompleto,
    telefone: vanzeiroExemplo.telefone,
    pix: vanzeiroExemplo.pix,
    van: { ...vanzeiroExemplo.van },
  };
  notificar();
}

/** Criar conta nova de passageiro. */
export function logarComoPassageiroNovo(nome: string) {
  usuario = {
    id: "",
    papel: "passageiro",
    nome: nome.trim(),
    telefone: "",
    passageiroId: null,
    pedidoId: null,
  };
  notificar();
}

/** Entrar como passageiro de exemplo. */
export function logarComoPassageiroExemplo() {
  usuario = inicial;
  notificar();
}

/** Sair (voltar para exemplo). */
export function sair() {
  usuario = inicial;
  notificar();
}

/** Atualizar perfil do vanzeiro. */
export function atualizarPerfilVanzeiro(dados: Partial<Omit<Usuario, "id" | "papel">>) {
  if (usuario.papel !== "vanzeiro") return;
  usuario = { ...usuario, ...dados };
  notificar();
}

/** Atualizar dados do passageiro (nome, telefone). */
export function atualizarDadosPassageiro(nome: string, telefone: string) {
  if (usuario.papel !== "passageiro") return;
  usuario = { ...usuario, nome, telefone };
  notificar();
}

/** Criar pedido para entrar em um destino (passageiro). */
export function criarPedidoPassageiro(destinoId: string, nome: string, telefone: string) {
  if (usuario.papel !== "passageiro") return;
  usuario = {
    ...usuario,
    nome: nome.trim(),
    telefone,
    pedidoId: `pedido-temp-${Date.now()}`,
  };
  notificar();
}

/** Cancelar pedido (passageiro tenta outro código). */
export function cancelarPedidoPassageiro() {
  if (usuario.papel !== "passageiro") return;
  usuario = { ...usuario, pedidoId: null };
  notificar();
}

/** Trocar para vanzeiro ou passageiro (a partir do Perfil). */
export function trocarPapel(novo: "vanzeiro" | "passageiro") {
  if (novo === "vanzeiro" && usuario.papel === "passageiro") {
    logarComoVanzeiroExemplo();
  } else if (novo === "passageiro" && usuario.papel === "vanzeiro") {
    logarComoPassageiroExemplo();
  }
}
