import { useEffect, useSyncExternalStore } from "react";
import { coordenadasExemplo } from "@/data/exemplo";

// Where each city is on the map. Starts with the sample cities; any other city is looked up once in the free
// OpenStreetMap search (Nominatim) and kept. That service asks for at most one search per second and light use:
// enough for the pilot; selling to many vanzeiros needs a paid service (docs/fonte-da-verdade.md, section 15).

export type Ponto = { lat: number; lng: number };

let coordenadas: Record<string, Ponto> = { ...coordenadasExemplo };
const procurando = new Set<string>();
/** Searched and not found (a typo, for example): not searched again until the page reloads. */
const naoAchadas = new Set<string>();
const ouvintes = new Set<() => void>();

const inscrever = (o: () => void) => {
  ouvintes.add(o);
  return () => {
    ouvintes.delete(o);
  };
};

export const obterCoordenadas = () => coordenadas;

/** Changes whenever a search starts or ends, so a screen can show "Carregando o mapa…" (CORREÇÃO 4). */
let versaoDaBusca = 0;
const avisarBusca = () => {
  versaoDaBusca++;
  ouvintes.forEach((o) => o());
};

/** Whether any of these cities is being looked up right now. */
export function useProcurandoAlguma(nomes: string[]) {
  useSyncExternalStore(
    inscrever,
    () => versaoDaBusca,
    () => 0,
  );
  return nomes.some((n) => procurando.has(n.trim()));
}

export function useCoordenadas() {
  return useSyncExternalStore(inscrever, obterCoordenadas, () => coordenadasExemplo);
}

/** The free search: a city in Brazil, preferring the one near `perto` (cities with the same name exist in other states). */
async function buscarNoMapa(nome: string, perto?: Ponto): Promise<Ponto | null> {
  const caixa = perto ? `&viewbox=${perto.lng - 3},${perto.lat + 3},${perto.lng + 3},${perto.lat - 3}` : "";
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=br&accept-language=pt-BR&q=${encodeURIComponent(nome)}${caixa}`;
  const resposta = await fetch(url, { headers: { Accept: "application/json" } });
  if (!resposta.ok) throw new Error(`busca ${resposta.status}`);
  const lista = (await resposta.json()) as { lat: string; lon: string }[];
  const [primeiro] = lista;
  return primeiro ? { lat: Number(primeiro.lat), lng: Number(primeiro.lon) } : null;
}

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Looks up the cities the map does not know yet, one per second, near the first city of the list that is known
 * (the origem, usually). Without internet nothing is lost: it tries again the next time.
 */
export async function procurarCidades(
  nomes: string[],
  buscar: (nome: string, perto?: Ponto) => Promise<Ponto | null> = buscarNoMapa,
  intervaloMs = 1100,
) {
  const faltam = [...new Set(nomes.map((n) => n.trim()).filter(Boolean))].filter((n) => !coordenadas[n] && !procurando.has(n) && !naoAchadas.has(n));
  if (faltam.length === 0) return;
  faltam.forEach((n) => procurando.add(n));
  avisarBusca();
  try {
    for (const [i, nome] of faltam.entries()) {
      if (i > 0) await esperar(intervaloMs);
      const perto = nomes.map((n) => coordenadas[n.trim()]).find(Boolean);
      try {
        const ponto = await buscar(nome, perto);
        if (ponto) {
          coordenadas = { ...coordenadas, [nome]: ponto };
          ouvintes.forEach((o) => o());
        } else naoAchadas.add(nome);
      } catch {
        // No internet or the service is busy: try again later.
      }
    }
  } finally {
    faltam.forEach((n) => procurando.delete(n));
    avisarBusca();
  }
}

/** Screens with a map: looks up the missing cities of this trip when they open. */
export function useProcurarCidades(nomes: string[]) {
  const chave = nomes.join("|");
  useEffect(() => {
    void procurarCidades(chave.split("|"));
  }, [chave]);
}
