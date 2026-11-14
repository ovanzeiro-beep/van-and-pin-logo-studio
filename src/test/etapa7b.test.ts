import { describe, expect, it } from "vitest";
import { destinosExemplo, passageirosExemplo, type Passageiro } from "@/data/exemplo";
import { aplicarEmbarque, aplicarFalta, gerarCobrancas, valorFinal } from "@/lib/cobrancas";
import { matriculasDaPessoa, pessoasParaDestino } from "@/lib/passageiros";
import { viagensDasMatriculas } from "@/lib/minha-viagem";
import { responder, obterRespostasParaTeste } from "@/lib/respostas-store";
import { comecarViagem, marcarNaoEstava } from "@/lib/viagem-store";
import { obterCobrancas, garantirProximaCobranca } from "@/lib/cobrancas-store";
import { salvarPassageiro } from "@/lib/passageiros-store";

const p: Passageiro = { id: "regra", vanzeiroId: "vanzeiro-carlos", destinoId: "centro-unisul", nome: "Teste", telefone: "48999999999", cidade: "Centro", endereco: "Ponto", plano: "mensal", valor: 280, vencimento: 20, descontaFaltas: true, valorFalta: 15 };

describe("Etapa 7B", () => {
  it("only an on-time negative answer discounts mensal and quinzenal", () => {
    for (const plano of ["mensal", "quinzenal"] as const) {
      const pessoa = { ...p, plano };
      const sem = aplicarFalta([], pessoa, "2026-11-13", "2026-11-13");
      expect(sem).toEqual([]);
      const com = aplicarFalta([], pessoa, "2026-11-13", "2026-11-13", true);
      expect(com[0] && valorFinal(com[0])).toBe(265);
    }
  });
  it("no response and a missed pickup do not discount sample history", () => {
    const cs = gerarCobrancas(p, "2026-11-01", "2026-11-30", "2026-11-13", { embarques: [], faltas: [{ passageiroId: p.id, data: "2026-11-10" }, { passageiroId: p.id, data: "2026-11-11", avisouNoPrazo: false }] });
    expect(cs[0]?.faltas).toBe(0);
    expect(cs[0] && valorFinal(cs[0])).toBe(280);
  });
  it("trip includes return on another day, but another trip on the same day charges separately", () => {
    const pessoa = { ...p, plano: "viagem" as const, valor: 45 };
    const ida = aplicarEmbarque([], pessoa, "2026-11-13", "2026-11-13", "ida-volta");
    const volta = aplicarEmbarque(ida, pessoa, "2026-11-14", "2026-11-14", "ida-volta");
    expect(volta).toHaveLength(1);
    expect(aplicarEmbarque(volta, pessoa, "2026-11-13", "2026-11-14", "outra")).toHaveLength(2);
  });
  it("daily charges once per boarding date even within the same trip", () => {
    const pessoa = { ...p, plano: "diario" as const, valor: 22 };
    const ida = aplicarEmbarque([], pessoa, "2026-11-13", "2026-11-13", "ida-volta");
    expect(aplicarEmbarque(ida, pessoa, "2026-11-13", "2026-11-13", "outra")).toHaveLength(1);
    expect(aplicarEmbarque(ida, pessoa, "2026-11-14", "2026-11-14", "ida-volta")).toHaveLength(2);
  });
  it("Juliana has independent plans in two destinations, ordered by earliest departure", () => {
    const juliana = passageirosExemplo.find((p) => p.id === "p-juliana");
    if (!juliana) throw new Error("Missing Juliana");
    const ms = matriculasDaPessoa(passageirosExemplo, juliana);
    expect(ms.map((p) => p.valor)).toEqual([280, 180]);
    expect(viagensDasMatriculas(ms, destinosExemplo, "2026-11-13").slice(0, 2).map((v) => v.destino.id)).toEqual(["jacarezinho-londrina", "centro-unisul"]);
    expect(pessoasParaDestino(passageirosExemplo, "centro-unisul").some((p) => p.id === juliana.id)).toBe(false);
  });
  it("departure applies a final negative answer once and missed pickup never discounts", () => {
    salvarPassageiro(p);
    garantirProximaCobranca(p);
    responder(p.id, "2026-11-13", "nao-vai");
    const centro = destinosExemplo.find((d) => d.id === p.destinoId);
    if (!centro) throw new Error("Missing destination");
    comecarViagem(centro, ["p-fernanda"]);
    comecarViagem(centro, ["p-fernanda"]);
    expect(obterCobrancas().find((c) => c.passageiroId === p.id)?.faltas).toBe(1);
    const antes = obterCobrancas().filter((c) => c.passageiroId === "p-fernanda");
    marcarNaoEstava("p-fernanda");
    expect(obterCobrancas().filter((c) => c.passageiroId === "p-fernanda")).toEqual(antes);
    responder(p.id, "2026-11-13", "vai");
    expect(obterRespostasParaTeste("2026-11-13")[p.id]).toBe("nao-vai");
  });
});