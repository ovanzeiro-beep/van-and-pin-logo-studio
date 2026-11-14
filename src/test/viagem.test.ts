import { describe, expect, it } from "vitest";
import { viagemDeHoje } from "@/lib/viagem";
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
    expect(l.semResposta.map((p) => p.id)).toEqual(["p-beatriz", "p-juliana-londrina"]);
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
  it("marks faltas as Não vou and the other trip days as Embarcou", () => {
    const h = historicoDoPassageiro({ id: "p-juliana", plano: "mensal" }, centro, "2026-11-13", { embarques: [], faltas: [{ passageiroId: "p-juliana", data: "2026-11-05" }] }, undefined);
    expect(h.find((i) => i.data === "2026-11-05")).toEqual({ data: "2026-11-05", embarcou: false, motivo: "nao-vou" });
    expect(h.find((i) => i.data === "2026-11-06")?.embarcou).toBe(true);
    expect(h.some((i) => i.data === "2026-11-08")).toBe(false);
  });
  it("today's 'Não estava no ponto' shows as Não estava no ponto", () => {
    const hoje = naoEstava(iniciarViagem(centro, ["p-juliana"], "2026-11-13"), "p-juliana");
    const h = historicoDoPassageiro({ id: "p-juliana", plano: "mensal" }, centro, "2026-11-13", { embarques: [], faltas: [] }, hoje);
    expect(h[0]).toEqual({ data: "2026-11-13", embarcou: false, motivo: "nao-estava" });
  });
});

import { conferenciaDoPassageiro, confirmarPeloCelular } from "@/lib/viagem";

describe("Conferência pelo celular do passageiro", () => {
  const naParada = () => retomarViagem(fazerParada(embarcou(embarcou(iniciarViagem(jacarezinho, ["a", "b"], "2026-11-13"), "a"), "b")));

  it("the passenger is asked only while the check is open", () => {
    expect(conferenciaDoPassageiro(embarcou(iniciarViagem(jacarezinho, ["a"], "2026-11-13"), "a"), "a")).toBeNull();
    expect(conferenciaDoPassageiro(naParada(), "a")).toBe("perguntar");
  });

  it("'Estou na van' checks the person as in the van, confirmed by phone", () => {
    const v = confirmarPeloCelular(naParada(), "a");
    expect(v.conferencia["a"]).toBe("na-van");
    expect(v.peloCelular).toEqual(["a"]);
    expect(conferenciaDoPassageiro(v, "a")).toBe("confirmado");
    // still needs everyone checked to go on
    expect(seguirViagem(v)).toBe(v);
  });

  it("a person the vanzeiro already checked can't answer by phone, and a vanzeiro tap counts as his", () => {
    const manual = conferir(naParada(), "a", "ficou");
    expect(confirmarPeloCelular(manual, "a")).toBe(manual);
    expect(conferenciaDoPassageiro(manual, "a")).toBeNull();
    const trocado = conferir(confirmarPeloCelular(naParada(), "a"), "a", "ficou");
    expect(trocado.peloCelular).toEqual([]);
  });

  it("the return check also asks on the phone, and the next check starts clean", () => {
    let v = chegarAoDestino(embarcou(embarcou(iniciarViagem(jacarezinho, ["a", "b"], "2026-11-13"), "a"), "b"));
    v = iniciarVolta(v);
    expect(conferenciaDoPassageiro(v, "b")).toBe("perguntar");
    v = seguirViagem(confirmarPeloCelular(confirmarPeloCelular(v, "a"), "b"));
    expect(v.fase).toBe("volta");
    expect(v.peloCelular).toEqual([]);
  });
});


describe("Viagem de hoje (Início e aba Viagem)", () => {
  const hoje = "2026-11-13"; // sexta: Londrina 06:00 e Cambará 06:40
  it("uses the chosen trip when it happens today", () => {
    expect(viagemDeHoje(destinosExemplo, "centro-unisul", hoje)?.id).toBe("centro-unisul");
  });
  it("falls back to the first trip of the day", () => {
    expect(viagemDeHoje(destinosExemplo, "", hoje)?.id).toBe("jacarezinho-londrina");
    expect(viagemDeHoje(destinosExemplo, "excursao-beto-carrero", hoje)?.id).toBe("jacarezinho-londrina");
  });
  it("never picks a paused destino", () => {
    const pausado = destinosExemplo.map((d) => (d.id === "centro-unisul" ? { ...d, ativo: false } : d));
    expect(viagemDeHoje(pausado, "centro-unisul", hoje)?.id).toBe("jacarezinho-londrina");
  });
  it("returns nothing on a day without trips", () => {
    const soExcursao = destinosExemplo.filter((d) => d.id === "excursao-beto-carrero");
    expect(viagemDeHoje(soExcursao, "excursao-beto-carrero", "2026-11-17")).toBeUndefined();
    expect(viagemDeHoje(soExcursao, "", "2026-11-28")?.id).toBe("excursao-beto-carrero");
  });
});

describe("Iniciar viagem antes do prazo", () => {
  const cambara = destinosExemplo.find((d) => d.id === "centro-unisul")!; // saída 06:40, prazo 05:40
  it("antes do prazo, avisa quantos ainda faltam responder", async () => {
    const { faltamResponderAoIniciar } = await import("@/lib/viagem");
    expect(faltamResponderAoIniciar(cambara, "2026-11-13", { data: "2026-11-13", hora: "05:10" }, 2)).toBe(2);
    expect(faltamResponderAoIniciar(cambara, "2026-11-13", { data: "2026-11-13", hora: "05:10" }, 0)).toBe(0);
  });
  it("depois do prazo, inicia sem perguntar", async () => {
    const { faltamResponderAoIniciar } = await import("@/lib/viagem");
    expect(faltamResponderAoIniciar(cambara, "2026-11-13", { data: "2026-11-13", hora: "05:40" }, 2)).toBe(0);
  });
});

describe("Viagem do Início do vanzeiro", () => {
  it("mostra a próxima a sair que ainda não foi feita; com todas feitas, nenhuma e a lista das feitas", async () => {
    const { viagemDoInicio } = await import("@/lib/viagem");
    const hoje = "2026-11-13"; // 06:00 Jacarezinho → Londrina e 06:40 Cambará → UENP
    expect(viagemDoInicio(destinosExemplo, {}, hoje).destino?.id).toBe("jacarezinho-londrina");
    expect(viagemDoInicio(destinosExemplo, { "jacarezinho-londrina": { fase: "busca" } }, hoje).destino?.id).toBe("jacarezinho-londrina");
    expect(viagemDoInicio(destinosExemplo, { "jacarezinho-londrina": { fase: "encerrada" } }, hoje).destino?.id).toBe("centro-unisul");
    const tudo = viagemDoInicio(destinosExemplo, { "jacarezinho-londrina": { fase: "encerrada" }, "centro-unisul": { fase: "encerrada" } }, hoje);
    expect(tudo.destino).toBeUndefined();
    expect(tudo.feitas.map((d) => d.id)).toEqual(["jacarezinho-londrina", "centro-unisul"]);
  });
  it("em dia sem viagem, nenhuma e nenhuma feita", async () => {
    const { viagemDoInicio } = await import("@/lib/viagem");
    const soLondrina = destinosExemplo.filter((d) => d.id === "jacarezinho-londrina"); // sex, sáb e dom
    expect(viagemDoInicio(soLondrina, {}, "2026-11-17")).toEqual({ destino: undefined, feitas: [] });
  });
});

describe("Viagem em destaque no Início do passageiro", () => {
  it("pula a viagem que perdeu o prazo sem resposta e destaca a que ainda dá para confirmar", async () => {
    const { viagemEmDestaque } = await import("@/lib/minha-viagem");
    const perdida = { id: "06:00", aberta: false, emAndamento: false, resposta: undefined };
    const aberta = { id: "06:40", aberta: true, emAndamento: false, resposta: undefined };
    expect(viagemEmDestaque([perdida, aberta])?.id).toBe("06:40");
    expect(viagemEmDestaque([{ ...perdida, resposta: "vai" as const }, aberta])?.id).toBe("06:00");
    expect(viagemEmDestaque([{ ...perdida, emAndamento: true }, aberta])?.id).toBe("06:00");
    expect(viagemEmDestaque([perdida])?.id).toBe("06:00");
  });
});
