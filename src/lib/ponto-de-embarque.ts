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
  neighbourhood?: string;
  suburb?: string;
  quarter?: string;
  hamlet?: string;
  village?: string;
  isolated_dwelling?: string;
};

const ruaDe = (e: Endereco | undefined) => e?.road ?? e?.pedestrian ?? e?.footway;
const bairroDe = (e: Endereco | undefined) =>
  e?.neighbourhood ?? e?.suburb ?? e?.quarter ?? e?.hamlet ?? e?.village ?? e?.isolated_dwelling;

/** "Rua Paraná, 455" from the map's answer; the neighborhood when the street has no name; "" when nothing useful. */
export function textoDoEndereco(e: Endereco | undefined) {
  const rua = ruaDe(e);
  if (rua) return e?.house_number ? `${rua}, ${e.house_number}` : rua;
  return bairroDe(e) ?? "";
}

const esperarDeVerdade = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * The address of a GPS point, to fill the field: "Rua Paraná, 455"; when the street has no name on the map (common in
 * new neighborhoods), the nearest named big street: "Perto de Estrada X (Vila Y)"; else the neighborhood; else "".
 * Never breaks the screen: offline gives "".
 */
export async function enderecoDoPonto(
  p: Ponto,
  buscar: BuscarNoMapa = buscarDeVerdade,
  esperar: (ms: number) => Promise<void> = esperarDeVerdade,
): Promise<string> {
  const reverso = async (zoom: number) => {
    try {
      const r = (await buscar(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=${zoom}&accept-language=pt-BR&lat=${p.lat}&lon=${p.lng}`,
      )) as { address?: Endereco } | null;
      return r?.address;
    } catch {
      return undefined;
    }
  };
  const perto = await reverso(18);
  if (ruaDe(perto)) return textoDoEndereco(perto);
  // The free map asks for at most one search per second.
  await esperar(1100);
  const grande = await reverso(16);
  const bairro = bairroDe(perto) ?? bairroDe(grande);
  const rua = ruaDe(grande);
  if (rua) return `Perto de ${rua}${bairro ? ` (${bairro})` : ""}`;
  return bairro ?? "";
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
