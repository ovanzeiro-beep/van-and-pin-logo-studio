import type { Destino } from "@/data/exemplo";
import { dataDeHoje } from "@/lib/agora";
import { criarAviso } from "@/lib/avisos-store";
import { quando, somarDias } from "@/lib/datas";
import { nomeDestino } from "@/lib/destinos";
import { mudarDiasCancelados, obterDestinos } from "@/lib/destinos-store";
import { identidadePassageiro } from "@/lib/passageiros";
import { obterPassageiros } from "@/lib/passageiros-store";
import { aconteceEm, teriaViagemEm } from "@/lib/viagem";
import { obterViagensDoDia } from "@/lib/viagem-store";
import { deuCerto, naoDeu, SEM_DESTINO, type Resultado } from "@/lib/acoes";
import { frase } from "@/lib/formatos";

// Cancelling the trip of one day (owner's decision, 16/11/2026): feriado, no class. Passengers are warned;
// the mensalista gets NO discount (the day is already inside the month); por viagem and diário pay nothing
// because nobody boards. It can be undone until the day.

export const MOTIVO_MAX = 60;


/** Whether the trip of that day already started (today only): then it can no longer be cancelled. */
function viagemJaComecou(destinoId: string, data: string, hoje: string) {
  return data === hoje && !!obterViagensDoDia().viagens[destinoId];
}

/** The next days this destino has a trip that can still be cancelled (today included while not started). */
export function diasQuePodemSerCancelados(d: Destino, hoje = dataDeHoje(), quantos = 20, comecou = viagemJaComecou) {
  const dias: string[] = [];
  for (let i = 0; i <= 120 && dias.length < quantos; i++) {
    const data = somarDias(hoje, i);
    if (!teriaViagemEm(d, data)) continue;
    if (d.diasCancelados?.some((c) => c.data === data)) continue;
    if (comecou(d.id, data, hoje)) continue;
    dias.push(data);
  }
  return dias;
}

/** Cancelled days that can still be undone (today or later). */
export function diasCanceladosFuturos(d: Pick<Destino, "diasCancelados">, hoje = dataDeHoje()) {
  return (d.diasCancelados ?? []).filter((c) => c.data >= hoje).sort((a, b) => a.data.localeCompare(b.data));
}

function avisarPassageiros(d: Destino, data: string, texto: (nome: string) => string, tipo: "viagem_cancelada" | "viagem_de_volta") {
  const hoje = dataDeHoje();
  const pessoas = new Map(obterPassageiros().filter((p) => p.destinoId === d.id).map((p) => [identidadePassageiro(p), p]));
  for (const [identidade, p] of pessoas) {
    // Each cancel or undo is a new action of the vanzeiro: always a new notice.
    criarAviso({
      vanzeiroId: d.vanzeiroId,
      tipo,
      paraVanzeiroOuPassageiroId: identidade,
      passageiroId: p.id,
      destinoId: d.id,
      dataCriacao: hoje,
      lido: false,
      textoResumido: texto(nomeDestino(d)),
    });
  }
}

/** "Não vai ter viagem neste dia". Returns false (and changes nothing) when the day can't be cancelled. */
export function cancelarViagemDoDia(destinoId: string, data: string, motivo: string): Resultado {
  const d = obterDestinos().find((x) => x.id === destinoId);
  const hoje = dataDeHoje();
  const m = frase(motivo);
  if (!d) return naoDeu(SEM_DESTINO);
  if (!m) return naoDeu("Escreva o motivo (ex.: Feriado).");
  if (m.length > MOTIVO_MAX) return naoDeu(`O motivo pode ter até ${MOTIVO_MAX} letras.`);
  if (!diasQuePodemSerCancelados(d, hoje, 1000).includes(data)) return naoDeu("Este dia não pode ser cancelado: não tem viagem nele, já passou ou a viagem já começou.");
  const novo = { ...d, diasCancelados: [...(d.diasCancelados ?? []), { data, motivo: m, canceladoEm: hoje }] };
  mudarDiasCancelados(d.id, novo.diasCancelados);
  avisarPassageiros(d, data, (nome) => textoDoCancelamento(novo, nome, data, m, hoje), "viagem_cancelada");
  return deuCerto;
}

/** "Desfazer": the trip of that day happens again (only for today or later). */
export function desfazerCancelamento(destinoId: string, data: string): Resultado {
  const d = obterDestinos().find((x) => x.id === destinoId);
  const hoje = dataDeHoje();
  if (!d) return naoDeu(SEM_DESTINO);
  if (data < hoje) return naoDeu("Este dia já passou.");
  if (!d.diasCancelados?.some((c) => c.data === data)) return naoDeu("Este dia não está mais cancelado.");
  mudarDiasCancelados(d.id, d.diasCancelados.filter((c) => c.data !== data));
  avisarPassageiros(d, data, (nome) => `A viagem de ${quando(data, hoje)} vai acontecer, em ${nome}.`, "viagem_de_volta");
  return deuCerto;
}

/** The next day with a trip after `data` (within ~4 months), to tell the passenger when the van runs again. */
export function proximaViagemDepois(d: Destino, data: string) {
  for (let i = 1; i <= 120; i++) {
    const dia = somarDias(data, i);
    if (aconteceEm(d, dia)) return dia;
  }
  return null;
}

/** The notice of a cancelled day: when, which trip, why, and when the van runs again. */
export function textoDoCancelamento(d: Destino, nome: string, data: string, motivo: string, hoje: string) {
  const prox = proximaViagemDepois(d, data);
  return `Viagem cancelada ${quando(data, hoje)}: ${nome}. Motivo: ${motivo}. Não precisa confirmar presença.${prox ? ` A próxima viagem é ${quando(prox, hoje)}, às ${d.saida}.` : ""}`;
}
