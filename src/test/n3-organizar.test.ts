import { describe, expect, it } from "vitest";
import { destinosExemplo } from "@/data/exemplo";
import { aplicarOrdemNaCidade, ordemPelaDistancia, vizinhasNaRota } from "@/lib/organizar";
import { obterPassageiros, organizarCidade } from "@/lib/passageiros-store";

// A street going east: points 1 km apart (about 0.009 degrees of longitude here).
const rua = (km: number) => ({ lat: -23.16, lng: -49.97 + km * 0.0098 });

describe("N3: organizar pela distância", () => {
  it("vindo da cidade anterior (a oeste), começa pelo mais perto dela e segue um perto do outro", () => {
    const lista = [
      { id: "c", ponto: rua(3) },
      { id: "a", ponto: rua(1) },
      { id: "d", ponto: rua(4) },
      { id: "b", ponto: rua(2) },
    ];
    expect(ordemPelaDistancia(lista, rua(-20))).toEqual(["a", "b", "c", "d"]);
    // Coming from the east, the opposite.
    expect(ordemPelaDistancia(lista, rua(30))).toEqual(["d", "c", "b", "a"]);
  });

  it("na origem (nada antes), termina do lado da próxima cidade", () => {
    const lista = [
      { id: "b", ponto: rua(2) },
      { id: "a", ponto: rua(1) },
      { id: "c", ponto: rua(3) },
    ];
    expect(ordemPelaDistancia(lista, undefined, rua(40))).toEqual(["a", "b", "c"]);
  });

  it("corrige o caminho que cruza (2-opt): não volta para trás", () => {
    // The van arrives at 0: the first is the closest to it; the rest must not make the path longer than the obvious one.
    const lista = [
      { id: "x0", ponto: rua(0.1) },
      { id: "x1", ponto: rua(1) },
      { id: "x2", ponto: rua(2) },
      { id: "xm", ponto: rua(-1.5) },
    ];
    const ordem = ordemPelaDistancia(lista, rua(0));
    expect(ordem[0]).toBe("x0");
    expect([...ordem].sort()).toEqual(["x0", "x1", "x2", "xm"]);
    // Whatever the order, it is never longer than the obvious one.
    const km = (ids: string[]) =>
      ids.reduce(
        (t, id, i) =>
          i === 0
            ? 0
            : t +
              Math.abs(
                lista.find((p) => p.id === id)!.ponto.lng -
                  lista.find((p) => p.id === ids[i - 1])!.ponto.lng,
              ),
        0,
      );
    expect(km(ordem)).toBeLessThanOrEqual(km(["x0", "x1", "x2", "xm"]));
  });

  it("quem não tem ponto no mapa fica no fim, na ordem em que estava", () => {
    expect(
      ordemPelaDistancia(
        [
          { id: "s1" },
          { id: "b", ponto: rua(2) },
          { id: "s2", ponto: null },
          { id: "a", ponto: rua(1) },
        ],
        rua(-10),
      ),
    ).toEqual(["a", "b", "s1", "s2"]);
  });

  it("acha as cidades vizinhas na rota", () => {
    const d = { origem: "A", paradas: ["B"], destino: "C" };
    const c = { A: rua(0), B: rua(10), C: rua(20) };
    expect(vizinhasNaRota(d, "A", c)).toEqual({ entrada: undefined, saida: rua(10) });
    expect(vizinhasNaRota(d, "B", c)).toEqual({ entrada: rua(0), saida: rua(20) });
  });

  it("muda só a ordem daquela cidade, naquele destino", () => {
    const l = [
      { id: "a", destinoId: "d", cidade: "X" },
      { id: "b", destinoId: "d", cidade: "Y" },
      { id: "c", destinoId: "d", cidade: "X" },
      { id: "e", destinoId: "outro", cidade: "X" },
    ];
    expect(aplicarOrdemNaCidade(l, "d", "X", ["c", "a"]).map((x) => x.id)).toEqual([
      "c",
      "b",
      "a",
      "e",
    ]);
    expect(aplicarOrdemNaCidade(l, "d", "X", ["a", "c"])).toBe(l);
  });

  it("no app: a nova ordem vira o número da busca", () => {
    const londrina = destinosExemplo.find((d) => d.id === "jacarezinho-londrina")!;
    const daCidade = obterPassageiros().filter((p) => p.destinoId === londrina.id);
    const cidade = daCidade.find(
      (p) => daCidade.filter((x) => x.cidade === p.cidade).length > 1,
    )!.cidade;
    const ids = daCidade
      .filter((p) => p.cidade === cidade)
      .map((p) => p.id)
      .reverse();
    expect(organizarCidade(londrina.id, cidade, ids).ok).toBe(true);
    const depois = obterPassageiros().filter(
      (p) => p.destinoId === londrina.id && p.cidade === cidade,
    );
    expect(depois.map((p) => p.id)).toEqual(ids);
    expect(depois.map((p) => p.ordem)).toEqual(ids.map((_, i) => i + 1));
  });
});
