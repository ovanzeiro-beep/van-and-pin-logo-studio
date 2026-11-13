import { DATA_DE_HOJE } from "@/data/exemplo";
import { cancelarPendentesDe } from "@/lib/cobrancas-store";
import { removerDestino } from "@/lib/destinos-store";
import { obterPassageiros, removerDoDestino, sairDaMatricula } from "@/lib/passageiros-store";
import { emAndamento, obterViagensDoDia } from "@/lib/viagem-store";

// Excluir destino (vanzeiro) and Sair deste destino (passageiro), following decision 6:
// paid and cancelled charges stay in the history, devendo keep being collected,
// pendentes are cancelled with the reason.
export const MOTIVO_DESTINO_EXCLUIDO = "Destino excluído";
export const MOTIVO_SAIU_DO_DESTINO = "Saiu do destino";

/** Neither works while that destino's trip of today is in progress. */
export function viagemEmAndamentoNoDestino(destinoId: string) {
  return emAndamento(obterViagensDoDia())?.destinoId === destinoId;
}

/** Returns false (and changes nothing) while the destino's trip is in progress. */
export function excluirDestino(destinoId: string, hoje = DATA_DE_HOJE) {
  if (viagemEmAndamentoNoDestino(destinoId)) return false;
  const ids = obterPassageiros().filter((p) => p.destinoId === destinoId).map((p) => p.id);
  cancelarPendentesDe(ids, MOTIVO_DESTINO_EXCLUIDO, hoje);
  removerDoDestino(destinoId);
  removerDestino(destinoId);
  return true;
}

/** The passenger leaves one destino. Returns false while that destino's trip is in progress. */
export function sairDoDestino(passageiroId: string, hoje = DATA_DE_HOJE) {
  const p = obterPassageiros().find((x) => x.id === passageiroId);
  if (!p || viagemEmAndamentoNoDestino(p.destinoId)) return false;
  cancelarPendentesDe([p.id], MOTIVO_SAIU_DO_DESTINO, hoje);
  sairDaMatricula(p.id);
  return true;
}
