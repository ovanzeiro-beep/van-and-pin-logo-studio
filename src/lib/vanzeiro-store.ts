import { useSyncExternalStore } from "react";
import { primeiroNomeDe } from "@/lib/datas";
import { vanzeiroExemplo } from "@/data/exemplo";
import { telefoneValido } from "@/lib/passageiros";
import { idDoVanzeiro, useSessao } from "@/lib/sessao";
import { deuCerto, type Resultado } from "@/lib/acoes";

export type PerfilVanzeiro = {
  nome: string;
  telefone: string;
  pix: string;
  /** lugares: seats for passengers (null = não informado, nothing is limited). */
  van: { modelo: string; placa: string; lugares: number | null };
};

// One profile per vanzeiro (by vanzeiroId). The Pix key saved here is the one THEIR passengers see:
// a passenger always sees the vanzeiro of the destino (or charge) in question, never someone else's.
const inicial: PerfilVanzeiro = {
  nome: vanzeiroExemplo.nomeCompleto,
  telefone: vanzeiroExemplo.telefone,
  pix: vanzeiroExemplo.pix,
  van: { ...vanzeiroExemplo.van },
};
const perfisIniciais: Record<string, PerfilVanzeiro> = { [vanzeiroExemplo.id]: inicial };
let perfis = perfisIniciais;
/** A vanzeiro the app does not know (yet): blank, never another vanzeiro's data. */
export const PERFIL_VAZIO: PerfilVanzeiro = { nome: "", telefone: "", pix: "", van: { modelo: "", placa: "", lugares: null } };
const ouvintes = new Set<() => void>();

function inscrever(o: () => void) {
  ouvintes.add(o);
  return () => ouvintes.delete(o);
}

export const obterPerfilDoVanzeiro = (vanzeiroId: string) => perfis[vanzeiroId] ?? PERFIL_VAZIO;

/** Passenger screens: the vanzeiro of this destino or charge. */
export function usePerfilDoVanzeiro(vanzeiroId: string) {
  const todos = useSyncExternalStore(inscrever, () => perfis, () => perfisIniciais);
  return todos[vanzeiroId] ?? PERFIL_VAZIO;
}

/** The logged-in vanzeiro's own profile (vanzeiro panel). */
export const obterPerfilVanzeiro = () => obterPerfilDoVanzeiro(idDoVanzeiro());

export function usePerfilVanzeiro() {
  return usePerfilDoVanzeiro(useSessao().vanzeiroId);
}

/** Saves the logged-in vanzeiro's own profile. */
export function salvarPerfilVanzeiro(novo: PerfilVanzeiro): Resultado {
  perfis = { ...perfis, [idDoVanzeiro()]: novo };
  ouvintes.forEach((o) => o());
  return deuCerto;
}

/** New vanzeiro account: only the name typed in "Criar conta" is known. */
export function perfilNovo(nome: string) {
  salvarPerfilVanzeiro({ nome: nome.trim(), telefone: "", pix: "", van: { modelo: "", placa: "", lugares: null } });
}

/** Editar do Perfil: only name and phone are required; Pix and van may stay blank ("Não informado"). */
export const perfilPodeSalvar = (p: { nome: string; telefone: string }) => p.nome.trim() !== "" && telefoneValido(p.telefone);

/** First name for the header greeting. */
export const primeiroNome = (p: PerfilVanzeiro) => primeiroNomeDe(p.nome) || "Vanzeiro";

export const textoDaVan = (p: PerfilVanzeiro) => [p.van.modelo, p.van.placa].filter(Boolean).join(" · ");
