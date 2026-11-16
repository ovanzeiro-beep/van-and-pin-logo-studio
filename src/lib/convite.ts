import type { Destino } from "@/data/exemplo";
import { supabase, USA_BANCO } from "@/lib/supabase";

export type DestinoDoConvite = Pick<Destino, "id" | "origem" | "destino" | "paradas" | "saida" | "convite"> & {
  agenda?: Destino;
  vanzeiroNome?: string;
};

/** Real accounts search through the restricted invite RPC, not the empty local destination list. */
export async function procurarPorCodigo(texto: string, destinosLocais: Destino[] = []): Promise<DestinoDoConvite | null> {
  const digitos = texto.replace(/[^0-9]/g, "");
  const letras = texto.toUpperCase().replace(/[^A-Z]/g, "");
  if (!digitos || (letras && letras !== "VAN")) return null;
  if (!USA_BANCO.conta) {
    const destino = acharPorCodigo(destinosLocais, texto);
    return destino ? { ...destino, agenda: destino } : null;
  }
  const sb = supabase();
  if (!sb) throw new Error("Sem conexão");
  const { data, error } = await sb.rpc("destino_pelo_convite", { codigo: `VAN-${digitos}` });
  if (error) throw new Error("Não foi possível consultar o convite");
  const destino = data?.[0];
  if (!destino) return null;
  return {
    id: destino.id,
    origem: destino.origem,
    destino: destino.destino,
    paradas: destino.paradas,
    saida: destino.saida,
    convite: `VAN-${digitos}`,
    vanzeiroNome: destino.vanzeiro_nome,
  };
}

/** Finds the destino of an invite code. Accepts "van-4821", "VAN 4821" or just "4821". */
export function acharPorCodigo<T extends Pick<Destino, "convite">>(destinos: T[], texto: string): T | undefined {
  const digitos = texto.toUpperCase().replace(/[^0-9]/g, "");
  const letras = texto.toUpperCase().replace(/[^A-Z]/g, "");
  if (!digitos || (letras && letras !== "VAN")) return undefined;
  return destinos.find((d) => d.convite.replace(/[^0-9]/g, "") === digitos);
}

/** Registro de códigos já gerados (para evitar duplicatas). */
const codigosUsados = new Set<string>();

/** Registra um código como já usado (ao carregar dados existentes). */
function registrarCodigoUsado(codigo: string) {
  const digitos = codigo.replace(/[^0-9]/g, "");
  codigosUsados.add(digitos);
}

/** Inicializa o registro com os códigos de destinos existentes. */
export function inicializarCodigosUsados(destinos: Pick<Destino, "convite">[]) {
  destinos.forEach((d) => registrarCodigoUsado(d.convite));
}

/** Gera um código de convite garantidamente único. */
export function gerarConviteUnico(): string {
  let codigo: string;
  let tentativas = 0;
  const maxTentativas = 100;

  do {
    const numero = 1000 + Math.floor(Math.random() * 9000);
    codigo = numero.toString();
    tentativas++;

    if (tentativas > maxTentativas) {
      throw new Error("Não conseguiu gerar um código de convite único após muitas tentativas");
    }
  } while (codigosUsados.has(codigo));

  codigosUsados.add(codigo);
  return `VAN-${codigo}`;
}
