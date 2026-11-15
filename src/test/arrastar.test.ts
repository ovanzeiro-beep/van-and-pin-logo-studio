import { describe, expect, it } from "vitest";
import { destinosExemplo, passageirosExemplo } from "@/data/exemplo";
import { moverParaNaCidade, numerosDaBusca } from "@/lib/passageiros";
import { obterPassageiros, reordenarPassageiro } from "@/lib/passageiros-store";

const londrina = destinosExemplo.find((d) => d.id === "jacarezinho-londrina")!;
const doDestino = () => obterPassageiros().filter((p) => p.destinoId === londrina.id);

describe("Ordem da busca: número de cada um e arrastar", () => {
  it("número no destino inteiro: cidades na ordem do caminho, depois a ordem dentro da cidade", () => {
    const n = numerosDaBusca(passageirosExemplo.filter((p) => p.destinoId === londrina.id), londrina);
    expect([...n.entries()]).toEqual([
      ["p-mariana", 1],
      ["p-pedro", 2],
      ["p-beatriz", 3],
      ["p-juliana-londrina", 4],
      ["p-ana", 5],
      ["p-lucas", 6],
    ]);
  });

  it("arrastar para cima e para baixo dentro da cidade", () => {
    const l = [
      { id: "a", destinoId: "d", cidade: "X" },
      { id: "b", destinoId: "d", cidade: "Y" },
      { id: "c", destinoId: "d", cidade: "X" },
      { id: "e", destinoId: "d", cidade: "X" },
    ];
    expect(moverParaNaCidade(l, "e", "a").map((x) => x.id)).toEqual(["e", "b", "a", "c"]);
    expect(moverParaNaCidade(l, "a", "e").map((x) => x.id)).toEqual(["c", "b", "e", "a"]);
  });

  it("nunca muda de cidade nem de destino", () => {
    const l = [
      { id: "a", destinoId: "d", cidade: "X" },
      { id: "b", destinoId: "d", cidade: "Y" },
      { id: "c", destinoId: "outro", cidade: "X" },
    ];
    expect(moverParaNaCidade(l, "a", "b")).toBe(l);
    expect(moverParaNaCidade(l, "a", "c")).toBe(l);
  });

  it("no app: Beatriz arrastada para o primeiro lugar de Jacarezinho vira a 1ª e a ordem é guardada", () => {
    reordenarPassageiro("p-beatriz", "p-mariana");
    const n = numerosDaBusca(doDestino(), londrina);
    expect(n.get("p-beatriz")).toBe(1);
    expect(n.get("p-mariana")).toBe(2);
    expect(doDestino().find((p) => p.id === "p-beatriz")?.ordem).toBe(1);
    expect(n.get("p-ana")).toBe(5);
  });
});
