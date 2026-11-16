import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DATA_DE_HOJE, destinosExemplo, passageirosExemplo } from "@/data/exemplo";
import { salvarDestino } from "@/lib/destinos-store";
import { salvarPassageiro } from "@/lib/passageiros-store";
import { obterRespostasDoDia, responder } from "@/lib/respostas-store";
import { mudarSessao } from "@/lib/sessao";
import { obterPerfilDoVanzeiro, obterPerfilVanzeiro, PERFIL_VAZIO, salvarPerfilVanzeiro, usePerfilDoVanzeiro } from "@/lib/vanzeiro-store";

const outro = "vanzeiro-outro";
const base = destinosExemplo.find((d) => d.id === "centro-unisul")!;
const pBase = passageirosExemplo.find((p) => p.id === "p-gabriel")!;

describe("Etapa Q1: um perfil por vanzeiro", () => {
  it("cada vanzeiro salva o próprio perfil; o do Carlos não muda", () => {
    const pixDoCarlos = obterPerfilVanzeiro().pix;
    mudarSessao({ vanzeiroId: outro });
    salvarPerfilVanzeiro({ nome: "Rosa Lima", telefone: "43990000000", pix: "rosa@pix.com", van: { modelo: "Master", placa: "XYZ-9A87", lugares: 1 } });
    mudarSessao({ vanzeiroId: "vanzeiro-carlos" });
    expect(obterPerfilDoVanzeiro(outro).pix).toBe("rosa@pix.com");
    expect(obterPerfilDoVanzeiro("vanzeiro-carlos").pix).toBe(pixDoCarlos);
    expect(obterPerfilVanzeiro().pix).toBe(pixDoCarlos);
  });

  it("o passageiro vê o vanzeiro do seu destino; vanzeiro desconhecido fica em branco (nunca o de outro)", () => {
    expect(renderHook(() => usePerfilDoVanzeiro(outro)).result.current.nome).toBe("Rosa Lima");
    expect(renderHook(() => usePerfilDoVanzeiro("vanzeiro-carlos")).result.current.nome).toBe("Carlos Pereira");
    expect(renderHook(() => usePerfilDoVanzeiro("ninguem")).result.current).toEqual(PERFIL_VAZIO);
  });

  it("a 'Van lotada' usa os lugares da van do vanzeiro do destino", () => {
    salvarDestino({ ...base, id: "destino-da-rosa", vanzeiroId: outro, convite: "VAN-7777" });
    salvarPassageiro({ ...pBase, id: "p-r1", vanzeiroId: outro, destinoId: "destino-da-rosa", telefone: "43911110001", nome: "Um" });
    salvarPassageiro({ ...pBase, id: "p-r2", vanzeiroId: outro, destinoId: "destino-da-rosa", telefone: "43911110002", nome: "Dois" });
    responder("p-r1", DATA_DE_HOJE, "vai");
    responder("p-r2", DATA_DE_HOJE, "vai");
    expect(obterRespostasDoDia(DATA_DE_HOJE)["p-r1"]).toBe("vai");
    expect(obterRespostasDoDia(DATA_DE_HOJE)["p-r2"]).toBeUndefined();
    responder("p-juliana", DATA_DE_HOJE, "vai");
    expect(obterRespostasDoDia(DATA_DE_HOJE)["p-juliana"]).toBe("vai");
  });
});
