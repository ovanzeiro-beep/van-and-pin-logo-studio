import { useSyncExternalStore } from "react";
import { destinosExemplo, type Destino } from "@/data/exemplo";

// In-memory list for the visual stage: changes last until the page is reloaded.
let destinos: Destino[] = destinosExemplo;
const ouvintes = new Set<() => void>();

function avisar() {
  ouvintes.forEach((o) => o());
}

function inscrever(o: () => void) {
  ouvintes.add(o);
  return () => ouvintes.delete(o);
}

export function useDestinos() {
  return useSyncExternalStore(inscrever, () => destinos, () => destinosExemplo);
}

export function useDestino(id: string) {
  return useDestinos().find((d) => d.id === id);
}

/** Adds a new destino at the top of the list, or replaces an existing one. */
export function salvarDestino(d: Destino) {
  destinos = destinos.some((x) => x.id === d.id)
    ? destinos.map((x) => (x.id === d.id ? d : x))
    : [d, ...destinos];
  avisar();
}

export function alternarAtivo(id: string) {
  destinos = destinos.map((d) => (d.id === id ? { ...d, ativo: !d.ativo } : d));
  avisar();
}
