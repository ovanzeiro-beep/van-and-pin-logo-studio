import { describe, expect, it } from "vitest";
import { obterAvisos } from "@/lib/avisos-store";
import {
  adicionarPedido,
  cadastroDoPedido,
  ligarPedidoAoCadastro,
  obterPassageiros,
  obterPedidos,
} from "@/lib/passageiros-store";

describe("G1: passageiro cadastrado direto pelo vanzeiro entra no app", () => {
  it("o pedido com o mesmo telefone acha o cadastro; Ligar dá a conta ao cadastro, sem duplicar", () => {
    const gabriel = obterPassageiros().find((p) => p.id === "p-gabriel")!;
    expect(gabriel.pessoaId).toBeUndefined();
    const id = adicionarPedido({
      vanzeiroId: gabriel.vanzeiroId,
      destinoId: gabriel.destinoId,
      pessoaId: "conta-gabriel",
      nome: "Gabriel R.",
      telefone: "(43) 99912-5566",
    });
    const pedido = obterPedidos().find((p) => p.id === id)!;
    expect(cadastroDoPedido(obterPassageiros(), pedido)?.id).toBe("p-gabriel");
    const antes = obterPassageiros().length;

    expect(ligarPedidoAoCadastro(id)).toEqual({ ok: true });
    expect(obterPassageiros()).toHaveLength(antes);
    expect(obterPassageiros().find((p) => p.id === "p-gabriel")).toMatchObject({
      pessoaId: "conta-gabriel",
      plano: gabriel.plano,
      valor: gabriel.valor,
    });
    expect(obterPedidos().find((p) => p.id === id)).toBeUndefined();
    expect(
      obterAvisos().some(
        (a) => a.tipo === "pedido_aceito" && a.paraVanzeiroOuPassageiroId === "conta-gabriel",
      ),
    ).toBe(true);
    expect(ligarPedidoAoCadastro(id)).toEqual({
      ok: false,
      motivo: "Este pedido já foi respondido.",
    });
  });

  it("telefone diferente: não acha cadastro (segue o Aceitar normal)", () => {
    expect(
      cadastroDoPedido(obterPassageiros(), { destinoId: "centro-unisul", telefone: "43900000000" }),
    ).toBeUndefined();
  });
});
