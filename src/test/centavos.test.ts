import { describe, expect, it } from "vitest";
import { totalDevido, valorFinal, type Cobranca } from "@/lib/cobrancas";
import { centavosParaTexto, formatarReais } from "@/lib/dinheiro";
import { lerValor } from "@/lib/passageiros";

const sp = (t: string) => t.replace(/\s/g, " ");

describe("Q3: dinheiro em centavos", () => {
  it("mostra e lê sempre do mesmo jeito", () => {
    expect(sp(formatarReais(28050))).toBe("R$ 280,50");
    expect(sp(formatarReais(128000))).toBe("R$ 1.280,00");
    expect(centavosParaTexto(4550)).toBe("45,50");
    expect(lerValor(centavosParaTexto(4550))).toBe(4550);
    expect(lerValor("R$ 33,33")).toBe(3333);
  });

  it("somar valores quebrados nunca perde nem ganha um centavo", () => {
    const c = (id: string): Cobranca => ({
      id, vanzeiroId: "v", passageiroId: "x", destinoId: "d", nome: "X", telefone: "43999990000", tipo: "viagem",
      referencia: "Viagem", vencimento: "2026-11-20", valorBase: 3333, faltas: 0, valorFalta: 0, periodoFaltas: null, pagamento: null, cancelamento: null,
    });
    const lista = [c("a"), c("b"), c("c")];
    expect(totalDevido(lista, "x")).toBe(9999);
    expect(Number.isInteger(totalDevido(lista, "x"))).toBe(true);
    expect(valorFinal({ valorBase: 28000, faltas: 3, valorFalta: 1333 })).toBe(24001);
    // Em reais com vírgula, 0,1 + 0,2 dá 0,30000000000000004; em centavos, 10 + 20 dá 30.
    expect(10 + 20).toBe(30);
  });
});
