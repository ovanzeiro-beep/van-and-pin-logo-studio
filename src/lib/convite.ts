import type { Destino } from "@/data/exemplo";
import { supabase, USA_BANCO } from "@/lib/supabase";

export type DestinoDoConvite = Pick<Destino, "id" | "origem" | "destino" | "paradas" | "saida" | "convite" | "cafe"> & {
  agenda?: Destino;
  vanzeiroNome?: string;
};

/** Correção 6: the letters and numbers of a code ("VAN-" + 6), without the ones that look alike (0/O, 1/I/L). */
export const ALFABETO_DO_CONVITE = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

/**
 * "van 7k2q9m", "VAN-7K2Q9M" or just "7K2Q9M" → "VAN-7K2Q9M". Codes made before the Correção 6 ("VAN-4821") are still
 * read, so the app works with either version of the database; the database decides which ones are valid.
 */
export function normalizarConvite(texto: string): string | null {
  let s = texto.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (s.startsWith("VAN") && (s.length === 9 || s.length === 7)) s = s.slice(3);
  if (/^\d{4}$/.test(s)) return `VAN-${s}`;
  if (s.length === 6 && [...s].every((ch) => ALFABETO_DO_CONVITE.includes(ch))) return `VAN-${s}`;
  return null;
}

/** A message the database wrote for the person ("Muitos códigos errados…"): shown as it is. */
export class AvisoDoConvite extends Error {}

/** Real accounts search through the restricted invite RPC, not the empty local destination list. */
export async function procurarPorCodigo(texto: string, destinosLocais: Destino[] = []): Promise<DestinoDoConvite | null> {
  const codigo = normalizarConvite(texto);
  if (!codigo) return null;
  if (!USA_BANCO.conta) {
    const destino = acharPorCodigo(destinosLocais, texto);
    return destino ? { ...destino, agenda: destino } : null;
  }
  const sb = supabase();
  if (!sb) throw new Error("Sem conexão");
  const { data, error } = await sb.rpc("destino_pelo_convite", { codigo });
  if (error) throw error.code === "P0001" && error.message ? new AvisoDoConvite(error.message) : new Error("Não foi possível consultar o convite");
  const destino = data?.[0];
  if (!destino) return null;
  return {
    id: destino.id,
    origem: destino.origem,
    destino: destino.destino,
    paradas: destino.paradas,
    cafe: destino.cafe_parada && destino.cafe_minutos ? { parada: destino.cafe_parada, minutos: destino.cafe_minutos, ...(destino.cafe_local ? { local: destino.cafe_local } : {}) } : null,
    saida: destino.saida,
    convite: codigo,
    vanzeiroNome: destino.vanzeiro_nome,
  };
}

/** Finds the destino of an invite code. Accepts "van-7k2q9m", "VAN 7K2Q9M" or just "7K2Q9M" (and the old "VAN-4821"). */
export function acharPorCodigo<T extends Pick<Destino, "convite">>(destinos: T[], texto: string): T | undefined {
  const codigo = normalizarConvite(texto);
  if (!codigo) return undefined;
  return destinos.find((d) => normalizarConvite(d.convite) === codigo);
}

/** Registro de códigos já gerados (para evitar duplicatas). */
const codigosUsados = new Set<string>();

/** Registra um código como já usado (ao carregar dados existentes). */
function registrarCodigoUsado(codigo: string) {
  codigosUsados.add((normalizarConvite(codigo) ?? codigo).replace(/^VAN-/, ""));
}

/** Inicializa o registro com os códigos de destinos existentes. */
export function inicializarCodigosUsados(destinos: Pick<Destino, "convite">[]) {
  destinos.forEach((d) => registrarCodigoUsado(d.convite));
}

/** Gera um código de convite que não se repete (sem o banco; com o banco, quem sorteia é o próprio banco). */
export function gerarConviteUnico(): string {
  for (let tentativas = 0; tentativas < 100; tentativas++) {
    const sorteio = crypto.getRandomValues(new Uint8Array(12));
    const letras = [...sorteio].filter((b) => b < 248).map((b) => ALFABETO_DO_CONVITE[b % 31]).slice(0, 6).join("");
    if (letras.length < 6 || codigosUsados.has(letras)) continue;
    codigosUsados.add(letras);
    return `VAN-${letras}`;
  }
  throw new Error("Não conseguiu gerar um código de convite único após muitas tentativas");
}
