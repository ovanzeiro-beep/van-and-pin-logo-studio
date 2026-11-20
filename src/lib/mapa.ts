import type { Destino, Passageiro } from "@/data/exemplo";
import { obterCoordenadas } from "@/lib/coordenadas-store";
import { caminhoCompleto } from "@/lib/destinos";

// The trip on the map: the route's cities and the passenger's own point. CORREÇÃO 4 (20/11/2026): the van's position
// is NOT shown. There is no real GPS yet, and the old simulated van (and its "chega em N min") looked real; both were
// removed. Real GPS stays out of the current scope (decision of the owner).

export type Ponto = { lat: number; lng: number };

function coordenadaDaCidade(nome: string): Ponto | null {
  return obterCoordenadas()[nome] ?? null;
}

/** The passenger's boarding point: the one marked on the map, else the center of their city. */
export function pontoDoPassageiro(p: Pick<Passageiro, "ponto" | "cidade">): Ponto | null {
  return p.ponto ?? coordenadaDaCidade(p.cidade);
}

/** The trip's cities in order (origem, paradas, destino) that the map knows. */
export function cidadesNoMapa(d: Pick<Destino, "origem" | "destino" | "paradas">): { nome: string; ponto: Ponto }[] {
  return caminhoCompleto(d).flatMap((nome) => {
    const ponto = coordenadaDaCidade(nome);
    return ponto ? [{ nome, ponto }] : [];
  });
}

/** Distance in km between two points (straight line). */
export function distanciaKm(a: Ponto, b: Ponto) {
  const r = 6371;
  const rad = (g: number) => (g * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * r * Math.asin(Math.sqrt(h));
}
