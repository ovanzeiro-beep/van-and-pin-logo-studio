import { describe, expect, it } from "vitest";
import type { Aviso, TipoAviso } from "@/data/exemplo";
import { estadoDaPermissao, notificacaoDoAviso, notificacaoDoPedido, novosParaMim, ROTULO_DO_AVISO } from "@/lib/notificacoes";

const aviso = (id: string, para: string, tipo: TipoAviso = "prazo_chegando"): Aviso => ({
  id,
  vanzeiroId: "vanzeiro-carlos",
  tipo,
  paraVanzeiroOuPassageiroId: para,
  dataCriacao: "2026-11-13",
  lido: false,
  textoResumido: "Responda até 05:40 se vai hoje, em Cambará → UENP Jacarezinho",
});

describe("A2: notificações no celular", () => {
  it("situação da permissão do celular", () => {
    expect(estadoDaPermissao(false, undefined)).toBe("sem-suporte");
    expect(estadoDaPermissao(true, "default")).toBe("nao-pedida");
    expect(estadoDaPermissao(true, "granted")).toBe("ativada");
    expect(estadoDaPermissao(true, "denied")).toBe("bloqueada");
  });

  it("a notificação usa as mesmas palavras do sininho e abre a tela de Notificações certa", () => {
    expect(notificacaoDoAviso(aviso("a1", "p-juliana"), "passageiro")).toEqual({
      titulo: "Prazo chegando",
      corpo: "Responda até 05:40 se vai hoje, em Cambará → UENP Jacarezinho",
      url: "/passageiro/notificacoes",
      tag: "a1",
    });
    expect(notificacaoDoAviso(aviso("a2", "vanzeiro-carlos", "cobranca_vencida"), "vanzeiro").url).toBe("/vanzeiro/notificacoes");
    expect(Object.keys(ROTULO_DO_AVISO).length).toBe(8);
  });

  it("pedido novo vira notificação para o vanzeiro, com o destino", () => {
    const n = notificacaoDoPedido({ id: "pd", vanzeiroId: "v", destinoId: "d", nome: "Larissa Moreira", telefone: "43997012345" }, "Jacarezinho → Londrina");
    expect(n).toEqual({ titulo: "Pedido novo", corpo: "Larissa Moreira quer entrar em Jacarezinho → Londrina", url: "/vanzeiro/notificacoes", tag: "pd" });
  });

  it("só o que é novo e para quem está usando este celular", () => {
    const lista = [aviso("velho", "p-juliana"), aviso("novo", "p-juliana"), aviso("de-outro", "p-gabriel")];
    expect(novosParaMim(new Set(["velho"]), lista, (a) => a.paraVanzeiroOuPassageiroId === "p-juliana").map((a) => a.id)).toEqual(["novo"]);
  });
});
