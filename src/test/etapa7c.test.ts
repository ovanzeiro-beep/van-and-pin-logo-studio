import { describe, expect, it } from "vitest";
import { destinosExemplo, passageirosExemplo, pedidosExemplo, vanzeiroExemplo } from "@/data/exemplo";
import { obterCobrancas } from "@/lib/cobrancas-store";
import { resumoDoMes } from "@/lib/cobrancas";
import { presencaDaViagem, matriculasDaPessoa } from "@/lib/passageiros";

describe("Exemplos regionais da Etapa 7C", () => {
  it("keeps college weekdays, departure, return and confirmation deadline", () => {
    const faculdade = destinosExemplo.find((d) => d.id === "centro-unisul");
    expect(faculdade?.dias).toEqual(["seg", "ter", "qua", "qui", "sex"]);
    expect(faculdade?.saida).toBe("06:40");
    expect(faculdade?.volta).toBe("17:50");
    expect(faculdade?.prazo).toBe("1h");
  });

  it("uses DDD 43 for all sample contacts except Patricia from Curitiba", () => {
    expect(vanzeiroExemplo.telefone.slice(0, 2)).toBe("43");
    for (const p of [...passageirosExemplo, ...pedidosExemplo]) {
      expect(p.telefone.slice(0, 2)).toBe(p.id === "p-patricia" ? "41" : "43");
      expect(p.telefone).toMatch(/^\d{11}$/);
    }
  });

  it("keeps boarding cities within their respective route", () => {
    for (const p of passageirosExemplo) {
      const d = destinosExemplo.find((d) => d.id === p.destinoId);
      if (!d) throw new Error(`Missing destination for ${p.id}`);
      expect([d.origem, ...d.paradas, d.destino]).toContain(p.cidade);
    }
  });

  it("keeps the test invitation VAN-9064 on the same excursion", () => {
    expect(destinosExemplo.find((d) => d.convite === "VAN-9064")?.id).toBe("excursao-beto-carrero");
  });

  it("keeps Juliana in two independent memberships with the same plans and values", () => {
    const juliana = passageirosExemplo.find((p) => p.id === "p-juliana");
    if (!juliana) throw new Error("Missing Juliana");
    const matriculas = matriculasDaPessoa(passageirosExemplo, juliana);
    expect(matriculas.map((p) => [p.destinoId, p.plano, p.valor])).toEqual([
      ["centro-unisul", "mensal", 280],
      ["jacarezinho-londrina", "mensal", 180],
    ]);
    expect(new Set(matriculas.map((p) => p.telefone)).size).toBe(1);
  });

  it("preserves the attendance counts on both fixed routes", () => {
    expect(presencaDaViagem(passageirosExemplo, "centro-unisul", vanzeiroExemplo.respostasHoje)).toEqual({ total: 6, vao: 3, semResposta: 2, naoVao: 1 });
    expect(presencaDaViagem(passageirosExemplo, "jacarezinho-londrina", vanzeiroExemplo.respostasHoje)).toEqual({ total: 6, vao: 4, semResposta: 2, naoVao: 0 });
  });

  it("preserves financial totals from before the location-only update", () => {
    expect(resumoDoMes(obterCobrancas(), "2026-11-13")).toEqual({
      // E6 (14/11/2026): Por viagem e Diário vencem 7 dias depois; 4 cobranças (R$ 101) passam de devendo a pendente.
      // E8 (14/11/2026): só uma cobrança à frente; a quinzena de 30/11 do Pedro (R$ 150) só nasce em 15/11.
      aReceber: 1661, recebido: 663, devendo: 530, pagos: 9, pendentes: 9, devendoQtd: 2,
    });
  });
});