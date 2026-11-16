import { procurarCidades } from "@/lib/coordenadas-store";
import { caminhoCompleto } from "@/lib/destinos";
import { useSyncExternalStore } from "react";
import { destinosExemplo, type Destino } from "@/data/exemplo";
import { inicializarCodigosUsados } from "@/lib/convite";
import { useSoDoMeuPainel } from "@/lib/painel";
import { deuCerto, naoDeu, type Resultado } from "@/lib/acoes";

// Registrar códigos de exemplo como já usados
inicializarCodigosUsados(destinosExemplo);

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

export const obterDestinos = () => destinos;

export function useDestinos() {
  return useSoDoMeuPainel(useSyncExternalStore(inscrever, () => destinos, () => destinosExemplo));
}

export function useDestino(id: string) {
  return useDestinos().find((d) => d.id === id);
}

/** Adds a new destino at the top of the list, or replaces an existing one. */
export function salvarDestino(d: Destino): Resultado {
  if (destinos.some((x) => x.id !== d.id && x.convite === d.convite)) return naoDeu("Este código de convite já é de outro destino. Gere outro código.");
  destinos = destinos.some((x) => x.id === d.id)
    ? destinos.map((x) => (x.id === d.id ? d : x))
    : [d, ...destinos];
  avisar();
  // The map learns where the new cities are (origem first, so the others are searched near it).
  void procurarCidades(caminhoCompleto(d));
  return deuCerto;
}

/** Days without a trip (feriado): replaces the list of cancelled days of this destino. */
export function mudarDiasCancelados(id: string, dias: Destino["diasCancelados"]) {
  destinos = destinos.map((d) => (d.id === id ? { ...d, diasCancelados: dias } : d));
  avisar();
}

export function alternarAtivo(id: string) {
  destinos = destinos.map((d) => (d.id === id ? { ...d, ativo: !d.ativo } : d));
  avisar();
}

/** "Excluir destino". */
export function removerDestino(id: string) {
  destinos = destinos.filter((d) => d.id !== id);
  avisar();
}

/** New vanzeiro account: starts with no destinos. */
export function limparDestinos() {
  destinos = [];
  avisar();
}
