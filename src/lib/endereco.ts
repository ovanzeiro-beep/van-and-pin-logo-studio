import type { Destino, Passageiro } from "@/data/exemplo";
import { cidadesNoMapa, distanciaKm, pontoDoPassageiro, type Ponto } from "@/lib/mapa";
import { pontosDeEmbarque } from "@/lib/passageiros";

// Where the passenger boards (owner's decisions, 15/11/2026): the passenger fills it in (city, address and
// the point on the map, required when the map knows the destino); changing it later up to 1 km from the agreed
// point saves at once; farther than that, the vanzeiro approves, and the old address counts until then.

export const LIMITE_MUDANCA_KM = 1;

export type Embarque = { cidade: string; endereco: string; ponto: Ponto | null };

/** The point on the map is required when the map knows this destino's cities. */
export function pontoObrigatorio(d: Pick<Destino, "origem" | "destino" | "paradas">) {
  return cidadesNoMapa(d).length > 0;
}

export function embarqueCompleto(d: Pick<Destino, "origem" | "destino" | "paradas">, e: Embarque) {
  return pontosDeEmbarque(d).includes(e.cidade) && e.endereco.trim() !== "" && (!pontoObrigatorio(d) || e.ponto !== null);
}

/** How far the new point is from the agreed one (marked point, else the city center), and whether the vanzeiro must approve. */
export function avaliarMudanca(atual: Pick<Passageiro, "cidade" | "ponto">, novo: Embarque): { distanciaKm: number | null; precisaAprovar: boolean } {
  // No point agreed yet (registered by the vanzeiro): marking it for the first time in the same city saves at once.
  if (!atual.ponto && novo.cidade === atual.cidade) return { distanciaKm: null, precisaAprovar: false };
  const combinado = pontoDoPassageiro(atual);
  if (combinado && novo.ponto) {
    const km = distanciaKm(combinado, novo.ponto);
    return { distanciaKm: km, precisaAprovar: km > LIMITE_MUDANCA_KM };
  }
  // Without points to compare, only changing the city needs the vanzeiro.
  return { distanciaKm: null, precisaAprovar: novo.cidade !== atual.cidade };
}

/** "300 m", "3,2 km". */
export function textoDaDistancia(km: number) {
  if (km < 1) return `${Math.round((km * 1000) / 10) * 10} m`;
  return `${km.toFixed(1).replace(".", ",")} km`;
}
