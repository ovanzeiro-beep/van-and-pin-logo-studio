import { describe, expect, it } from "vitest";
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

import { acharPorCodigo } from "@/lib/convite";
import { prazoDaViagem, prazoPassou, textoDoPrazo } from "@/lib/destinos";
import { confirmacaoAberta, historicoDoPassageiro, situacaoParaPassageiro } from "@/lib/viagem";

const centro = destinosExemplo.find((d) => d.id === "centro-unisul")!;

describe("Prazo de confirmação", () => {
  it("defaults to 1 hour before departure: 06:40 → 05:40", () => {
    expect(textoDoPrazo(centro, "2026-11-13")).toBe("05:40");
  });
  it("30 min, 2 h and the night before at 20h", () => {
    expect(prazoDaViagem({ ...centro, prazo: "30min" }, "2026-11-13").hora).toBe("06:10");
    expect(prazoDaViagem({ ...centro, prazo: "2h" }, "2026-11-13").hora).toBe("04:40");
    expect(prazoDaViagem({ ...centro, prazo: "noite-anterior" }, "2026-11-13")).toEqual({ data: "2026-11-12", hora: "20:00" });
  });
  it("closes at the deadline, and when the van has left", () => {
    expect(prazoPassou(centro, "2026-11-13", { data: "2026-11-13", hora: "05:39" })).toBe(false);
    expect(prazoPassou(centro, "2026-11-13", { data: "2026-11-13", hora: "05:40" })).toBe(true);
    expect(confirmacaoAberta(centro, "2026-11-13", { data: "2026-11-13", hora: "05:10" }, true)).toBe(false);
  });
});

describe("Código de convite", () => {
  it("finds the van by code, and nothing for a wrong code", () => {
    expect(acharPorCodigo(destinosExemplo, "van-4821")?.id).toBe("jacarezinho-londrina");
    expect(acharPorCodigo(destinosExemplo, "VAN-0000")).toBeUndefined();
  });
});

describe("Situação da van para o passageiro", () => {
  const base = { passageiroId: "a", destino: centro, hoje: "2026-11-13", proximaData: "2026-11-13", resposta: "vai" as const, aberta: true };
  const v = () => iniciarViagem(centro, ["b", "a", "c"], "2026-11-13");

  it("follows the vanzeiro's trip", () => {
    expect(situacaoParaPassageiro({ ...base, viagem: v() }).situacao).toBe("Viagem começou");
    expect(situacaoParaPassageiro({ ...base, viagem: embarcou(v(), "b") }).situacao).toBe("Você é o próximo");
    expect(situacaoParaPassageiro({ ...base, viagem: embarcou(embarcou(v(), "b"), "a") }).situacao).toBe("Na van");
    expect(situacaoParaPassageiro({ ...base, viagem: naoEstava(embarcou(v(), "b"), "a") }).situacao).toBe("Você não estava no ponto");
  });
  it("without an answer after the deadline, the van doesn't pass", () => {
    expect(situacaoParaPassageiro({ ...base, resposta: undefined, aberta: false, viagem: undefined }).situacao).toBe("A van não vai passar");
  });
  it("on a day without trip it waits for the trip day", () => {
    expect(situacaoParaPassageiro({ ...base, hoje: "2026-11-14", viagem: undefined }).situacao).toBe("Aguardando o dia da viagem");
  });
});

describe("Histórico do passageiro", () => {
  it("marks faltas as Faltou and the other trip days as Embarcou", () => {
    const h = historicoDoPassageiro({ id: "p-juliana", plano: "mensal" }, centro, "2026-11-13", { embarques: [], faltas: [{ passageiroId: "p-juliana", data: "2026-11-05" }] }, undefined);
    expect(h.find((i) => i.data === "2026-11-05")?.embarcou).toBe(false);
    expect(h.find((i) => i.data === "2026-11-06")?.embarcou).toBe(true);
    expect(h.some((i) => i.data === "2026-11-08")).toBe(false);
  });
});
