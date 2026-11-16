import { describe, expect, it } from "vitest";
import { resumoDoMes, type Cobranca } from "@/lib/cobrancas";
import { nomeDoMes } from "@/lib/datas";
import { mesesDisponiveis, seuMes } from "@/lib/seu-mes";

const hoje = "2026-11-13";
const c = (o: Partial<Cobranca>): Cobranca => ({
  id: Math.random().toString(),
  vanzeiroId: "v",
  passageiroId: "p1",
  destinoId: "d",
  nome: "Ana",
  telefone: "",
  tipo: "mensal",
  referencia: "Mensalidade",
  vencimento: "2026-11-10",
  valorBase: 28000,
  faltas: 0,
  valorFalta: 0,
  periodoFaltas: null,
  pagamento: null,
  cancelamento: null,
  ...o,
});

const lista = [
  c({ passageiroId: "p1", nome: "Ana", pagamento: { data: "2026-11-09", forma: "pix" } }), // em dia
  c({ passageiroId: "p2", nome: "Bruno", pagamento: { data: "2026-11-12", forma: "dinheiro" } }), // atrasado
  c({ passageiroId: "p3", nome: "Caio" }), // devendo
  c({ passageiroId: "p4", nome: "Duda", vencimento: "2026-11-20" }), // pendente
  c({ passageiroId: "p5", nome: "Edu", cancelamento: { data: "2026-11-02", motivo: "x" } }), // não conta
  c({ passageiroId: "p1", nome: "Ana", vencimento: "2026-10-10", pagamento: { data: "2026-10-10", forma: "pix" } }), // outubro
];
const viagens = [
  { data: "2026-11-12", embarcaram: ["a", "b", "c"] },
  { data: "2026-11-08", embarcaram: ["a"] },
  { data: "2026-10-30", embarcaram: ["a", "b"] },
];

describe("T5: Seu mês na van", () => {
  it("recebido, falta receber, viagens e quem paga em dia no mês", () => {
    const r = seuMes(lista, viagens, "2026-11", hoje);
    expect(r.recebido).toBe(56000);
    expect(r.faltaReceber).toBe(56000);
    expect([r.viagens, r.embarques]).toEqual([2, 4]);
    expect(r.emDia.map((p) => p.nome)).toEqual(["Ana"]);
    expect(r.atrasados.map((p) => p.nome)).toEqual(["Bruno"]);
    expect(r.devendo.map((p) => [p.nome, p.falta])).toEqual([["Caio", 28000]]);
    expect(r.aVencer.map((p) => p.nome)).toEqual(["Duda"]);
  });

  it("o Recebido do mês atual bate com o do Financeiro", () => {
    expect(seuMes(lista, viagens, "2026-11", hoje).recebido).toBe(resumoDoMes(lista, hoje).recebido);
  });

  it("meses anteriores e nome do mês", () => {
    expect(seuMes(lista, viagens, "2026-10", hoje)).toMatchObject({ recebido: 28000, viagens: 1, embarques: 2 });
    expect(mesesDisponiveis(lista, [...viagens, { data: "2026-08-20" }], hoje)).toEqual(["2026-08", "2026-09", "2026-10", "2026-11"]);
    expect(mesesDisponiveis([], [], hoje)).toEqual(["2026-11"]);
    expect(mesesDisponiveis([c({ vencimento: "2025-12-10" })], [], "2026-01-05")).toEqual(["2025-12", "2026-01"]);
    expect(nomeDoMes("2026-11")).toBe("Novembro de 2026");
  });
});
