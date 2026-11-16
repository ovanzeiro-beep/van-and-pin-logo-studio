import { describe, expect, it } from "vitest";
import { destinosExemplo } from "@/data/exemplo";
import { obterAvisos } from "@/lib/avisos-store";
import { avaliarMudanca, embarqueCompleto, pontoObrigatorio, textoDaDistancia } from "@/lib/endereco";
import { passageiroDeRascunho, rascunhoPassageiroVazio } from "@/lib/passageiros";
import {
  aceitarMudancaDeEndereco,
  mudarMeuEmbarque,
  obterMudancasAguardando,
  obterPassageiros,
  obterPedidos,
  recusarMudancaDeEndereco,
} from "@/lib/passageiros-store";

const londrina = destinosExemplo.find((d) => d.id === "jacarezinho-londrina")!;
const centroJacarezinho = { lat: -23.1606, lng: -49.9692 };
const pertinho = { lat: -23.1630, lng: -49.9710 }; // uns 330 m
const longe = { lat: -23.1900, lng: -49.9692 }; // uns 3,3 km

describe("Endereço preenchido pelo passageiro", () => {
  it("no pedido: cidade do caminho, endereço e ponto no mapa (obrigatório quando o mapa conhece o destino)", () => {
    expect(pontoObrigatorio(londrina)).toBe(true);
    expect(embarqueCompleto(londrina, { cidade: "Jacarezinho", endereco: "Rua 1", ponto: null })).toBe(false);
    expect(embarqueCompleto(londrina, { cidade: "Curitiba", endereco: "Rua 1", ponto: pertinho })).toBe(false);
    expect(embarqueCompleto(londrina, { cidade: "Jacarezinho", endereco: " ", ponto: pertinho })).toBe(false);
    expect(embarqueCompleto(londrina, { cidade: "Jacarezinho", endereco: "Rua 1", ponto: pertinho })).toBe(true);
    const semMapa = { ...londrina, origem: "Cidade X", destino: "Cidade Y", paradas: [] };
    expect(embarqueCompleto(semMapa, { cidade: "Cidade X", endereco: "Rua 1", ponto: null })).toBe(true);
  });

  it("o vanzeiro, ao aceitar, recebe cidade, endereço e ponto do pedido", () => {
    const pedido = obterPedidos().find((p) => p.id === "pedido-larissa")!;
    const r = rascunhoPassageiroVazio(pedido);
    expect([r.cidade, r.endereco]).toEqual(["Jacarezinho", "Rua Paraná, 900"]);
    expect(passageiroDeRascunho({ ...r, plano: "viagem", valor: "45" }, londrina).ponto).toEqual(pedido.ponto);
  });
});

describe("Mudar onde embarca: até 1 km salva; mais longe, o vanzeiro aprova", () => {
  it("medida a partir do ponto combinado; sem ponto ainda, a primeira marcação na mesma cidade salva direto", () => {
    const semPonto = { cidade: "Jacarezinho", ponto: undefined };
    expect(avaliarMudanca(semPonto, { cidade: "Jacarezinho", endereco: "x", ponto: longe }).precisaAprovar).toBe(false);
    expect(avaliarMudanca(semPonto, { cidade: "Santo Antônio da Platina", endereco: "x", ponto: { lat: -23.295, lng: -50.077 } }).precisaAprovar).toBe(true);
    const comPonto = { cidade: "Jacarezinho", ponto: centroJacarezinho };
    expect(avaliarMudanca(comPonto, { cidade: "Jacarezinho", endereco: "x", ponto: pertinho }).precisaAprovar).toBe(false);
    const r = avaliarMudanca(comPonto, { cidade: "Jacarezinho", endereco: "x", ponto: longe });
    expect(r.precisaAprovar).toBe(true);
    expect(textoDaDistancia(r.distanciaKm!)).toBe("3,3 km");
    expect(avaliarMudanca({ cidade: "Jacarezinho", ponto: longe }, { cidade: "Jacarezinho", endereco: "x", ponto: centroJacarezinho }).precisaAprovar).toBe(true);
    expect(textoDaDistancia(0.33)).toBe("330 m");
  });

  it("perto: salva na hora", () => {
    expect(mudarMeuEmbarque("p-mariana", { cidade: "Jacarezinho", endereco: "Rua Nova, 10", ponto: pertinho })).toEqual({ ok: true, situacao: "salvo" });
    const m = obterPassageiros().find((p) => p.id === "p-mariana")!;
    expect([m.endereco, m.ponto]).toEqual(["Rua Nova, 10", pertinho]);
  });

  it("longe: fica aguardando o vanzeiro, o endereço antigo continua; aceitar troca e avisa a pessoa", () => {
    expect(mudarMeuEmbarque("p-mariana", { cidade: "Jacarezinho", endereco: "Sítio Longe", ponto: longe })).toEqual({ ok: true, situacao: "aguardando" });
    expect(obterPassageiros().find((p) => p.id === "p-mariana")!.endereco).toBe("Rua Nova, 10");
    const m = obterMudancasAguardando().find((x) => x.matriculaId === "p-mariana")!;
    expect(m.de.endereco).toBe("Rua Nova, 10");
    aceitarMudancaDeEndereco(m.id);
    expect(obterPassageiros().find((p) => p.id === "p-mariana")!.endereco).toBe("Sítio Longe");
    expect(obterMudancasAguardando()).toEqual([]);
    expect(obterAvisos().at(-1)?.tipo).toBe("endereco_aceito");
  });

  it("recusar: nada muda e a pessoa recebe aviso", () => {
    expect(mudarMeuEmbarque("p-mariana", { cidade: "Santo Antônio da Platina", endereco: "Rua Z", ponto: { lat: -23.295, lng: -50.077 } })).toEqual({ ok: true, situacao: "aguardando" });
    const m = obterMudancasAguardando().find((x) => x.matriculaId === "p-mariana")!;
    recusarMudancaDeEndereco(m.id);
    const p = obterPassageiros().find((x) => x.id === "p-mariana")!;
    expect([p.cidade, p.endereco]).toEqual(["Jacarezinho", "Sítio Longe"]);
    expect(obterAvisos().at(-1)?.tipo).toBe("endereco_recusado");
  });
});
