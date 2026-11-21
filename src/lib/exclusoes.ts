import type { Passageiro } from "@/data/exemplo";
import { dataDeHoje } from "@/lib/agora";
import { cancelarPeriodosFuturosDe, obterCobrancas } from "@/lib/cobrancas-store";
import { alternarAtivo, obterDestinos, removerDestino } from "@/lib/destinos-store";
import { obterPassageiros, removerDoDestino, sairDaMatricula } from "@/lib/passageiros-store";
import { obterMinhasMatriculas } from "@/lib/sessao-passageiro";
import { idDoVanzeiro } from "@/lib/sessao";
import { emAndamento, obterViagensDoDia } from "@/lib/viagem-store";
import { deuCerto, naoDeu, SEM_DESTINO, type Resultado } from "@/lib/acoes";
import { valorFinal } from "@/lib/cobrancas";
import { USA_BANCO } from "@/lib/supabase";

// Excluir destino (vanzeiro) and Sair deste destino (passageiro). Correção 2 (D1-C, 20/11/2026): paid, cancelled and
// overdue charges stay, and so do trips made and periods already started; only charges of a period that starts after
// the exit are cancelled. With the database, the database does it (one rule for every phone) and the app reads it back;
// without it (samples, tests), the app applies the same rule here.
const cancelarNaMemoria = (
  passageiros: Pick<Passageiro, "id" | "vencimento">[],
  motivo: string,
  hoje: string,
) => {
  if (!USA_BANCO.destinos) cancelarPeriodosFuturosDe(passageiros, motivo, hoje);
};
export const MOTIVO_DESTINO_EXCLUIDO = "Destino excluído";
export const MOTIVO_SAIU_DO_DESTINO = "Saiu do destino";
export const MOTIVO_REMOVIDO_DO_DESTINO = "Removido do destino";
/** Correção 5: what the vanzeiro still has to receive (shown before deleting the account, with the report). */
export function aReceberAntesDeExcluir(vanzeiroId = idDoVanzeiro()) {
  const abertas = obterCobrancas().filter((c) => c.vanzeiroId === vanzeiroId && !c.pagamento && !c.cancelamento);
  return { quantos: new Set(abertas.map((c) => c.passageiroId)).size, valor: abertas.reduce((s, c) => s + valorFinal(c), 0) };
}
const VIAGEM_ACONTECENDO = "A viagem de hoje deste destino está acontecendo. Espere ela terminar.";

/** Neither works while that destino's trip of today is in progress. */
export function viagemEmAndamentoNoDestino(destinoId: string) {
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
  cancelarNaMemoria(
    obterPassageiros().filter((p) => p.destinoId === destinoId),
    MOTIVO_DESTINO_EXCLUIDO,
    hoje,
  );
  removerDoDestino(destinoId);
  removerDestino(destinoId);
  return deuCerto;
}

/** The passenger leaves one destino. Returns false while that destino's trip is in progress. */
export function sairDoDestino(passageiroId: string, hoje = dataDeHoje()): Resultado {
  const p = obterPassageiros().find((x) => x.id === passageiroId);
  if (!p) return naoDeu(SEM_DESTINO);
  if (viagemEmAndamentoNoDestino(p.destinoId)) return naoDeu(VIAGEM_ACONTECENDO);
  cancelarNaMemoria([p], MOTIVO_SAIU_DO_DESTINO, hoje);
  sairDaMatricula(p.id);
  return deuCerto;
}

/** The vanzeiro removes a passenger from a destino (decision 2, same as decision 6). Returns false while that trip is in progress. */
export function removerPassageiroDoDestino(passageiroId: string, hoje = dataDeHoje()): Resultado {
  const p = obterPassageiros().find((x) => x.id === passageiroId);
  if (!p) return naoDeu("Não achamos este passageiro. Ele pode já ter saído do destino.");
  if (viagemEmAndamentoNoDestino(p.destinoId)) return naoDeu(VIAGEM_ACONTECENDO);
  cancelarNaMemoria([p], MOTIVO_REMOVIDO_DO_DESTINO, hoje);
  sairDaMatricula(p.id);
  return deuCerto;
}

/** Delete the account entirely: the vanzeiro deletes all their destinos; the passenger leaves all
 * their destinos. Returns false (and changes nothing) while one of those trips is in progress. */
export function excluirMinhaConta(papel: "vanzeiro" | "passageiro", hoje = dataDeHoje()): Resultado {
  if (contaComViagemEmAndamento(papel)) return naoDeu("Uma das suas viagens está acontecendo agora. Espere ela terminar para excluir a conta.");
  // Correção 5 (decisão A): legitimate debts stay open; only charges of future periods are cancelled (Correção 2).
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
