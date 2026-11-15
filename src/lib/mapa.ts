import { coordenadasExemplo, type Destino, type Passageiro } from "@/data/exemplo";
import { caminhoCompleto } from "@/lib/destinos";
import { proximoDaBusca, type ViagemDoDia } from "@/lib/viagem";

// The van on the map (section 12, stage 2 of docs/fonte-da-verdade.md). For now the van's position is SIMULATED
// from the trip on the vanzeiro's phone; with the database, the real GPS position replaces it here.

export type Ponto = { lat: number; lng: number };

/** Average speed used to estimate "chega em uns N min" (city and road mixed). */
export const VELOCIDADE_MEDIA_KMH = 40;

export function coordenadaDaCidade(nome: string): Ponto | null {
  return coordenadasExemplo[nome] ?? null;
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

const entre = (a: Ponto, b: Ponto, t: number): Ponto => ({ lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t });

export type VanNoMapa = {
  /** Where the van is drawn (null = not on the map: trip not started or already over). */
  ponto: Ponto | null;
  /** "Jacarezinho": the nearest city of the trip. */
  passandoPor: string | null;
  /** Minutes until the passenger's point (only while the van is coming to pick them up). */
  minutosAteVoce: number | null;
};

/**
 * Simulated van: during the pickup it goes from the last handled point toward the next passenger;
 * `progresso` (0 to 1) moves it along that stretch. At the destino it waits there.
 */
export function vanSimulada(a: {
  destino: Destino;
  viagem: ViagemDoDia | undefined;
  passageiros: Pick<Passageiro, "id" | "ponto" | "cidade">[];
  euId: string;
  progresso: number;
}): VanNoMapa {
  const { viagem: v, destino } = a;
  const cidades = cidadesNoMapa(destino);
  const nada = { ponto: null, passandoPor: null, minutosAteVoce: null };
  if (!v || v.fase === "encerrada" || cidades.length === 0) return nada;
  const origem = cidades[0]!.ponto;
  const fim = cidades[cidades.length - 1]!.ponto;
  const pontoDe = (id: string) => {
    const p = a.passageiros.find((x) => x.id === id);
    return (p && pontoDoPassageiro(p)) ?? origem;
  };

  let ponto: Ponto;
  let minutosAteVoce: number | null = null;
  if (v.fase === "busca" || v.fase === "parada" || v.fase === "conferencia") {
    const tratados = v.ordem.filter((id) => v.embarcaram.includes(id) || v.naoEstavam.includes(id));
    const ultimo = tratados.length ? pontoDe(tratados[tratados.length - 1]!) : origem;
    const proximo = proximoDaBusca(v);
    const alvo = proximo ? pontoDe(proximo) : fim;
    ponto = v.fase === "busca" ? entre(ultimo, alvo, Math.min(Math.max(a.progresso, 0), 1)) : ultimo;

    if (v.ordem.includes(a.euId) && !tratados.includes(a.euId)) {
      const faltam = v.ordem.slice(v.ordem.indexOf(proximo ?? a.euId), v.ordem.indexOf(a.euId) + 1).map(pontoDe);
      let km = 0;
      let de = ponto;
      for (const p of faltam) {
        km += distanciaKm(de, p);
        de = p;
      }
      minutosAteVoce = Math.max(1, Math.round((km / VELOCIDADE_MEDIA_KMH) * 60));
    }
  } else if (v.fase === "volta") {
    ponto = entre(fim, origem, Math.min(Math.max(a.progresso, 0), 1) * 0.5);
  } else {
    ponto = fim;
  }

  const maisPerto = [...cidades].sort((x, y) => distanciaKm(ponto, x.ponto) - distanciaKm(ponto, y.ponto))[0]!;
  return { ponto, passandoPor: maisPerto.nome, minutosAteVoce };
}

/** "Chega no seu ponto em uns 12 min" / "em menos de 1 min". */
export function textoDaChegada(minutos: number | null) {
  if (minutos === null) return null;
  return minutos <= 1 ? "Chega no seu ponto em 1 min" : `Chega no seu ponto em uns ${minutos} min`;
}
