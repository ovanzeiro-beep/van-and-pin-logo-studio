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

import { destinosExemplo, passageirosExemplo, vanzeiroExemplo } from "@/data/exemplo";
import {
  chegarAoDestino,
  conferir,
  desceu,
  embarcou,
  fazerParada,
  iniciarViagem,
  iniciarVolta,
  listaDaConferencia,
  listaDaViagem,
  naoEstava,
  proximaViagem,
  proximoDaBusca,
  proximoDaVolta,
  retomarViagem,
  seguirViagem,
  viagensDoDia,
} from "@/lib/viagem";

const jacarezinho = destinosExemplo.find((d) => d.id === "jacarezinho-londrina")!;

describe("Viagens do dia", () => {
  it("friday 13/11 has two trips, earliest first", () => {
    expect(viagensDoDia(destinosExemplo, "2026-11-13").map((d) => d.id)).toEqual(["jacarezinho-londrina", "centro-unisul"]);
  });

  it("paused destinos don't count, and the next trip is shown when today has none", () => {
    const pausados = destinosExemplo.map((d) => ({ ...d, ativo: d.id === "jacarezinho-londrina" }));
    expect(viagensDoDia(pausados, "2026-11-16")).toEqual([]);
    expect(proximaViagem(pausados, "2026-11-16")?.data).toBe("2026-11-20");
  });

  it("who goes is ordered by the destino's stops", () => {
    const l = listaDaViagem(passageirosExemplo, jacarezinho, vanzeiroExemplo.respostasHoje);
    expect(l.vao.map((p) => p.cidade)).toEqual(["Jacarezinho", "Jacarezinho", "Santo Antônio da Platina", "Santo Antônio da Platina"]);
    expect(l.semResposta.map((p) => p.id)).toEqual(["p-beatriz"]);
  });
});

describe("Durante a viagem", () => {
  const ida = () => iniciarViagem(jacarezinho, ["a", "b", "c"], "2026-11-13");

  it("each tap shows the next passenger in order", () => {
    let v = embarcou(ida(), "a");
    expect(proximoDaBusca(v)).toBe("b");
    v = naoEstava(v, "b");
    expect(proximoDaBusca(v)).toBe("c");
    expect(embarcou(v, "a")).toBe(v);
  });

  it("'Cheguei ao destino' only after everyone was handled", () => {
    const v = embarcou(ida(), "a");
    expect(chegarAoDestino(v).fase).toBe("busca");
    expect(chegarAoDestino(naoEstava(embarcou(naoEstava(v, "b"), "c"), "x")).fase).toBe("chegada");
  });

  it("after a stop, 'Seguir viagem' only works when everyone aboard was checked", () => {
    let v = retomarViagem(fazerParada(embarcou(embarcou(ida(), "a"), "b")));
    expect(v.fase).toBe("conferencia");
    expect(listaDaConferencia(v)).toEqual(["a", "b"]);
    v = conferir(v, "a", "na-van");
    expect(seguirViagem(v)).toBe(v);
    v = seguirViagem(conferir(v, "b", "ficou"));
    expect(v.fase).toBe("busca");
    expect(v.paradasIda).toBe(1);
    // "Ficou aqui" leaves the next checks
    v = retomarViagem(fazerParada(v));
    expect(listaDaConferencia(v)).toEqual(["a"]);
  });

  it("the return checks who boarded at the destino, then drops off in reverse order", () => {
    let v = chegarAoDestino(embarcou(embarcou(embarcou(ida(), "a"), "b"), "c"));
    v = iniciarVolta(v);
    expect(v.fase).toBe("conferencia-volta");
    v = seguirViagem(conferir(conferir(conferir(v, "a", "na-van"), "b", "ficou"), "c", "na-van"));
    expect(v.fase).toBe("volta");
    expect(proximoDaVolta(v)).toBe("c");
    v = desceu(v, "c");
    expect(proximoDaVolta(v)).toBe("a");
    expect(desceu(v, "a").fase).toBe("encerrada");
  });
});
