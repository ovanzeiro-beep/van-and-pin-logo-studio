import { describe, expect, it } from "vitest";
import { vagasDaViagem } from "@/lib/lugares";

describe("REV-08: vagas da viagem para o passageiro", () => {
  it("ocupados e livres; quem vai se vê entre os confirmados", () => {
    expect(vagasDaViagem(4, 15, false)).toMatchObject({
      titulo: "4 de 15 lugares ocupados · 11 livres",
      detalhe: null,
      tom: "livre",
    });
    expect(vagasDaViagem(4, 15, true).detalhe).toBe("Você está entre os 4 confirmados");
    expect(vagasDaViagem(1, 15, true).detalhe).toBe("Você é o único confirmado até agora");
  });

  it("quase cheia, lotada e sem número de lugares", () => {
    expect(vagasDaViagem(13, 15, false)).toMatchObject({
      titulo: "13 de 15 lugares ocupados · 2 livres",
      detalhe: "Restam 2 lugares",
      tom: "poucas",
    });
    expect(vagasDaViagem(14, 15, false).detalhe).toBe("Restam 1 lugar");
    expect(vagasDaViagem(15, 15, false)).toMatchObject({
      titulo: "15 de 15 lugares ocupados",
      detalhe: "Van lotada",
      tom: "lotada",
    });
    expect(vagasDaViagem(3, null, false)).toMatchObject({ titulo: "3 confirmados", tom: "livre" });
  });
});
