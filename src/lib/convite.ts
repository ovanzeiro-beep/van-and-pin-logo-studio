import type { Destino } from "@/data/exemplo";

/** Finds the destino of an invite code. Accepts "van-4821", "VAN 4821" or just "4821". */
export function acharPorCodigo<T extends Pick<Destino, "convite">>(destinos: T[], texto: string): T | undefined {
  const digitos = texto.toUpperCase().replace(/[^0-9]/g, "");
  const letras = texto.toUpperCase().replace(/[^A-Z]/g, "");
  if (!digitos || (letras && letras !== "VAN")) return undefined;
  return destinos.find((d) => d.convite.replace(/[^0-9]/g, "") === digitos);
}
