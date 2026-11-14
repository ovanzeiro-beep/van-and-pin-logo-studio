import { dataDeHoje } from "@/lib/agora";
import { cancelarPendentesDe } from "@/lib/cobrancas-store";
import { obterDestinos, removerDestino } from "@/lib/destinos-store";
import { obterPassageiros, removerDoDestino, sairDaMatricula } from "@/lib/passageiros-store";
import { obterMinhasMatriculas } from "@/lib/sessao-passageiro";
import { idDoVanzeiro } from "@/lib/sessao";
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
export function excluirDestino(destinoId: string, hoje = dataDeHoje()) {
  if (viagemEmAndamentoNoDestino(destinoId)) return false;
  const ids = obterPassageiros().filter((p) => p.destinoId === destinoId).map((p) => p.id);
  cancelarPendentesDe(ids, MOTIVO_DESTINO_EXCLUIDO, hoje);
  removerDoDestino(destinoId);
  removerDestino(destinoId);
  return true;
}

/** The passenger leaves one destino. Returns false while that destino's trip is in progress. */
export function sairDoDestino(passageiroId: string, hoje = dataDeHoje()) {
  const p = obterPassageiros().find((x) => x.id === passageiroId);
  if (!p || viagemEmAndamentoNoDestino(p.destinoId)) return false;
  cancelarPendentesDe([p.id], MOTIVO_SAIU_DO_DESTINO, hoje);
  sairDaMatricula(p.id);
  return true;
}

/** Delete the account entirely: the vanzeiro deletes all their destinos; the passenger leaves all
 * their destinos. Returns false (and changes nothing) while one of those trips is in progress. */
export function excluirMinhaConta(papel: "vanzeiro" | "passageiro", hoje = dataDeHoje()) {
  if (papel === "vanzeiro") {
    const meus = obterDestinos().filter((d) => d.vanzeiroId === idDoVanzeiro());
    if (meus.some((d) => viagemEmAndamentoNoDestino(d.id))) return false;
    meus.forEach((d) => excluirDestino(d.id, hoje));
  } else {
    const minhas = obterMinhasMatriculas();
    if (minhas.some((p) => viagemEmAndamentoNoDestino(p.destinoId))) return false;
    minhas.forEach((p) => sairDoDestino(p.id, hoje));
  }
  return true;
}
