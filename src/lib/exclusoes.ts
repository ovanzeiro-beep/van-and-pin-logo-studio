import { dataDeHoje } from "@/lib/agora";
import { cancelarPendentesDe } from "@/lib/cobrancas-store";
import { alternarAtivo, obterDestinos, removerDestino } from "@/lib/destinos-store";
import { obterPassageiros, removerDoDestino, sairDaMatricula } from "@/lib/passageiros-store";
import { obterMinhasMatriculas } from "@/lib/sessao-passageiro";
import { idDoVanzeiro } from "@/lib/sessao";
import { emAndamento, obterViagensDoDia } from "@/lib/viagem-store";
import { deuCerto, naoDeu, SEM_DESTINO, type Resultado } from "@/lib/acoes";

// Excluir destino (vanzeiro) and Sair deste destino (passageiro), following decision 6:
// paid and cancelled charges stay in the history, devendo keep being collected,
// pendentes are cancelled with the reason.
export const MOTIVO_DESTINO_EXCLUIDO = "Destino excluído";
export const MOTIVO_SAIU_DO_DESTINO = "Saiu do destino";
export const MOTIVO_REMOVIDO_DO_DESTINO = "Removido do destino";
const VIAGEM_ACONTECENDO = "A viagem de hoje deste destino está acontecendo. Espere ela terminar.";

/** Neither works while that destino's trip of today is in progress. */
function viagemEmAndamentoNoDestino(destinoId: string) {
  return emAndamento(obterViagensDoDia())?.destinoId === destinoId;
}

/** "Pausar" / "Ativar". Pausing returns false (and changes nothing) while the destino's trip is in progress. */
export function pausarOuAtivarDestino(destinoId: string): Resultado {
  const d = obterDestinos().find((x) => x.id === destinoId);
  if (!d) return naoDeu(SEM_DESTINO);
  if (d.ativo && viagemEmAndamentoNoDestino(destinoId)) return naoDeu(VIAGEM_ACONTECENDO);
  alternarAtivo(destinoId);
  return deuCerto;
}

/** Returns false (and changes nothing) while the destino's trip is in progress. */
export function excluirDestino(destinoId: string, hoje = dataDeHoje()): Resultado {
  if (!obterDestinos().some((d) => d.id === destinoId)) return naoDeu(SEM_DESTINO);
  if (viagemEmAndamentoNoDestino(destinoId)) return naoDeu(VIAGEM_ACONTECENDO);
  const ids = obterPassageiros().filter((p) => p.destinoId === destinoId).map((p) => p.id);
  cancelarPendentesDe(ids, MOTIVO_DESTINO_EXCLUIDO, hoje);
  removerDoDestino(destinoId);
  removerDestino(destinoId);
  return deuCerto;
}

/** The passenger leaves one destino. Returns false while that destino's trip is in progress. */
export function sairDoDestino(passageiroId: string, hoje = dataDeHoje()): Resultado {
  const p = obterPassageiros().find((x) => x.id === passageiroId);
  if (!p) return naoDeu(SEM_DESTINO);
  if (viagemEmAndamentoNoDestino(p.destinoId)) return naoDeu(VIAGEM_ACONTECENDO);
  cancelarPendentesDe([p.id], MOTIVO_SAIU_DO_DESTINO, hoje);
  sairDaMatricula(p.id);
  return deuCerto;
}

/** The vanzeiro removes a passenger from a destino (decision 2, same as decision 6). Returns false while that trip is in progress. */
export function removerPassageiroDoDestino(passageiroId: string, hoje = dataDeHoje()): Resultado {
  const p = obterPassageiros().find((x) => x.id === passageiroId);
  if (!p) return naoDeu("Não achamos este passageiro. Ele pode já ter saído do destino.");
  if (viagemEmAndamentoNoDestino(p.destinoId)) return naoDeu(VIAGEM_ACONTECENDO);
  cancelarPendentesDe([p.id], MOTIVO_REMOVIDO_DO_DESTINO, hoje);
  sairDaMatricula(p.id);
  return deuCerto;
}

/** Delete the account entirely: the vanzeiro deletes all their destinos; the passenger leaves all
 * their destinos. Returns false (and changes nothing) while one of those trips is in progress. */
export function excluirMinhaConta(papel: "vanzeiro" | "passageiro", hoje = dataDeHoje()): Resultado {
  if (contaComViagemEmAndamento(papel)) return naoDeu("Uma das suas viagens está acontecendo agora. Espere ela terminar para excluir a conta.");
  if (papel === "vanzeiro") meusDestinos().forEach((d) => excluirDestino(d.id, hoje));
  else obterMinhasMatriculas().forEach((p) => sairDoDestino(p.id, hoje));
  return deuCerto;
}

/** Whether one of the trips of this account (its destinos, or the destinos the passenger is in) is in progress. */
export function contaComViagemEmAndamento(papel: "vanzeiro" | "passageiro") {
  const destinoIds = papel === "vanzeiro" ? meusDestinos().map((d) => d.id) : obterMinhasMatriculas().map((p) => p.destinoId);
  return destinoIds.some(viagemEmAndamentoNoDestino);
}

const meusDestinos = () => obterDestinos().filter((d) => d.vanzeiroId === idDoVanzeiro());
