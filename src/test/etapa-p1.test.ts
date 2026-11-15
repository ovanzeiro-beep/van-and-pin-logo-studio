import { describe, expect, it } from "vitest";
import { destinosExemplo } from "@/data/exemplo";
import { excluirDestino, removerPassageiroDoDestino, sairDoDestino } from "@/lib/exclusoes";
import { passageiroDeRascunho, rascunhoDePassageiro } from "@/lib/passageiros";
import {
  aceitarMudancaDeEndereco,
  mudarMeuEmbarque,
  obterMatriculas,
  obterMudancasAguardando,
  obterMudancasDeEndereco,
  obterPassageiros,
  salvarPassageiro,
} from "@/lib/passageiros-store";

const santoAntonio = { lat: -23.295, lng: -50.077 };
const pedir = (id: string) => mudarMeuEmbarque(id, { cidade: "Santo Antônio da Platina", endereco: "Rua Longe", ponto: santoAntonio });
const situacaoDe = (id: string) => obterMudancasDeEndereco().filter((m) => m.matriculaId === id).at(-1)?.situacao;

describe("Etapa P1: mudança de endereço some junto com quem sai", () => {
  it("a pessoa sai do destino: a mudança é cancelada e não aparece mais para o vanzeiro", () => {
    expect(pedir("p-pedro")).toBe("aguardando");
    const id = obterMudancasAguardando().find((m) => m.matriculaId === "p-pedro")!.id;
    expect(sairDoDestino("p-pedro")).toBe(true);
    expect(situacaoDe("p-pedro")).toBe("cancelada");
    expect(obterMudancasAguardando().some((m) => m.matriculaId === "p-pedro")).toBe(false);
    aceitarMudancaDeEndereco(id);
    expect(obterMatriculas().find((p) => p.id === "p-pedro")!.endereco).not.toBe("Rua Longe");
  });

  it("o vanzeiro remove a pessoa: cancelada", () => {
    expect(pedir("p-beatriz")).toBe("aguardando");
    removerPassageiroDoDestino("p-beatriz");
    expect(situacaoDe("p-beatriz")).toBe("cancelada");
  });

  it("o destino é excluído: canceladas as de todos dele", () => {
    expect(mudarMeuEmbarque("p-lucas", { cidade: "Jacarezinho", endereco: "Rua Outra", ponto: { lat: -23.1606, lng: -49.9692 } })).toBe("aguardando");
    excluirDestino("jacarezinho-londrina");
    expect(situacaoDe("p-lucas")).toBe("cancelada");
    expect(obterMudancasAguardando()).toEqual([]);
  });
});

describe("Etapa P1: o ponto no mapa pertence à cidade", () => {
  it("o vanzeiro muda a cidade do passageiro: o ponto é apagado; mudando só o endereço, o ponto fica", () => {
    const cam = destinosExemplo.find((d) => d.id === "centro-unisul")!;
    const fer = obterPassageiros().find((p) => p.id === "p-fernanda")!;
    salvarPassageiro({ ...fer, ponto: { lat: -23.0461, lng: -50.0739 } });
    const atual = () => obterPassageiros().find((p) => p.id === "p-fernanda")!;
    salvarPassageiro(passageiroDeRascunho({ ...rascunhoDePassageiro(atual()), endereco: "Av. Brasil, 90" }, cam, atual()));
    expect(atual().ponto).toEqual({ lat: -23.0461, lng: -50.0739 });
    salvarPassageiro(passageiroDeRascunho({ ...rascunhoDePassageiro(atual()), cidade: "Jacarezinho" }, cam, atual()));
    expect(atual().cidade).toBe("Jacarezinho");
    expect(atual().ponto).toBeUndefined();
  });
});
