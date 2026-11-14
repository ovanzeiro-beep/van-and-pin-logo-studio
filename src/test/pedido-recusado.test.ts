import { describe, expect, it } from "vitest";
import { criarConta } from "@/lib/acesso";
import { obterAvisos } from "@/lib/avisos-store";
import { obterPedidos, recusarPedido } from "@/lib/passageiros-store";
import { pedirParaEntrar } from "@/lib/sessao-passageiro";

describe("Pedido recusado (Etapa A 1.5)", () => {
  it("quem já é passageiro e pediu outro destino recebe o aviso no sininho", () => {
    pedirParaEntrar("excursao-beto-carrero", "Juliana Alves", "43998771234");
    const pedido = obterPedidos().at(-1)!;
    expect(pedido.pessoaId).toBe("p-juliana");
    recusarPedido(pedido.id);
    const aviso = obterAvisos().find((a) => a.tipo === "pedido_recusado");
    expect(aviso?.paraVanzeiroOuPassageiroId).toBe("p-juliana");
    expect(aviso?.lido).toBe(false);
    expect(aviso?.textoResumido).toBe("O vanzeiro não aceitou seu pedido para Jacarezinho → Beto Carrero World");
  });

  it("quem ainda não tem van não ganha aviso (a própria tela mostra que não foi aceito)", () => {
    const antes = obterAvisos().length;
    criarConta("Rui Alves");
    pedirParaEntrar("centro-unisul", "Rui Alves", "43999998888");
    recusarPedido(obterPedidos().at(-1)!.id);
    expect(obterAvisos().length).toBe(antes);
  });
});

describe("Ordem dos avisos", () => {
  it("no mesmo dia, o aviso criado por último aparece primeiro", async () => {
    const { avisosDaPessoa } = await import("@/lib/avisos-store");
    const base = { vanzeiroId: "v", tipo: "prazo_chegando" as const, paraVanzeiroOuPassageiroId: "x", lido: false, textoResumido: "" };
    const lista = [
      { ...base, id: "antigo", dataCriacao: "2026-11-12" },
      { ...base, id: "primeiro-do-dia", dataCriacao: "2026-11-13" },
      { ...base, id: "ultimo-do-dia", dataCriacao: "2026-11-13" },
    ];
    expect(avisosDaPessoa(lista, "x").map((a) => a.id)).toEqual(["ultimo-do-dia", "primeiro-do-dia", "antigo"]);
  });
});
