import { describe, expect, it } from "vitest";
import { destinosExemplo, passageirosExemplo, type Passageiro } from "@/data/exemplo";
import * as mapa from "@/lib/mapa";
import { cidadesNoMapa, distanciaKm, pontoDoPassageiro } from "@/lib/mapa";

const cambara = destinosExemplo.find((d) => d.id === "centro-unisul")!;
const pass = passageirosExemplo.filter((p) => p.destinoId === "centro-unisul");

describe("Mapa da viagem", () => {
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

  // CORREÇÃO 4 (20/11/2026): a van simulada e o "chega em N min" calculado dela foram retirados (pareciam reais).
  it("não existe mais van simulada nem previsão de chegada", () => {
    expect(Object.keys(mapa).sort()).toEqual(["cidadesNoMapa", "distanciaKm", "pontoDoPassageiro"]);
  });
});
