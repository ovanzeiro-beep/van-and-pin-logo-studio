import { distanciaKm, type Ponto } from "@/lib/mapa";
import { registrarErro } from "@/lib/erros";

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
  city?: string;
  town?: string;
  municipality?: string;
};

const ruaDe = (e: Endereco | undefined) => e?.road ?? e?.pedestrian ?? e?.footway;
const bairroDe = (e: Endereco | undefined) =>
  e?.neighbourhood ?? e?.suburb ?? e?.quarter ?? e?.hamlet ?? e?.village ?? e?.isolated_dwelling;

/** "Rua Paraná, 455" from the map's answer; the neighborhood when the street has no name; "" when nothing useful. */
export function textoDoEndereco(e: Endereco | undefined) {
  const rua = ruaDe(e);
  const bairro = e?.neighbourhood ?? e?.suburb ?? e?.quarter;
  // Like the ride apps: "Rua Paraná, 455 - Vila Setti" (number and neighborhood when the map has them).
  if (rua)
    return `${e?.house_number ? `${rua}, ${e.house_number}` : rua}${bairro ? ` - ${bairro}` : ""}`;
  return bairroDe(e) ?? "";
}

const esperarDeVerdade = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * The address of a GPS point, to fill the field: "Rua Paraná, 455"; when the street has no name on the map (common in
 * new neighborhoods), the nearest named big street: "Perto de Estrada X (Vila Y)"; else the neighborhood; else "".
 * Never breaks the screen: offline gives "".
 */
type Photon = {
  features?: {
    properties?: {
      street?: string;
      housenumber?: string;
      name?: string;
      district?: string;
      locality?: string;
      city?: string;
      county?: string;
    };
  }[];
};

/** The second free map (Photon, same OpenStreetMap data on other servers), when Nominatim fails or knows nothing. */
export function enderecoDoPhoton(r: Photon | null | undefined): Endereco | undefined {
  const p = r?.features?.[0]?.properties;
  if (!p) return undefined;
  return {
    ...(p.street ? { road: p.street } : {}),
    ...(p.housenumber ? { house_number: p.housenumber } : {}),
    ...((p.district ?? p.locality) ? { suburb: p.district ?? p.locality } : {}),
    ...((p.city ?? p.county) ? { city: p.city ?? p.county } : {}),
  };
}

export async function lugarDoPonto(
  p: Ponto,
  buscar: BuscarNoMapa = buscarDeVerdade,
  esperar: (ms: number) => Promise<void> = esperarDeVerdade,
  aoFalhar: (motivo: string) => void = (m) => void registrarErro(new Error(m)),
): Promise<{ endereco: string; cidade: string | undefined }> {
  const falhas: string[] = [];
  const reverso = async (zoom: number) => {
    try {
      const r = (await buscar(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=${zoom}&accept-language=pt-BR&lat=${p.lat}&lon=${p.lng}`,
      )) as { address?: Endereco; error?: string } | null;
      if (!r?.address) falhas.push(`nominatim ${zoom}: ${r?.error ?? "sem endereço"}`);
      else if (!ruaDe(r.address))
        falhas.push(`nominatim ${zoom}: sem rua (${Object.keys(r.address).join(",")})`);
      return r?.address;
    } catch (e) {
      falhas.push(`nominatim ${zoom}: ${e instanceof Error ? e.message : "erro"}`);
      return undefined;
    }
  };
  const photon = async () => {
    try {
      const e = enderecoDoPhoton(
        (await buscar(
          `https://photon.komoot.io/reverse?lat=${p.lat}&lon=${p.lng}&limit=1`,
        )) as Photon,
      );
      if (!ruaDe(e)) falhas.push(`photon: sem rua (${Object.keys(e ?? {}).join(",")})`);
      return e;
    } catch (e) {
      falhas.push(`photon: ${e instanceof Error ? e.message : "erro"}`);
      return undefined;
    }
  };
  const ruaComNomeMaisPerto = async () => {
    try {
      const r = (await buscar(
        `https://photon.komoot.io/reverse?lat=${p.lat}&lon=${p.lng}&limit=10&radius=0.5&osm_tag=highway`,
      )) as { features?: { properties?: { name?: string; street?: string; osm_key?: string } }[] };
      const nomes = (r?.features ?? [])
        .map((f) => f.properties)
        .map((x) => (x?.osm_key === "highway" ? x.name : undefined) ?? x?.street);
      const nome = nomes.find((n) => !!n && n.trim() !== "");
      if (!nome) falhas.push("photon ruas: nenhuma com nome perto");
      return nome;
    } catch (e) {
      falhas.push(`photon ruas: ${e instanceof Error ? e.message : "erro"}`);
      return undefined;
    }
  };
  let perto = await reverso(18);
  if (!ruaDe(perto)) {
    // Nominatim failed or has no street here: the second map.
    const outro = await photon();
    if (ruaDe(outro) || !perto)
      perto = {
        ...outro,
        ...(perto?.city || perto?.town ? { city: perto.city ?? perto.town } : {}),
      };
  }
  const cidade = perto?.city ?? perto?.town ?? perto?.municipality ?? perto?.village;
  if (ruaDe(perto)) return { endereco: textoDoEndereco(perto), cidade };
  // The free map asks for at most one search per second.
  await esperar(1100);
  const grande = await reverso(16);
  const bairro = bairroDe(perto) ?? bairroDe(grande);
  // New neighborhoods: the street at the point often has no name on the free map. The nearest street WITH a name
  // (Photon, streets only, up to ~500 m) gives "Perto de Rua X"; the person completes it.
  const rua = ruaDe(grande) ?? (await ruaComNomeMaisPerto());
  if (rua)
    return {
      endereco: `Perto de ${rua}${bairro && bairro !== cidade ? ` (${bairro})` : ""}`,
      cidade,
    };
  aoFalhar(`Endereço pelo GPS não achado: ${falhas.join("; ") || "sem detalhe"}`);
  return { endereco: bairro && bairro !== cidade ? bairro : "", cidade };
}

/** Only the address text of a GPS point (see lugarDoPonto). */
export async function enderecoDoPonto(
  p: Ponto,
  buscar: BuscarNoMapa = buscarDeVerdade,
  esperar: (ms: number) => Promise<void> = esperarDeVerdade,
) {
  return (await lugarDoPonto(p, buscar, esperar)).endereco;
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

/** "Jacarezinho PR", "Jacarezinho - PR" and "jacarezinho" are the same city. */
export function nomeDaCidade(nome: string) {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(
      /[\s,/-]+(ac|al|ap|am|ba|ce|df|es|go|ma|mt|ms|mg|pa|pb|pr|pe|pi|rj|rn|rs|ro|rr|sc|sp|se|to)$/,
      "",
    )
    .trim();
}

type CidadeDaRota = { nome: string; ponto?: Ponto | undefined };

/** The point is inside a city of the route: up to 30 km from its center (the map does not know city borders). */
export function pertoDaCidade(ponto: Ponto, c: CidadeDaRota) {
  return !c.ponto || distanciaKm(ponto, c.ponto) <= LONGE_DA_CIDADE_KM;
}

/**
 * Which city of the route a marked point belongs to: the city the map says (GPS), when it is on the route; else the
 * chosen one, when the point is in it; else the closest city of the route. null: the point is in no city of the route.
 */
export function cidadeDaRota(
  ponto: Ponto,
  nomeDoMapa: string | undefined,
  cidades: CidadeDaRota[],
  escolhida: string,
): string | null {
  const porNome = nomeDoMapa
    ? cidades.find((c) => nomeDaCidade(c.nome) === nomeDaCidade(nomeDoMapa))
    : undefined;
  if (porNome && pertoDaCidade(ponto, porNome)) return porNome.nome;
  const atual = cidades.find((c) => c.nome === escolhida);
  if (atual?.ponto && pertoDaCidade(ponto, atual)) return atual.nome;
  const comMapa = cidades.filter(
    (c): c is { nome: string; ponto: Ponto } => !!c.ponto && pertoDaCidade(ponto, c),
  );
  if (comMapa.length)
    return comMapa.reduce((a, b) =>
      distanciaKm(ponto, b.ponto) < distanciaKm(ponto, a.ponto) ? b : a,
    ).nome;
  // The map does not know the cities yet: nothing to compare, keep the choice.
  if (cidades.every((c) => !c.ponto)) return escolhida || null;
  return null;
}

/** Text when the point is in no city of the route (the person cannot ask to join with it). */
export function textoForaDaRota(cidades: string[]) {
  return `Esse ponto não fica em nenhuma cidade por onde a van passa (${cidades.join(", ")}). Marque onde você espera a van.`;
}

const UFS =
  "AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO".split(" ");

/** "Jacarezinho PR" from the map's answer (city and state); "" when it does not say. */
export function textoDaCidade(
  e:
    | {
        city?: string;
        town?: string;
        municipality?: string;
        village?: string;
        "ISO3166-2-lvl4"?: string;
      }
    | undefined,
) {
  const cidade = e?.city ?? e?.town ?? e?.municipality ?? e?.village;
  if (!cidade) return "";
  const uf = e?.["ISO3166-2-lvl4"]?.replace(/^BR-/, "");
  return uf && UFS.includes(uf) ? `${cidade} ${uf}` : cidade;
}

/** The city where the phone is (GPS), for "De onde sai?". Only the city, never the address. */
export async function minhaCidade(
  buscar: BuscarNoMapa = buscarDeVerdade,
): Promise<{ ok: true; cidade: string } | { ok: false; erro: string }> {
  const gps = await minhaLocalizacao();
  if (!gps.ok) return gps;
  try {
    const r = (await buscar(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=10&accept-language=pt-BR&lat=${gps.ponto.lat}&lon=${gps.ponto.lng}`,
    )) as { address?: Parameters<typeof textoDaCidade>[0] };
    const cidade = textoDaCidade(r?.address);
    return cidade
      ? { ok: true, cidade }
      : { ok: false, erro: "Não achamos o nome da cidade. Escreva no campo." };
  } catch {
    return { ok: false, erro: "Sem internet para achar a cidade. Escreva no campo." };
  }
}
