import type { Aviso, Destino, Passageiro, RespostaViagem } from "@/data/exemplo";
import { type Cobranca, diaMes, situacao, somarDias, valorFinal } from "@/lib/cobrancas";
import { formatarData, nomeDestino, prazoDaViagem } from "@/lib/destinos";
import { formatarReais } from "@/lib/dinheiro";
import { identidadePassageiro } from "@/lib/passageiros";
import { viagensDoDia } from "@/lib/viagem";

// The notices the app creates by itself, from what happens. Each one has a "chave", so the same
// event never makes two notices.

export type NovoAviso = Omit<Aviso, "id">;

/** "Prazo chegando" is sent this many minutes before the deadline, to whoever has not answered. */
export const MINUTOS_ANTES_DO_PRAZO = 30;
/** "Cobrança vencendo" is sent this many days before the due date. */
export const DIAS_ANTES_DO_VENCIMENTO = 3;

const primeiroNome = (nome: string) => nome.split(" ")[0] ?? nome;
const quando = (data: string, hoje: string) => (data === hoje ? "hoje" : formatarData(data).toLowerCase());

function minutos(data: string, hora: string) {
  const [a = 0, m = 1, d = 1] = data.split("-").map(Number);
  const [h = 0, min = 0] = hora.split(":").map(Number);
  return Date.UTC(a, m - 1, d, h, min) / 60_000;
}

/** Vanzeiro: a passenger answered (or changed the answer). The newest answer replaces the notice. */
export function avisoDeResposta(p: Passageiro, d: Destino, data: string, resposta: RespostaViagem, hoje: string): NovoAviso {
  return {
    chave: `resposta_${p.id}_${data}`,
    vanzeiroId: d.vanzeiroId,
    tipo: "resposta_passageiro",
    paraVanzeiroOuPassageiroId: d.vanzeiroId,
    passageiroId: p.id,
    destinoId: d.id,
    dataCriacao: hoje,
    lido: false,
    textoResumido: `${primeiroNome(p.nome)} respondeu "${resposta === "vai" ? "Vou" : "Não vou"}" para ${quando(data, hoje)}, em ${nomeDestino(d)}`,
  };
}

/**
 * Vanzeiro (T7): a passenger marked or took off a "Não vou de… até…" period. Same kind as an answer
 * ("Resposta de passageiro"); one notice per period, so taking it off replaces the "marcou" one.
 */
export function avisoDePeriodoDeNaoVou(
  p: Passageiro,
  d: Destino,
  periodo: { id: string; de: string; ate: string },
  acao: "marcou" | "tirou",
  hoje: string,
): NovoAviso {
  const dias = periodo.de === periodo.ate ? `em ${diaMes(periodo.de)}` : `de ${diaMes(periodo.de)} até ${diaMes(periodo.ate)}`;
  return {
    chave: `nao_vou_periodo_${periodo.id}`,
    vanzeiroId: d.vanzeiroId,
    tipo: "resposta_passageiro",
    paraVanzeiroOuPassageiroId: d.vanzeiroId,
    passageiroId: p.id,
    destinoId: d.id,
    dataCriacao: hoje,
    lido: false,
    textoResumido:
      acao === "marcou"
        ? `${primeiroNome(p.nome)} marcou "Não vou" ${dias}, em ${nomeDestino(d)}`
        : `${primeiroNome(p.nome)} tirou o "Não vou" ${dias}, em ${nomeDestino(d)}`,
  };
}

/** Passenger: the van left (the vanzeiro started the trip they are in). */
export function avisoDeVanSaiu(p: Passageiro, d: Destino, data: string): NovoAviso {
  return {
    chave: `van_saiu_${p.id}_${data}`,
    vanzeiroId: d.vanzeiroId,
    tipo: "van_saiu",
    paraVanzeiroOuPassageiroId: identidadePassageiro(p),
    passageiroId: p.id,
    destinoId: d.id,
    dataCriacao: data,
    lido: false,
    textoResumido: `A van saiu para a viagem de hoje, em ${nomeDestino(d)}`,
  };
}

/** What the clock creates: overdue charges (vanzeiro), charges falling due soon and deadlines closing (passenger). */
export function avisosDoRelogio(
  agora: { data: string; hora: string },
  destinos: Destino[],
  passageiros: Passageiro[],
  cobrancas: Cobranca[],
  respostasDoDia: (data: string) => Record<string, RespostaViagem>,
): NovoAviso[] {
  const novos: NovoAviso[] = [];
  const hoje = agora.data;
  const destino = (id: string) => destinos.find((d) => d.id === id);

  for (const c of cobrancas) {
    const p = passageiros.find((x) => x.id === c.passageiroId);
    const d = destino(c.destinoId);
    if (!p || !d) continue;
    const s = situacao(c, hoje);
    if (s === "devendo") {
      novos.push({
        chave: `cobranca_vencida_${c.id}`,
        vanzeiroId: c.vanzeiroId,
        tipo: "cobranca_vencida",
        paraVanzeiroOuPassageiroId: c.vanzeiroId,
        passageiroId: p.id,
        cobrancaId: c.id,
        destinoId: d.id,
        dataCriacao: somarDias(c.vencimento, 1),
        lido: false,
        textoResumido: `${primeiroNome(p.nome)} está devendo ${formatarReais(valorFinal(c))}, em ${nomeDestino(d)}`,
      });
    } else if (s === "pendente" && c.vencimento <= somarDias(hoje, DIAS_ANTES_DO_VENCIMENTO)) {
      novos.push({
        chave: `cobranca_vencendo_${c.id}`,
        vanzeiroId: c.vanzeiroId,
        tipo: "cobranca_vencendo",
        paraVanzeiroOuPassageiroId: identidadePassageiro(p),
        passageiroId: p.id,
        cobrancaId: c.id,
        destinoId: d.id,
        dataCriacao: hoje,
        lido: false,
        textoResumido: `${c.referencia} de ${formatarReais(valorFinal(c))} vence ${c.vencimento === hoje ? "hoje" : `em ${diaMes(c.vencimento)}`}, em ${nomeDestino(d)}`,
      });
    }
  }

  const agoraMin = minutos(agora.data, agora.hora);
  for (const data of [hoje, somarDias(hoje, 1)]) {
    const respostas = respostasDoDia(data);
    for (const d of viagensDoDia(destinos, data)) {
      const prazo = prazoDaViagem(d, data);
      const faltam = minutos(prazo.data, prazo.hora) - agoraMin;
      if (faltam <= 0 || faltam > MINUTOS_ANTES_DO_PRAZO) continue;
      for (const p of passageiros.filter((x) => x.destinoId === d.id && respostas[x.id] === undefined)) {
        novos.push({
          chave: `prazo_${p.id}_${data}`,
          vanzeiroId: d.vanzeiroId,
          tipo: "prazo_chegando",
          paraVanzeiroOuPassageiroId: identidadePassageiro(p),
          passageiroId: p.id,
          destinoId: d.id,
          dataCriacao: hoje,
          lido: false,
          textoResumido: `Responda até ${prazo.hora} se vai ${quando(data, hoje)}, em ${nomeDestino(d)}`,
        });
      }
    }
  }
  return novos;
}
