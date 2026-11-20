import { describe, expect, it } from "vitest";
import type { Passageiro } from "@/data/exemplo";
import {
  aplicarEmbarque,
  aplicarFalta,
  cancelarPeriodosFuturos,
  gerarCobrancas,
  proximaCobranca,
  resumoDoMes,
  totalDevido,
  valorFinal,
  vencimentosQuinzenais,
  type Cobranca,
} from "@/lib/cobrancas";
import { seuMes } from "@/lib/seu-mes";
import { gastosDoMes, sobrouNoMes, totalDosGastos, type Gasto } from "@/lib/gastos";

// Fichas de aceite com valores esperados calculados antes da execução.
// Não chamam produção nem calculam o esperado pela função sob teste.
const pessoa = (plano: Passageiro["plano"]): Passageiro => ({
  id: `ficha-${plano}`,
  vanzeiroId: "motorista-ficticio",
  destinoId: "destino-ficticio",
  nome: "Pessoa Fictícia",
  telefone: "11999990000",
  cidade: "Cidade Teste",
  endereco: "Rua Teste, 1",
  plano,
  valor: 30000,
  vencimento: plano === "mensal" || plano === "quinzenal" ? 20 : null,
  descontaFaltas: false,
  valorFalta: null,
});

const cobranca = (id: string, dados: Partial<Cobranca>): Cobranca => ({
  id,
  vanzeiroId: "motorista-ficticio",
  passageiroId: "pessoa-a",
  destinoId: "destino-ficticio",
  nome: "Pessoa A",
  telefone: "11999990000",
  tipo: "mensal",
  referencia: "Ficha de aceite",
  vencimento: "2026-11-20",
  valorBase: 30000,
  faltas: 0,
  valorFalta: 0,
  periodoFaltas: null,
  pagamento: null,
  cancelamento: null,
  ...dados,
});

describe("Etapa 6: fichas financeiras de aceite", () => {
  it.each([
    ["viagem", 2, 6666],
    ["diario", 1, 3333],
  ] as const)("%s: duas viagens no dia e toque repetido", (plano, quantidade, total) => {
    const p = { ...pessoa(plano), valor: 3333 };
    let cs = aplicarEmbarque([], p, "2026-11-30", "2026-11-30", "ida-1");
    cs = aplicarEmbarque(cs, p, "2026-11-30", "2026-11-30", "ida-1");
    cs = aplicarEmbarque(cs, p, "2026-11-30", "2026-11-30", "ida-2");
    expect(cs).toHaveLength(quantidade);
    expect(cs.reduce((s, c) => s + valorFinal(c), 0)).toBe(total);
    expect(cs.every((c) => c.vencimento === "2026-12-07")).toBe(true);
  });

  it("Por viagem: a volta no dia seguinte não cria outra cobrança", () => {
    const p = { ...pessoa("viagem"), valor: 3333 };
    const ida = aplicarEmbarque([], p, "2026-11-30", "2026-11-30", "ida-1");
    const volta = aplicarEmbarque(ida, p, "2026-12-01", "2026-12-01", "ida-1");
    expect(volta).toEqual(ida);
    expect(volta).toHaveLength(1);
    expect(valorFinal(volta[0]!)).toBe(3333);
  });

  it("Mensal: vencimento 31 em fevereiro bissexto e passagem de ano", () => {
    const p = { ...pessoa("mensal"), vencimento: 31 };
    expect(proximaCobranca(p, "2028-02-01")?.vencimento).toBe("2028-02-29");
    expect(proximaCobranca(p, "2027-02-01")?.vencimento).toBe("2027-02-28");
    expect(proximaCobranca(p, "2026-12-31")?.vencimento).toBe("2026-12-31");
    expect(proximaCobranca(p, "2027-01-01")?.vencimento).toBe("2027-01-31");
  });

  it("Quinzenal: dias fixos 15/30, com último dia de fevereiro", () => {
    expect(vencimentosQuinzenais(15, "2028-02-01", "2028-03-31")).toEqual([
      "2028-02-15",
      "2028-02-29",
      "2028-03-15",
      "2028-03-30",
    ]);
    expect(vencimentosQuinzenais(20, "2026-12-01", "2027-01-31")).toEqual([
      "2026-12-05",
      "2026-12-20",
      "2027-01-05",
      "2027-01-20",
    ]);
  });

  it.each(["mensal", "quinzenal"] as const)(
    "%s: desconto apenas da falta avisada, por data, sem valor negativo",
    (plano) => {
      const p = { ...pessoa(plano), valor: 3000, descontaFaltas: true, valorFalta: 2000 };
      const cs = gerarCobrancas(p, "2026-11-01", "2026-11-30", "2026-11-18", {
        embarques: [],
        faltas: [
          { passageiroId: p.id, data: "2026-11-16", avisouNoPrazo: true },
          { passageiroId: p.id, data: "2026-11-16", avisouNoPrazo: true },
          { passageiroId: p.id, data: "2026-11-17", avisouNoPrazo: true },
          { passageiroId: p.id, data: "2026-11-18", avisouNoPrazo: false },
        ],
      });
      const c = cs.find((c) => c.vencimento === "2026-11-20")!;
      expect(c.faltas).toBe(2);
      expect(valorFinal(c)).toBe(0);
      expect(aplicarFalta([c], p, "2026-11-18", "2026-11-18", false)).toEqual([c]);
    },
  );

  it("cobranças encerradas mantêm o valor e a saída conserva a dívida vencida e o mês em andamento", () => {
    const p = { ...pessoa("mensal"), id: "pessoa-a", descontaFaltas: true, valorFalta: 1500 };
    const paga = cobranca("paga", { pagamento: { data: "2026-11-17", forma: "pix" } });
    const cancelada = cobranca("cancelada", {
      cancelamento: { data: "2026-11-17", motivo: "Cortesia" },
    });
    const vencida = cobranca("vencida", { vencimento: "2026-10-20", valorBase: 6000 });
    const aberta = cobranca("aberta", {});
    const antes = [paga, cancelada, vencida, aberta];
    const depois = aplicarFalta(antes, p, "2026-11-18", "2026-11-18", true);
    expect(depois.slice(0, 3)).toEqual(antes.slice(0, 3));
    expect(valorFinal(depois[3]!)).toBe(28500);
    // Correção 2 (D1-C): o mês 21/10–20/11 já começou em 18/11; ele fica, com o desconto da falta.
    const saida = cancelarPeriodosFuturos(depois, [p], "Saiu do destino", "2026-11-18");
    expect(saida).toEqual(depois);
    expect(totalDevido(saida, p.id)).toBe(6000 + 28500);
    // Um mês que só começa depois da saída (21/11–20/12) é cancelado.
    const futura = cobranca("futura", { vencimento: "2026-12-20" });
    const [cancelada2] = cancelarPeriodosFuturos([futura], [p], "Saiu do destino", "2026-11-18");
    expect(cancelada2?.cancelamento).toEqual({ data: "2026-11-18", motivo: "Saiu do destino" });
  });

  it("fechamento: total atual, dívida antiga, mês futuro, cancelamento e gastos", () => {
    const cs = [
      cobranca("mensal", { faltas: 2, valorFalta: 1500 }),
      cobranca("viagem", { tipo: "viagem", valorBase: 4550 }),
      cobranca("paga", {
        passageiroId: "pessoa-b",
        tipo: "diario",
        valorBase: 2200,
        pagamento: { data: "2026-11-13", forma: "dinheiro" },
      }),
      cobranca("cancelada", {
        tipo: "quinzenal",
        valorBase: 15000,
        cancelamento: { data: "2026-11-12", motivo: "Cortesia" },
      }),
      cobranca("antiga", { vencimento: "2026-10-10", valorBase: 6000 }),
      cobranca("futura", { vencimento: "2026-12-10", valorBase: 5000 }),
    ];
    const hoje = "2026-11-18";
    expect(resumoDoMes(cs, hoje)).toEqual({
      aReceber: 37550,
      recebido: 2200,
      devendo: 6000,
      pagos: 1,
      pendentes: 2,
      devendoQtd: 1,
    });
    expect(totalDevido(cs, "pessoa-a")).toBe(42550);
    expect(totalDevido(cs, "pessoa-b")).toBe(0);
    const mes = seuMes(cs, [], "2026-11", hoje);
    expect([mes.recebido, mes.faltaReceber]).toEqual([2200, 31550]);
    const gastos: Gasto[] = [
      {
        id: "g1",
        vanzeiroId: "motorista-ficticio",
        tipo: "combustivel",
        descricao: "",
        data: hoje,
        valor: 1010,
      },
      {
        id: "g2",
        vanzeiroId: "motorista-ficticio",
        tipo: "pedagio",
        descricao: "",
        data: hoje,
        valor: 500,
      },
      {
        id: "g3",
        vanzeiroId: "motorista-ficticio",
        tipo: "pedagio",
        descricao: "",
        data: "2026-10-01",
        valor: 9999,
      },
    ];
    expect(sobrouNoMes(mes.recebido, totalDosGastos(gastosDoMes(gastos, "2026-11")))).toBe(690);
  });
});
