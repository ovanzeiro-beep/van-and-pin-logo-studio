import { describe, expect, it } from "vitest";
import { previstoDoVou } from "@/lib/cobrancas";

const p = (id: string, plano: "viagem" | "diario" | "mensal", valor = 3000, destinoId = "d1") => ({
  id,
  destinoId,
  plano,
  valor,
});

describe("'Vou' já conta como pendente (Por viagem e Diário)", () => {
  const lista = [
    p("a", "viagem"),
    p("b", "diario", 2500),
    p("c", "mensal", 28000),
    p("d", "viagem"),
    p("e", "viagem", 3000, "outro"),
  ];

  it("quem confirmou Vou conta; Não vou e sem resposta não; Mensal já tem a própria cobrança", () => {
    expect(
      previstoDoVou(lista, ["d1"], { a: "vai", b: "vai", c: "vai", d: "nao-vai", e: "vai" }, {}),
    ).toEqual({ qtd: 2, valor: 5500 });
  });

  it("trocou para Não vou: sai na hora", () => {
    expect(previstoDoVou(lista, ["d1"], { a: "nao-vai", b: "vai" }, {})).toEqual({
      qtd: 1,
      valor: 2500,
    });
  });

  it("depois de Embarcou (a cobrança de verdade nasce) ou Não estava no ponto, sai daqui: nunca conta duas vezes", () => {
    const viagens = { d1: { fase: "busca", embarcaram: ["a"], naoEstavam: ["b"] } };
    expect(previstoDoVou(lista, ["d1"], { a: "vai", b: "vai" }, viagens)).toEqual({
      qtd: 0,
      valor: 0,
    });
  });

  it("só destinos com viagem hoje; viagem encerrada não conta", () => {
    expect(previstoDoVou(lista, [], { a: "vai" }, {})).toEqual({ qtd: 0, valor: 0 });
    expect(
      previstoDoVou(
        lista,
        ["d1"],
        { a: "vai" },
        { d1: { fase: "encerrada", embarcaram: [], naoEstavam: [] } },
      ),
    ).toEqual({ qtd: 0, valor: 0 });
  });
});
