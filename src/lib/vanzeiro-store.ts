import { useSyncExternalStore } from "react";
import { vanzeiroExemplo } from "@/data/exemplo";

export type PerfilVanzeiro = {
  nome: string;
  telefone: string;
  pix: string;
  van: { modelo: string; placa: string };
};

// The vanzeiro's profile. The Pix key saved here is the one passengers see.
const inicial: PerfilVanzeiro = {
  nome: vanzeiroExemplo.nomeCompleto,
  telefone: vanzeiroExemplo.telefone,
  pix: vanzeiroExemplo.pix,
  van: { ...vanzeiroExemplo.van },
};
let perfil = inicial;
const ouvintes = new Set<() => void>();

function inscrever(o: () => void) {
  ouvintes.add(o);
  return () => ouvintes.delete(o);
}

export function usePerfilVanzeiro() {
  return useSyncExternalStore(inscrever, () => perfil, () => inicial);
}

export function salvarPerfilVanzeiro(novo: PerfilVanzeiro) {
  perfil = novo;
  ouvintes.forEach((o) => o());
}

export const textoDaVan = (p: PerfilVanzeiro) => `${p.van.modelo} · ${p.van.placa}`;
