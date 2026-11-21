import { describe, expect, it } from "vitest";
import {
  adicionarPedido,
  cadastroDoPedido,
  confirmarCadastroComCodigo,
  obterPassageiros,
  obterPedidos,
  pedirConfirmacaoDoCadastro,
} from "@/lib/passageiros-store";
import { mensagemDoCodigo } from "@/components/app/PassageirosDoDestino";

const AGORA = "2026-11-13T05:10:00-03:00";

describe("G1 + Correção 6: passageiro cadastrado direto pelo vanzeiro entra no app com o código do WhatsApp", () => {
  it("o código vai para o telefone do cadastro; só o código certo liga a conta, sem duplicar", () => {
    const gabriel = obterPassageiros().find((p) => p.id === "p-gabriel")!;
    expect(gabriel.pessoaId).toBeUndefined();
    const id = adicionarPedido({ vanzeiroId: gabriel.vanzeiroId, destinoId: gabriel.destinoId, pessoaId: "conta-gabriel", nome: "Gabriel R.", telefone: "(43) 99912-5566" });
    const pedido = obterPedidos().find((p) => p.id === id)!;
    expect(cadastroDoPedido(obterPassageiros(), pedido)?.id).toBe("p-gabriel");
    const antes = obterPassageiros().length;

    // Before the code: nothing can be confirmed.
    expect(confirmarCadastroComCodigo(id, "123456")).toEqual({ ok: false, motivo: "O vanzeiro ainda não mandou o código. Aguarde a mensagem dele." });

    const r = pedirConfirmacaoDoCadastro(id, AGORA);
    if (!r.ok) throw new Error(r.motivo);
    expect(r.codigo).toMatch(/^\d{6}$/);
    expect(r.telefone).toBe(gabriel.telefone);
    expect(obterPedidos().find((p) => p.id === id)?.confirmacaoPedidaEm).toBe(AGORA);
    expect(mensagemDoCodigo(r.nome, r.codigo)).toContain(r.codigo);

    const errado = r.codigo === "000000" ? "000001" : "000000";
    expect(confirmarCadastroComCodigo(id, errado)).toEqual({ ok: false, motivo: "Código errado. Confira a mensagem do vanzeiro e tente de novo." });
    expect(obterPassageiros().find((p) => p.id === "p-gabriel")?.pessoaId).toBeUndefined();

    expect(confirmarCadastroComCodigo(id, r.codigo)).toEqual({ ok: true });
    expect(obterPassageiros()).toHaveLength(antes);
    expect(obterPassageiros().find((p) => p.id === "p-gabriel")).toMatchObject({ pessoaId: "conta-gabriel", plano: gabriel.plano, valor: gabriel.valor });
    expect(obterPedidos().find((p) => p.id === id)).toBeUndefined();
    expect(confirmarCadastroComCodigo(id, r.codigo)).toEqual({ ok: false, motivo: "Este pedido já foi respondido." });
  });

  it("5 códigos errados bloqueiam; um código novo do vanzeiro anula o anterior", () => {
    const fernanda = obterPassageiros().find((p) => !p.pessoaId && p.id !== "p-gabriel")!;
    const id = adicionarPedido({ vanzeiroId: fernanda.vanzeiroId, destinoId: fernanda.destinoId, pessoaId: "conta-impostor", nome: fernanda.nome, telefone: fernanda.telefone });
    const r1 = pedirConfirmacaoDoCadastro(id, AGORA);
    if (!r1.ok) throw new Error(r1.motivo);
    const errado = r1.codigo === "999999" ? "999998" : "999999";
    for (let i = 0; i < 4; i++) expect(confirmarCadastroComCodigo(id, errado).ok).toBe(false);
    expect(confirmarCadastroComCodigo(id, errado)).toEqual({ ok: false, motivo: "Muitas tentativas. Peça um código novo ao vanzeiro." });
    expect(confirmarCadastroComCodigo(id, r1.codigo)).toEqual({ ok: false, motivo: "Muitas tentativas. Peça um código novo ao vanzeiro." });
    const r2 = pedirConfirmacaoDoCadastro(id, AGORA);
    if (!r2.ok) throw new Error(r2.motivo);
    if (r2.codigo !== r1.codigo) expect(confirmarCadastroComCodigo(id, r1.codigo).ok).toBe(false);
    // Quem não tem o WhatsApp do cadastro não recebe o código: o cadastro continua sem conta.
    expect(obterPassageiros().find((p) => p.id === fernanda.id)?.pessoaId).toBeUndefined();
  });

  it("telefone diferente: não acha cadastro (segue o Aceitar normal)", () => {
    expect(cadastroDoPedido(obterPassageiros(), { destinoId: "centro-unisul", telefone: "43900000000" })).toBeUndefined();
  });
});
