import { describe, expect, it } from "vitest";
import {
  faltamNaRota,
  linkDaRotaCompleta,
  MAXIMO_NA_ROTA,
  proximoDaBusca,
  proximoDaVolta,
  type ViagemDoDia,
} from "@/lib/viagem";

const base = {
  fase: "busca",
  ordem: ["a", "b", "c", "d"],
  embarcaram: [],
  naoEstavam: [],
  ficaram: [],
  naVolta: [],
  desceram: [],
} as unknown as ViagemDoDia;

const lugar = (n: number) => ({
  endereco: `Rua ${n}`,
  cidade: "Jacarezinho",
  ponto: { lat: -23 - n / 100, lng: -49.9 },
});

describe("N2: navegar até cada passageiro", () => {
  it("busca: faltam os que não embarcaram nem faltaram, na ordem; o primeiro é o próximo", () => {
    const v = { ...base, embarcaram: ["a"], naoEstavam: ["c"] };
    expect(faltamNaRota(v)).toEqual(["b", "d"]);
    expect(faltamNaRota(v)[0]).toBe(proximoDaBusca(v));
  });

  it("volta: ordem inversa, sem quem desceu ou ficou; o primeiro é a próxima descida", () => {
    const v = {
      ...base,
      fase: "volta",
      naVolta: ["a", "b", "c", "d"],
      desceram: ["d"],
      ficaram: ["b"],
    } as ViagemDoDia;
    expect(faltamNaRota(v)).toEqual(["c", "a"]);
    expect(faltamNaRota(v)[0]).toBe(proximoDaVolta(v));
  });

  it("fora da busca e da volta não há rota", () => {
    expect(faltamNaRota({ ...base, fase: "parada" } as ViagemDoDia)).toEqual([]);
  });

  it("rota completa: paradas no caminho e o último como fim, de carro", () => {
    const sem = { endereco: "Rua Paraná, 210", cidade: "Jacarezinho" };
    expect(linkDaRotaCompleta([lugar(1), sem, lugar(3)])).toBe(
      "https://www.google.com/maps/dir/?api=1&destination=-23.03%2C-49.9&waypoints=-23.01%2C-49.9%7CRua%20Paran%C3%A1%2C%20210%2C%20Jacarezinho&travelmode=driving",
    );
    expect(linkDaRotaCompleta([])).toBeNull();
  });

  it("no máximo 10 pontos (limite do Google Maps)", () => {
    const link = linkDaRotaCompleta(Array.from({ length: 14 }, (_, i) => lugar(i + 1)))!;
    const meio = decodeURIComponent(link.split("waypoints=")[1]!.split("&")[0]!).split("|");
    expect(meio).toHaveLength(MAXIMO_NA_ROTA - 1);
    expect(link).toContain(`destination=${encodeURIComponent("-23.1,-49.9")}`);
  });
});
