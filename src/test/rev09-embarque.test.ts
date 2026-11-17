import { describe, expect, it } from "vitest";
import { embarqueDaViagem, iniciaisDoNome, textoDoEmbarque } from "@/lib/embarque";

const nomes: Record<string, string> = {
  a: "Ana Lima Souza",
  b: "Bruno",
  c: "Carla Dias",
  d: "Diego",
};
const nomeDe = (id: string) => nomes[id] ?? "";

describe("REV-09: acompanhamento do embarque pelo passageiro", () => {
  it("iniciais do primeiro nome e do último sobrenome", () => {
    expect(iniciaisDoNome("Monica Hazama")).toBe("M. H.");
    expect(iniciaisDoNome("Ana Lima Souza")).toBe("A. S.");
    expect(iniciaisDoNome("bruno")).toBe("B.");
  });

  it("quantos embarcaram, a posição e quantos faltam antes (Não estava no ponto também conta como tratado)", () => {
    const v = { ordem: ["a", "b", "c", "d"], embarcaram: ["a"], naoEstavam: [] as string[] };
    const e = embarqueDaViagem(v, "c", nomeDe);
    expect(e).toEqual({
      total: 4,
      embarcaram: 1,
      iniciais: ["A. S."],
      posicao: 3,
      faltamAntes: 1,
      euEmbarquei: false,
    });
    expect(textoDoEmbarque(e)).toEqual({
      titulo: "1 de 4 já embarcou",
      minha: "Falta 1 antes de você",
    });
    const depois = embarqueDaViagem({ ...v, naoEstavam: ["b"] }, "c", nomeDe);
    expect(textoDoEmbarque(depois).minha).toBe("Você é o próximo — aguarde no ponto");
    const embarcou = embarqueDaViagem(
      { ...v, embarcaram: ["a", "c"], naoEstavam: ["b"] },
      "c",
      nomeDe,
    );
    expect(textoDoEmbarque(embarcou)).toEqual({
      titulo: "2 de 4 já embarcaram",
      minha: "Você embarcou",
    });
  });

  it("quem não está na ordem não vê a própria linha", () => {
    expect(
      textoDoEmbarque(
        embarqueDaViagem({ ordem: ["a"], embarcaram: [], naoEstavam: [] }, "z", nomeDe),
      ).minha,
    ).toBeNull();
  });
});
