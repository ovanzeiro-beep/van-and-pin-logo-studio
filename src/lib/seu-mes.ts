import type { ViagemEncerrada } from "@/data/exemplo";
import { mesmoMes, situacao, valorFinal, type Cobranca } from "@/lib/cobrancas";

// T5 "Seu mês na van" (section 18 of docs/fonte-da-verdade.md). Decisions of the owner (16/11): no expenses for now;
// opened from the Financeiro; "quem paga em dia" with the number and the names; this month and the ones before.
// The month of a cobrança is the month it falls due, the same rule as the Financeiro, so "Recebido" matches it.

export type SituacaoNoMes = "em-dia" | "atrasado" | "devendo" | "a-vencer";
export type PessoaNoMes = { passageiroId: string; destinoId: string; nome: string; situacao: SituacaoNoMes; falta: number };

export type SeuMes = {
  mes: string; // "AAAA-MM"
  recebido: number;
  faltaReceber: number;
  viagens: number;
  embarques: number;
  /** People whose cobranças of the month are already due or paid (the ones that count for "em dia"). */
  emDia: PessoaNoMes[];
  atrasados: PessoaNoMes[];
  devendo: PessoaNoMes[];
  aVencer: PessoaNoMes[];
};

/** How one person did in the month: owing beats paid late, which beats paid on time; only not-due-yet → "a-vencer". */
function situacaoDaPessoa(cs: Cobranca[], hoje: string): SituacaoNoMes {
  const s = cs.map((c) => situacao(c, hoje));
  if (s.includes("devendo")) return "devendo";
  if (s.includes("pendente") && !s.includes("pago")) return "a-vencer";
  const pagas = cs.filter((c) => c.pagamento);
  if (pagas.some((c) => c.pagamento!.data > c.vencimento)) return "atrasado";
  return s.includes("pendente") ? "a-vencer" : "em-dia";
}

export function seuMes(cobrancas: Cobranca[], viagens: Pick<ViagemEncerrada, "data" | "embarcaram">[], mes: string, hoje: string): SeuMes {
  const doMes = cobrancas.filter((c) => !c.cancelamento && mesmoMes(c.vencimento, `${mes}-01`));
  const recebido = doMes.filter((c) => c.pagamento).reduce((s, c) => s + valorFinal(c), 0);
  const faltaReceber = doMes.filter((c) => !c.pagamento).reduce((s, c) => s + valorFinal(c), 0);
  const feitas = viagens.filter((v) => v.data.startsWith(mes) && v.data <= hoje);

  const porPessoa = new Map<string, Cobranca[]>();
  for (const c of doMes) porPessoa.set(c.passageiroId, [...(porPessoa.get(c.passageiroId) ?? []), c]);
  const pessoas: PessoaNoMes[] = [...porPessoa.entries()]
    .map(([passageiroId, cs]) => ({
      passageiroId,
      destinoId: cs[0]!.destinoId,
      nome: cs[0]!.nome,
      situacao: situacaoDaPessoa(cs, hoje),
      falta: cs.filter((c) => !c.pagamento).reduce((s, c) => s + valorFinal(c), 0),
    }))
    .sort((a, b) => a.nome.localeCompare(b.nome));
  const de = (s: SituacaoNoMes) => pessoas.filter((p) => p.situacao === s);

  return {
    mes,
    recebido,
    faltaReceber,
    viagens: feitas.length,
    embarques: feitas.reduce((s, v) => s + v.embarcaram.length, 0),
    emDia: de("em-dia"),
    atrasados: de("atrasado"),
    devendo: de("devendo"),
    aVencer: de("a-vencer"),
  };
}

/** Months with something to show, from the oldest to this one ("AAAA-MM"). */
export function mesesDisponiveis(cobrancas: Pick<Cobranca, "vencimento">[], viagens: Pick<ViagemEncerrada, "data">[], hoje: string): string[] {
  const atual = hoje.slice(0, 7);
  const datas = [...cobrancas.map((c) => c.vencimento), ...viagens.map((v) => v.data)].map((d) => d.slice(0, 7)).filter((m) => m <= atual);
  let m = datas.reduce((menor, x) => (x < menor ? x : menor), atual);
  const meses: string[] = [];
  while (m <= atual) {
    meses.push(m);
    const [a = 0, n = 0] = m.split("-").map(Number);
    m = n === 12 ? `${a + 1}-01` : `${a}-${String(n + 1).padStart(2, "0")}`;
  }
  return meses;
}

