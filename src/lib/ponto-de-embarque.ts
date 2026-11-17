import { distanciaKm, type Ponto } from "@/lib/mapa";

// N1: helps the passenger mark where they wait for the van: the phone's GPS ("Estou no ponto agora") or the written
// address looked up in the free OpenStreetMap search ("Achar no mapa"). Tapping the map still adjusts the pin.

/** A GPS point farther than this from the chosen city is probably the wrong city (or the person is not at the point). */
export const LONGE_DA_CIDADE_KM = 30;

/** How much around the city the address search looks (about 20 km each side). */
const RAIO_DA_BUSCA = 0.2;

/** The search of an address inside the chosen city, in Brazil only. */
export function urlDaBuscaDeEndereco(endereco: string, cidade: string, centro: Ponto | undefined) {
  const n = (x: number) => Number(x.toFixed(4));
  const caixa = centro
    ? `&bounded=1&viewbox=${n(centro.lng - RAIO_DA_BUSCA)},${n(centro.lat + RAIO_DA_BUSCA)},${n(centro.lng + RAIO_DA_BUSCA)},${n(centro.lat - RAIO_DA_BUSCA)}`
    : "";
  const q = `${endereco.trim()}, ${cidade.trim()}`;
  return `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=br&accept-language=pt-BR&q=${encodeURIComponent(q)}${caixa}`;
}

export type BuscarNoMapa = (url: string) => Promise<unknown>;

const buscarDeVerdade: BuscarNoMapa = async (url) => {
  const r = await fetch(url, { headers: { Accept: "application/json" } });
  if (!r.ok) throw new Error(`busca ${r.status}`);
  return r.json();
};

/** The point of the written address, or null when the map does not know it. Throws without internet. */
export async function acharEndereco(
  endereco: string,
  cidade: string,
  centro: Ponto | undefined,
  buscar: BuscarNoMapa = buscarDeVerdade,
): Promise<Ponto | null> {
  const lista = (await buscar(urlDaBuscaDeEndereco(endereco, cidade, centro))) as {
    lat: string;
    lon: string;
  }[];
  const [primeiro] = Array.isArray(lista) ? lista : [];
  return primeiro ? { lat: Number(primeiro.lat), lng: Number(primeiro.lon) } : null;
}

type Endereco = {
  road?: string;
  pedestrian?: string;
  footway?: string;
  house_number?: string;
  suburb?: string;
  neighbourhood?: string;
};

/** "Rua Paraná, 455" from the map's answer; the neighborhood when the street has no name; "" when nothing useful. */
export function textoDoEndereco(e: Endereco | undefined) {
  if (!e) return "";
  const rua = e.road ?? e.pedestrian ?? e.footway;
  if (rua) return e.house_number ? `${rua}, ${e.house_number}` : rua;
  return e.neighbourhood ?? e.suburb ?? "";
}

/** The street and number of a GPS point (to fill the address when it is empty). "" when not found or offline. */
export async function enderecoDoPonto(
  p: Ponto,
  buscar: BuscarNoMapa = buscarDeVerdade,
): Promise<string> {
  try {
    const r = (await buscar(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=18&accept-language=pt-BR&lat=${p.lat}&lon=${p.lng}`,
    )) as { address?: Endereco };
    return textoDoEndereco(r?.address);
  } catch {
    return "";
  }
}

export type ResultadoDoGps = { ok: true; ponto: Ponto } | { ok: false; erro: string };

/** Short messages for when the GPS fails (codes from the browser: 1 = not allowed, 2 = no signal, 3 = took too long). */
export function erroDoGps(codigo: number | undefined) {
  if (codigo === 1)
    return "O app não pôde usar a localização. Permita a localização nas configurações do celular ou toque no mapa.";
  if (codigo === 3)
    return "A localização demorou demais. Tente de novo perto de uma janela ou toque no mapa.";
  return "Não deu para achar a sua localização. Tente de novo ou toque no mapa.";
}

type Geo = Pick<Geolocation, "getCurrentPosition">;

/** Where the phone is now (precise GPS, up to 20 seconds). */
export function minhaLocalizacao(
  geo: Geo | undefined = typeof navigator !== "undefined" ? navigator.geolocation : undefined,
) {
  return new Promise<ResultadoDoGps>((resolve) => {
    if (!geo)
      return resolve({
        ok: false,
        erro: "Este celular não informa a localização. Toque no mapa onde você espera a van.",
      });
    geo.getCurrentPosition(
      (pos) =>
        resolve({ ok: true, ponto: { lat: pos.coords.latitude, lng: pos.coords.longitude } }),
      (e) => resolve({ ok: false, erro: erroDoGps(e?.code) }),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 },
    );
  });
}

/** Warning when the marked point is far from the chosen city (wrong city chosen, or the person is not at the point). */
export function avisoDeLonge(ponto: Ponto, cidade: string, centro: Ponto | undefined) {
  if (!centro || !cidade) return null;
  return distanciaKm(ponto, centro) > LONGE_DA_CIDADE_KM
    ? `Esse ponto fica longe de ${cidade}. Confira a cidade escolhida e o pino no mapa.`
    : null;
}
