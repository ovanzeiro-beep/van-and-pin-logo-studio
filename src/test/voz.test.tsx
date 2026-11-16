import { act, renderHook } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { destinosExemplo, passageirosExemplo } from "@/data/exemplo";
import { chegarAoDestino, embarcou, encerrarViagem, fazerParada, iniciarViagem, iniciarVolta, naoEstava } from "@/lib/viagem";
import { alternarVoz, fraseDaViagem, useVozDaViagem } from "@/lib/voz";

const londrina = destinosExemplo.find((d) => d.id === "jacarezinho-londrina")!;
const ps = passageirosExemplo;

describe("T1: o que o app fala em cada momento da viagem (as mesmas palavras da tela)", () => {
  it("busca: o próximo passageiro; depois do Embarcou, o seguinte; no fim, seguir para o destino", () => {
    let v = iniciarViagem(londrina, ["p-mariana", "p-ana"], "2026-11-13");
    expect(fraseDaViagem(v, ps, londrina)).toBe("Próximo passageiro: Mariana Souza, Praça Rui Barbosa, ponto de embarque, em Jacarezinho.");
    v = embarcou(v, "p-mariana");
    expect(fraseDaViagem(v, ps, londrina)).toBe("Próximo passageiro: Ana Clara Ribeiro, Rodoviária de Santo Antônio da Platina, em Santo Antônio da Platina.");
    v = naoEstava(v, "p-ana");
    expect(fraseDaViagem(v, ps, londrina)).toBe("Todos buscados. Siga para Londrina.");
  });

  it("parada, chegada, volta e conferência", () => {
    let v = embarcou(iniciarViagem(londrina, ["p-mariana", "p-ana"], "2026-11-13"), "p-mariana");
    expect(fraseDaViagem(fazerParada(v), ps, londrina)).toBe("Parada. Antes de seguir, confira quem está na van.");
    v = chegarAoDestino(embarcou(v, "p-ana"));
    expect(fraseDaViagem(v, ps, londrina)).toBe("Chegamos em Londrina.");
    const conferencia = iniciarVolta(v);
    expect(fraseDaViagem(conferencia, ps, londrina)).toBe("Confira quem está na van.");
    expect(fraseDaViagem(encerrarViagem(v), ps, londrina)).toBeNull();
  });
});

describe("T1: só fala com a voz ligada", () => {
  const falas: string[] = [];
  beforeAll(() => {
    class Fala {
      lang = "";
      rate = 1;
      constructor(public text: string) {}
    }
    vi.stubGlobal("SpeechSynthesisUtterance", Fala);
    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      value: { speak: (f: Fala) => falas.push(`${f.lang}|${f.text}`), cancel: () => {} },
    });
  });
  afterAll(() => vi.unstubAllGlobals());

  it("desligada: nada; ao ligar: fala a frase do momento em português do Brasil; frase nova: fala de novo", () => {
    const { rerender } = renderHook(({ f }) => useVozDaViagem(f), { initialProps: { f: "Próximo passageiro: Mariana." as string | null } });
    expect(falas).toEqual([]);
    act(() => alternarVoz());
    expect(falas).toEqual(["pt-BR|Próximo passageiro: Mariana."]);
    rerender({ f: "Próximo passageiro: Ana." });
    expect(falas.at(-1)).toBe("pt-BR|Próximo passageiro: Ana.");
    act(() => alternarVoz());
    rerender({ f: "Chegamos em Londrina." });
    expect(falas).toHaveLength(2);
  });
});
