import { describe, expect, it } from "vitest";
import { situacaoDaVan } from "@/lib/viagem";

const vanAoVivo = { situacao: "A caminho", detalhe: "Chega em 8 min", etapa: 1 };

describe("Situação da van", () => {
  it("shows 'A caminho' when the trip is today", () => {
    expect(situacaoDaVan({ ehHoje: true }, vanAoVivo).situacao).toBe("A caminho");
  });

  it("never shows 'A caminho' when the trip is not today", () => {
    const s = situacaoDaVan({ ehHoje: false }, vanAoVivo);
    expect(s.situacao).not.toBe("A caminho");
    expect(s.etapa).toBe(-1);
  });
});
