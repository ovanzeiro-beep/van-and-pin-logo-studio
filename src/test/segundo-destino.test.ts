import { describe, expect, it } from "vitest";
import { destinosExemplo } from "@/data/exemplo";
import { criarConta } from "@/lib/acesso";
import { passageiroDeRascunho, rascunhoPassageiroVazio } from "@/lib/passageiros";
import { obterPedidos, salvarPassageiro } from "@/lib/passageiros-store";
import { obterMinhasMatriculas, pedirParaEntrar } from "@/lib/sessao-passageiro";

describe("Conta nova aceita por pedido pede um 2º destino", () => {
  it("continua passageira (não perde o painel) e o pedido novo sabe quem ela é", () => {
    criarConta("Rui Alves");
    pedirParaEntrar("centro-unisul", "Rui Alves", "43999998888");
    const primeiro = obterPedidos().at(-1)!;
    const cambara = destinosExemplo.find((d) => d.id === "centro-unisul")!;
    const r = { ...rascunhoPassageiroVazio(primeiro), cidade: "Cambará", endereco: "Rua 1", plano: "viagem" as const, valor: "12" };
    salvarPassageiro(passageiroDeRascunho(r, cambara), primeiro.id);
    expect(obterMinhasMatriculas().map((p) => p.destinoId)).toEqual(["centro-unisul"]);

    pedirParaEntrar("jacarezinho-londrina", "Rui Alves", "43999998888");
    expect(obterMinhasMatriculas().map((p) => p.destinoId)).toEqual(["centro-unisul"]);
    const segundo = obterPedidos().at(-1)!;
    expect(segundo.destinoId).toBe("jacarezinho-londrina");
    expect(segundo.pessoaId).toBe(obterMinhasMatriculas()[0]!.id);
  });
});
