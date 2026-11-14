import { dataDeHoje } from "@/lib/agora";
import { cancelarPendentesDe } from "@/lib/cobrancas-store";
import { obterDestinos, removerDestino } from "@/lib/destinos-store";
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

/** Delete the account entirely: vanzeiro deletes all destinos; passenger leaves all destinos.
 * Returns false if any trip is in progress. */
export function excluirMinhaConta(papel: "vanzeiro" | "passageiro", hoje = dataDeHoje()) {
  if (papel === "vanzeiro") {
    const destinos = obterDestinos();
    for (const d of destinos) {
      if (!excluirDestino(d.id, hoje)) return false;
    }
  } else {
    const passageiros = obterPassageiros();
    const eu = passageiros[0]; // All my memberships have same identity, pick first
    if (!eu) return true; // No memberships, nothing to delete
    const minhas = passageiros.filter((p) => p.pessoaId === eu.pessoaId);
    for (const p of minhas) {
      if (!sairDoDestino(p.id, hoje)) return false;
    }
  }
  return true;
}
