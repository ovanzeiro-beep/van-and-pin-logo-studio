import { describe, expect, it } from "vitest";
import { destinosExemplo, passageirosExemplo, type Passageiro } from "@/data/exemplo";
import { cidadesNoMapa, distanciaKm, pontoDoPassageiro, textoDaChegada, vanSimulada } from "@/lib/mapa";
import { embarcou, iniciarViagem } from "@/lib/viagem";

const cambara = destinosExemplo.find((d) => d.id === "centro-unisul")!;
const pass = passageirosExemplo.filter((p) => p.destinoId === "centro-unisul");

describe("Mapa da van (simulada)", () => {
  it("as cidades da viagem, em ordem", () => {
    expect(cidadesNoMapa(cambara).map((c) => c.nome)).toEqual(["Cambará", "Jacarezinho", "UENP Jacarezinho"]);
  });

  it("o ponto do passageiro: o marcado no mapa, senão o centro da cidade", () => {
    const p = pass.find((x) => x.cidade === "Jacarezinho")! as Passageiro;
    expect(pontoDoPassageiro(p)).toEqual({ lat: -23.1606, lng: -49.9692 });
    expect(pontoDoPassageiro({ ...p, ponto: { lat: -23.1, lng: -49.9 } })).toEqual({ lat: -23.1, lng: -49.9 });
    expect(pontoDoPassageiro({ ...p, cidade: "Cidade desconhecida" })).toBeNull();
  });

  it("distância em linha reta (Jacarezinho → Londrina, uns 120 km)", () => {
    const km = distanciaKm({ lat: -23.1606, lng: -49.9692 }, { lat: -23.3045, lng: -51.1696 });
    expect(km).toBeGreaterThan(115);
    expect(km).toBeLessThan(130);
  });

  it("antes de começar e depois de encerrar, a van não aparece", () => {
    expect(vanSimulada({ destino: cambara, viagem: undefined, passageiros: pass, euId: "p-juliana", progresso: 0.5 }).ponto).toBeNull();
    const v = { ...iniciarViagem(cambara, ["p-gabriel"], "2026-11-13"), fase: "encerrada" as const };
    expect(vanSimulada({ destino: cambara, viagem: v, passageiros: pass, euId: "p-juliana", progresso: 0.5 }).ponto).toBeNull();
  });

  it("na busca, a van vai do último ponto para o próximo passageiro; quem espera vê quanto falta", () => {
    const ordem = ["p-gabriel", "p-juliana"];
    let v = iniciarViagem(cambara, ordem, "2026-11-13");
    const comeco = vanSimulada({ destino: cambara, viagem: v, passageiros: pass, euId: "p-juliana", progresso: 0 });
    expect(comeco.ponto).toEqual({ lat: -23.0461, lng: -50.0739 });
    expect(comeco.passandoPor).toBe("Cambará");
    expect(comeco.minutosAteVoce).toBeGreaterThan(10);

    v = embarcou(v, "p-gabriel");
    const meio = vanSimulada({ destino: cambara, viagem: v, passageiros: pass, euId: "p-juliana", progresso: 0.9 });
    expect(meio.passandoPor).toBe("Jacarezinho");
    expect(meio.minutosAteVoce).toBeLessThan(comeco.minutosAteVoce!);

    v = embarcou(v, "p-juliana");
    expect(vanSimulada({ destino: cambara, viagem: v, passageiros: pass, euId: "p-juliana", progresso: 0.5 }).minutosAteVoce).toBeNull();
  });

  it("texto da chegada", () => {
    expect(textoDaChegada(null)).toBeNull();
    expect(textoDaChegada(1)).toBe("Chega no seu ponto em 1 min");
    expect(textoDaChegada(12)).toBe("Chega no seu ponto em uns 12 min");
  });
});
