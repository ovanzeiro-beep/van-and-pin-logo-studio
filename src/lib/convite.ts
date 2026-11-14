import type { Destino } from "@/data/exemplo";

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
export function registrarCodigoUsado(codigo: string) {
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
