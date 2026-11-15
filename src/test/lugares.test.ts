import { describe, expect, it } from "vitest";
import { DATA_DE_HOJE } from "@/data/exemplo";
import { contarVou, destinoPassaDosLugares, lerLugares, podeDizerVou, situacaoDosLugares, textoDosLugares, vanLotada } from "@/lib/lugares";
import { obterPassageiros } from "@/lib/passageiros-store";
import { obterRespostasParaTeste, responder } from "@/lib/respostas-store";
import { obterPerfilVanzeiro, salvarPerfilVanzeiro } from "@/lib/vanzeiro-store";

describe("Lugares na van: regras", () => {
  it("lotada quando todos os lugares têm 'Vou'; sem número de lugares, nada limita", () => {
    expect(vanLotada(15, 14)).toBe(false);
    expect(vanLotada(15, 15)).toBe(true);
    expect(vanLotada(null, 99)).toBe(false);
  });

  it("quem já disse 'Vou' fica com o lugar; ninguém mais entra com a van lotada", () => {
    expect(podeDizerVou(4, 4, "vai")).toBe(true);
    expect(podeDizerVou(4, 4, undefined)).toBe(false);
    expect(podeDizerVou(4, 4, "nao-vai")).toBe(false);
    expect(podeDizerVou(4, 3, undefined)).toBe(true);
  });

  it("textos e cores da aba Viagem", () => {
    expect(textoDosLugares(4, null)).toBe("4 vão");
    expect(textoDosLugares(1, null)).toBe("1 vai");
    expect(textoDosLugares(4, 15)).toBe("4 de 15 lugares");
    expect(situacaoDosLugares(4, 15)).toBe("livre");
    expect(situacaoDosLugares(15, 15)).toBe("lotada");
    expect(situacaoDosLugares(16, 15)).toBe("passou");
    expect(situacaoDosLugares(40, null)).toBe("livre");
  });

  it("aviso no cadastro só quando o destino passa dos lugares", () => {
    expect(destinoPassaDosLugares(15, 15)).toBe(false);
    expect(destinoPassaDosLugares(16, 15)).toBe(true);
    expect(destinoPassaDosLugares(100, null)).toBe(false);
  });

  it("campo Lugares do Perfil", () => {
    expect(lerLugares("15")).toBe(15);
    expect(lerLugares("")).toBeNull();
    expect(lerLugares("0")).toBe("invalido");
    expect(lerLugares("61")).toBe("invalido");
    expect(lerLugares("1,5")).toBe("invalido");
  });
});

describe("Lugares na van: o 'Vou' é recusado com a van lotada", () => {
  it("Cambará → UENP com 4 lugares: quem chega depois não entra; 'Não vou' de alguém libera o lugar", () => {
    const hoje = DATA_DE_HOJE;
    const vao = () => contarVou(obterPassageiros(), "centro-unisul", obterRespostasParaTeste(hoje));
    const perfil = obterPerfilVanzeiro();
    salvarPerfilVanzeiro({ ...perfil, van: { ...perfil.van, lugares: vao() } });

    responder("p-juliana", hoje, "vai");
    expect(obterRespostasParaTeste(hoje)["p-juliana"]).toBeUndefined();

    const algumQueVai = obterPassageiros().find((p) => p.destinoId === "centro-unisul" && obterRespostasParaTeste(hoje)[p.id] === "vai")!;
    responder(algumQueVai.id, hoje, "nao-vai");
    responder("p-juliana", hoje, "vai");
    expect(obterRespostasParaTeste(hoje)["p-juliana"]).toBe("vai");
    responder(algumQueVai.id, hoje, "vai");
    expect(obterRespostasParaTeste(hoje)[algumQueVai.id]).toBe("nao-vai");
    salvarPerfilVanzeiro(perfil);
  });
});
