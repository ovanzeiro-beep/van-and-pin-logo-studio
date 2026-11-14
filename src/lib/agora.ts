/**
 * Única fonte de verdade para data e hora atuais.
 * Hoje: usa constantes fixas de exemplo.
 * Com banco: retorna a data/hora real do servidor.
 */

import { DATA_DE_HOJE, HORA_DE_AGORA } from "@/data/exemplo";

export type Agora = { data: string; hora: string };

/** Data e hora atuais (hoje: fixas nos exemplos; depois: do servidor). */
export function agora(): Agora {
  return { data: DATA_DE_HOJE, hora: HORA_DE_AGORA };
}

/** Data de hoje (hoje: fixa; depois: do servidor). */
export function hoje(): string {
  return DATA_DE_HOJE;
}

/** Hora agora (hoje: fixa; depois: do servidor). */
export function agora_hora(): string {
  return HORA_DE_AGORA;
}
