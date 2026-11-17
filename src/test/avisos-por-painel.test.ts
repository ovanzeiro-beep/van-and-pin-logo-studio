import { describe, expect, it } from "vitest";
import { avisosDaPessoa, doPainel } from "@/lib/avisos-store";
import type { Aviso } from "@/data/exemplo";

const aviso = (id: string, tipo: Aviso["tipo"]): Aviso =>
  ({
    id,
    tipo,
    vanzeiroId: "u1",
    paraVanzeiroOuPassageiroId: "u1",
    dataCriacao: "2026-11-17",
    lido: false,
    textoResumido: id,
  }) as Aviso;

describe("Mesma conta vanzeiro e passageiro: cada painel com os seus avisos", () => {
  const lista = [
    aviso("resposta", "resposta_passageiro"),
    aviso("presenca", "presenca_confirmada"),
    aviso("pedido", "pedido_novo"),
    aviso("van", "van_saiu"),
  ];

  it("vanzeiro vê pedido, resposta e cobrança vencida; passageiro vê o resto", () => {
    expect(
      avisosDaPessoa(lista, "u1", "vanzeiro")
        .map((a) => a.id)
        .sort(),
    ).toEqual(["pedido", "resposta"]);
    expect(
      avisosDaPessoa(lista, "u1", "passageiro")
        .map((a) => a.id)
        .sort(),
    ).toEqual(["presenca", "van"]);
    expect(avisosDaPessoa(lista, "u1")).toHaveLength(4);
    expect(doPainel({ tipo: "cobranca_vencida" }, "vanzeiro")).toBe(true);
    expect(doPainel({ tipo: "cobranca_vencendo" }, "passageiro")).toBe(true);
  });
});
