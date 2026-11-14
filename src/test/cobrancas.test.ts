import { describe, expect, it } from "vitest";
import { DATA_DE_HOJE, passageirosExemplo, type Passageiro } from "@/data/exemplo";
import {
  contaDoDesconto,
  filtrarCobrancas,
  gerarCobrancas,
  mensagemCobranca,
  proximaCobranca,
  resumoDoMes,
  situacao,
  totalDevido,
  valorFinal,
  type Cobranca,
} from "@/lib/cobrancas";
import { cancelarCobranca, marcarComoPago, obterCobrancas } from "@/lib/cobrancas-store";

const base: Passageiro = {
  id: "p-x",
  vanzeiroId: "vanzeiro-carlos",
  destinoId: "d",
  nome: "Teste Silva",
  telefone: "43999990000",
  cidade: "A",
  endereco: "B",
  plano: "mensal",
  valor: 280,
  vencimento: 10,
  descontaFaltas: false,
  valorFalta: null,
};
const vazio = { embarques: [], faltas: [] };
const hoje = "2026-11-13";

describe("Cobranças criadas pelo plano", () => {
  it("mensal: one charge per month on the due day", () => {
    const cs = gerarCobrancas(base, "2026-10-01", "2026-11-30", hoje, vazio);
    expect(cs.map((c) => c.vencimento)).toEqual(["2026-10-10", "2026-11-10"]);
    expect(cs[1]?.referencia).toBe("Mensalidade de novembro");
  });
  it("quinzenal: two fixed days a month, the due day and 15 days away (decisão 10)", () => {
    const cs = gerarCobrancas({ ...base, plano: "quinzenal", vencimento: 5 }, "2026-10-01", "2026-11-30", hoje, vazio);
    expect(cs.map((c) => c.vencimento)).toEqual(["2026-10-05", "2026-10-20", "2026-11-05", "2026-11-20"]);
    expect(cs.map((c) => c.referencia)).toEqual(["Quinzena de 21/09 a 05/10", "Quinzena de 06/10 a 20/10", "Quinzena de 21/10 a 05/11", "Quinzena de 06/11 a 20/11"]);
  });
  it("por viagem: one charge per trip boarded", () => {
    const embarques = [
      { passageiroId: "p-x", data: "2026-11-06" },
      { passageiroId: "p-x", data: "2026-11-08" },
      { passageiroId: "outro", data: "2026-11-07" },
    ];
    const cs = gerarCobrancas({ ...base, plano: "viagem", vencimento: null, valor: 45 }, "2026-11-01", "2026-11-30", hoje, { embarques, faltas: [] });
    expect(cs.map((c) => c.referencia)).toEqual(["Viagem de 06/11", "Viagem de 08/11"]);
  });
  it("diário: one charge per day the passenger went, even with two trips that day", () => {
    const embarques = [
      { passageiroId: "p-x", data: "2026-11-09" },
      { passageiroId: "p-x", data: "2026-11-09" },
      { passageiroId: "p-x", data: "2026-11-10" },
    ];
    const cs = gerarCobrancas({ ...base, plano: "diario", vencimento: null, valor: 22 }, "2026-11-01", "2026-11-30", hoje, { embarques, faltas: [] });
    expect(cs).toHaveLength(2);
  });
});

describe("Desconto de faltas", () => {
  it("shows the math of a mensal with 2 faltas", () => {
    const faltas = [
      { passageiroId: "p-x", avisouNoPrazo: true, data: "2026-10-17" },
      { passageiroId: "p-x", avisouNoPrazo: true, data: "2026-10-24" },
    ];
    const [, nov] = gerarCobrancas({ ...base, descontaFaltas: true, valorFalta: 15 }, "2026-10-01", "2026-11-30", hoje, { embarques: [], faltas });
    expect(valorFinal(nov!)).toBe(250);
    expect(contaDoDesconto(nov!)?.replace(/\s/g, " ")).toBe("Mensalidade R$ 280,00 − 2 faltas × R$ 15,00 = R$ 250,00");
  });
  it("does not discount faltas when the plan does not ask for it", () => {
    const faltas = [{ passageiroId: "p-x", avisouNoPrazo: true, data: "2026-10-17" }];
    const [, nov] = gerarCobrancas(base, "2026-10-01", "2026-11-30", hoje, { embarques: [], faltas });
    expect(valorFinal(nov!)).toBe(280);
  });
  it("the sample data has at least one passenger with discount", () => {
    expect(passageirosExemplo.some((p) => p.descontaFaltas)).toBe(true);
  });
});

function cobranca(parcial: Partial<Cobranca>): Cobranca {
  return {
    id: "c",
    vanzeiroId: "vanzeiro-carlos",
    passageiroId: "p-x",
    destinoId: "d",
    nome: "Teste",
    telefone: "43999990000",
    tipo: "mensal",
    referencia: "Mensalidade de novembro",
    vencimento: "2026-11-20",
    valorBase: 100,
    faltas: 0,
    valorFalta: 0,
    periodoFaltas: null,
    pagamento: null,
    cancelamento: null,
    ...parcial,
  };
}

describe("Situação das cobranças", () => {
  it("pendente = not paid and not due yet; devendo = due and not paid; pago = paid", () => {
    expect(situacao(cobranca({ vencimento: "2026-11-13" }), hoje)).toBe("pendente");
    expect(situacao(cobranca({ vencimento: "2026-11-12" }), hoje)).toBe("devendo");
    expect(situacao(cobranca({ pagamento: { data: hoje, forma: "pix" } }), hoje)).toBe("pago");
  });
  it("what a passenger owes is the sum of their unpaid charges; cancelled ones don't count", () => {
    const lista = [
      cobranca({ id: "1", valorBase: 100 }),
      cobranca({ id: "2", valorBase: 50, vencimento: "2026-11-01" }),
      cobranca({ id: "3", valorBase: 70, pagamento: { data: hoje, forma: "pix" } }),
      cobranca({ id: "4", valorBase: 30, cancelamento: { data: hoje, motivo: "x" } }),
    ];
    expect(totalDevido(lista, "p-x")).toBe(150);
  });
  it("month summary: a receber, recebido and devendo, without cancelled ones", () => {
    const lista = [
      cobranca({ id: "1", valorBase: 100 }),
      cobranca({ id: "2", valorBase: 50, vencimento: "2026-11-01" }),
      cobranca({ id: "3", valorBase: 70, pagamento: { data: hoje, forma: "pix" } }),
      cobranca({ id: "4", valorBase: 30, cancelamento: { data: hoje, motivo: "x" } }),
      cobranca({ id: "5", valorBase: 40, vencimento: "2026-10-20" }),
      cobranca({ id: "6", valorBase: 90, vencimento: "2026-10-10", pagamento: { data: "2026-10-10", forma: "pix" } }),
    ];
    expect(resumoDoMes(lista, hoje)).toEqual({ aReceber: 190, recebido: 70, devendo: 90, pagos: 1, pendentes: 1, devendoQtd: 2 });
  });
  it("filters keep only the chosen situation, newest first", () => {
    const lista = [
      cobranca({ id: "a", vencimento: "2026-11-20" }),
      cobranca({ id: "b", vencimento: "2026-11-01" }),
      cobranca({ id: "c", vencimento: "2026-11-25" }),
    ];
    expect(filtrarCobrancas(lista, "pendentes", hoje).map((c) => c.id)).toEqual(["c", "a"]);
    expect(filtrarCobrancas(lista, "devendo", hoje).map((c) => c.id)).toEqual(["b"]);
  });
  it("the WhatsApp message has the value and the due date", () => {
    const m = mensagemCobranca(cobranca({ valorBase: 280 }), "Centro → Unisul", hoje).replace(/\s/g, " ");
    expect(m).toContain("R$ 280,00");
    expect(m).toContain("20/11");
  });
});

describe("Pagar e cancelar", () => {
  it("marking as paid records the form and date and keeps the value", () => {
    const alvo = obterCobrancas().find((c) => c.id === "p-mariana_2026-11-10")!;
    marcarComoPago(alvo.id, "dinheiro");
    const depois = obterCobrancas().find((c) => c.id === alvo.id)!;
    expect(depois.pagamento).toEqual({ data: DATA_DE_HOJE, forma: "dinheiro" });
    expect(valorFinal(depois)).toBe(valorFinal(alvo));
  });
  it("a cancelled charge stays in the history with its reason", () => {
    const alvo = obterCobrancas().find((c) => c.id === "p-beatriz_2026-11-05")!;
    cancelarCobranca(alvo.id, "Combinado com a família");
    const depois = obterCobrancas().find((c) => c.id === alvo.id)!;
    expect(depois.cancelamento?.motivo).toBe("Combinado com a família");
    expect(situacao(depois, DATA_DE_HOJE)).toBe("cancelada");
  });
  it("a new mensal passenger gets the next charge on the next due day", () => {
    expect(proximaCobranca({ ...base, vencimento: 10 }, hoje)?.vencimento).toBe("2026-12-10");
    expect(proximaCobranca({ ...base, vencimento: 20 }, hoje)?.vencimento).toBe("2026-11-20");
    expect(proximaCobranca({ ...base, plano: "viagem" }, hoje)).toBeNull();
  });
});

import { aplicarEmbarque, aplicarFalta } from "@/lib/cobrancas";

describe("Viagem → Financeiro", () => {
  const p = (extra: Partial<Passageiro>): Passageiro => ({ ...base, id: "x", ...extra });

  it("'Embarcou' creates that day's charge for Por viagem and Diário, only once", () => {
    const porViagem = p({ plano: "viagem", valor: 45, vencimento: null, descontaFaltas: false, valorFalta: null });
    const lista = aplicarEmbarque([], porViagem, "2026-11-13", "2026-11-13");
    expect(lista.map((c) => [c.vencimento, c.valorBase, c.referencia])).toEqual([["2026-11-20", 45, "Viagem de 13/11"]]);
    expect(aplicarEmbarque(lista, porViagem, "2026-11-13", "2026-11-13")).toHaveLength(1);
    const diario = p({ plano: "diario", valor: 80, vencimento: null, descontaFaltas: false, valorFalta: null });
    expect(aplicarEmbarque([], diario, "2026-11-13", "2026-11-13")[0]?.referencia).toBe("Diária de 13/11");
  });

  it("'Embarcou' doesn't create charges for mensal or quinzenal", () => {
    expect(aplicarEmbarque([], p({ plano: "mensal" }), "2026-11-13", "2026-11-13")).toEqual([]);
  });

  it("On-time 'Não vou' adds a falta to the next open charge when the plan discounts", () => {
    const quinzenal = p({ plano: "quinzenal", valor: 140, vencimento: 5, descontaFaltas: true, valorFalta: 10 });
    const aberta = cobranca({ id: "q", passageiroId: "x", tipo: "quinzenal", vencimento: "2026-11-19", valorBase: 140 });
    const paga = cobranca({ id: "old", passageiroId: "x", tipo: "quinzenal", vencimento: "2026-11-04", valorBase: 140, pagamento: { data: "2026-11-04", forma: "pix" } });
    const [antiga, nova] = aplicarFalta([paga, aberta], quinzenal, "2026-11-13", "2026-11-13", true);
    expect(antiga).toBe(paga);
    expect(valorFinal(nova!)).toBe(130);
  });

  it("without an open charge, the falta goes into the next one created", () => {
    const mensal = p({ plano: "mensal", valor: 280, vencimento: 10, descontaFaltas: true, valorFalta: 15 });
    const [c] = aplicarFalta([], mensal, "2026-11-13", "2026-11-13", true);
    expect(c?.vencimento).toBe("2026-12-10");
    expect(c?.faltas).toBe(1);
    expect(valorFinal(c!)).toBe(265);
  });

  it("no discount, no change", () => {
    expect(aplicarFalta([], p({ plano: "mensal", descontaFaltas: false }), "2026-11-13", "2026-11-13")).toEqual([]);
  });
});

describe("Por viagem e Diário vencem 7 dias depois do embarque (decisão 8)", () => {
  it("o nome e a chave seguem o dia do embarque; o vencimento é 7 dias depois", () => {
    const [c] = gerarCobrancas({ ...base, plano: "diario", vencimento: null, valor: 22 }, "2026-11-01", "2026-11-30", hoje, { embarques: [{ passageiroId: "p-x", data: "2026-11-08" }], faltas: [] });
    expect([c?.id, c?.referencia, c?.vencimento]).toEqual(["p-x_2026-11-08", "Diária de 08/11", "2026-11-15"]);
    expect(situacao(c!, "2026-11-15")).toBe("pendente");
    expect(situacao(c!, "2026-11-16")).toBe("devendo");
  });
});

describe("Quinzenal com duas datas fixas (decisão 10)", () => {
  it("dia 20 vence 5 e 20; dia 15 vence 15 e 30, e em fevereiro no último dia", async () => {
    const { vencimentosQuinzenais } = await import("@/lib/cobrancas");
    expect(vencimentosQuinzenais(20, "2026-11-01", "2026-12-31")).toEqual(["2026-11-05", "2026-11-20", "2026-12-05", "2026-12-20"]);
    expect(vencimentosQuinzenais(15, "2027-01-01", "2027-03-31")).toEqual(["2027-01-15", "2027-01-30", "2027-02-15", "2027-02-28", "2027-03-15", "2027-03-30"]);
  });
  it("as faltas descontadas são da quinzena: do dia seguinte ao vencimento anterior até o vencimento", () => {
    const cs = gerarCobrancas({ ...base, plano: "quinzenal", vencimento: 5, descontaFaltas: true, valorFalta: 10 }, "2026-11-01", "2026-11-30", "2026-11-25", {
      embarques: [],
      faltas: [
        { passageiroId: "p-x", data: "2026-10-21", avisouNoPrazo: true },
        { passageiroId: "p-x", data: "2026-11-06", avisouNoPrazo: true },
      ],
    });
    expect(cs.map((c) => [c.vencimento, c.faltas, c.periodoFaltas])).toEqual([
      ["2026-11-05", 1, { de: "2026-10-21", ate: "2026-11-05" }],
      ["2026-11-20", 1, { de: "2026-11-06", ate: "2026-11-20" }],
    ]);
  });
});

describe("A próxima cobrança nasce quando a atual vence (decisão 9)", () => {
  it("só existe uma cobrança à frente de hoje", () => {
    const cs = gerarCobrancas({ ...base, plano: "quinzenal", vencimento: 15 }, "2026-11-01", "2026-12-31", "2026-11-13", vazio);
    expect(cs.map((c) => c.vencimento)).toEqual(["2026-11-15"]);
  });

  it("no dia em que a atual vence, o relógio do app cria a próxima, e só uma vez", async () => {
    const { criarProximasCobrancas, obterCobrancas: todas } = await import("@/lib/cobrancas-store");
    const pedro = passageirosExemplo.find((p) => p.id === "p-pedro")!;
    const doPedro = () => todas().filter((c) => c.passageiroId === "p-pedro" && c.vencimento > "2026-11-13").map((c) => c.vencimento);
    criarProximasCobrancas([pedro], "2026-11-13");
    expect(doPedro()).toEqual(["2026-11-15"]);
    criarProximasCobrancas([pedro], "2026-11-15");
    criarProximasCobrancas([pedro], "2026-11-15");
    expect(doPedro()).toEqual(["2026-11-15", "2026-11-30"]);
  });
});

describe("Financeiro mostra o mês, igual ao Início (Etapa A 4.1)", () => {
  it("cada filtro tem a mesma quantidade que o resumo do Início", async () => {
    const { obterCobrancas: todas } = await import("@/lib/cobrancas-store");
    const lista = todas();
    const r = resumoDoMes(lista, hoje);
    expect(filtrarCobrancas(lista, "pagas", hoje).length).toBe(r.pagos);
    expect(filtrarCobrancas(lista, "pendentes", hoje).length).toBe(r.pendentes);
    expect(filtrarCobrancas(lista, "devendo", hoje).length).toBe(r.devendoQtd);
  });
  it("paga de outro mês sai do Financeiro; devendo de outro mês continua", () => {
    const lista = [
      cobranca({ id: "paga-outubro", vencimento: "2026-10-10", pagamento: { data: "2026-10-10", forma: "pix" } }),
      cobranca({ id: "devendo-outubro", vencimento: "2026-10-20" }),
    ];
    expect(filtrarCobrancas(lista, "todas", hoje).map((c) => c.id)).toEqual(["devendo-outubro"]);
  });
});
