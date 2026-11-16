import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MensagemDasAcoes } from "@/components/app/MensagemDasAcoes";
import { deuCerto, fazer, naoDeu, obterMensagemDasAcoes, SEM_RESPOSTA } from "@/lib/acoes";
import { cancelarCobranca, marcarComoPago, obterCobrancas } from "@/lib/cobrancas-store";
import { anotarGasto, apagarGasto } from "@/lib/gastos-store";
import { marcarNaoVouNoPeriodo, responder } from "@/lib/respostas-store";
import { atualizarViagem } from "@/lib/viagem-store";

const hoje = "2026-11-13";

describe("V2: a peça única das ações", () => {
  it("devolve a resposta; quando não dá certo, guarda o motivo para a tela; quando dá, apaga a mensagem", async () => {
    expect(await fazer(() => naoDeu("O prazo para responder já passou."))).toEqual({ ok: false, motivo: "O prazo para responder já passou." });
    expect(obterMensagemDasAcoes()?.texto).toBe("O prazo para responder já passou.");
    expect(await fazer(() => deuCerto)).toEqual({ ok: true });
    expect(obterMensagemDasAcoes()).toBeNull();
  });

  it("se a ação quebrar (sem sinal, com o banco), avisa para conferir o sinal", async () => {
    const r = await fazer(() => {
      throw new Error("sem rede");
    });
    expect(r).toEqual({ ok: false, motivo: SEM_RESPOSTA });
  });

  it("na tela: a mensagem aparece no alto, em vermelho, e fecha no X", async () => {
    render(<MensagemDasAcoes />);
    await act(async () => {
      await fazer(() => naoDeu("A van lotou. Não tem mais lugar nesta viagem."));
    });
    expect(screen.getByRole("alert").textContent).toContain("A van lotou.");
    fireEvent.click(screen.getByRole("button", { name: "Fechar a mensagem" }));
    expect(screen.queryByRole("alert")).toBeNull();
  });
});

describe("V2: cada ação diz o motivo quando não dá certo", () => {
  it("respostas", () => {
    expect(responder("p-juliana-londrina", hoje, "vai")).toEqual(naoDeu("O prazo para responder já passou."));
    expect(responder("ninguem", hoje, "vai").ok).toBe(false);
    expect(responder("p-juliana", hoje, "vai")).toEqual(deuCerto);
    expect(marcarNaoVouNoPeriodo("p-juliana", "2026-11-20", "2026-11-19")).toEqual(naoDeu("O último dia não pode ser antes do primeiro."));
  });

  it("cobranças: nunca editadas; pagar ou cancelar de novo explica o porquê", () => {
    const c = obterCobrancas().find((x) => !x.pagamento && !x.cancelamento)!;
    expect(cancelarCobranca(c.id, "  ")).toEqual(naoDeu("Escreva o motivo do cancelamento."));
    expect(marcarComoPago(c.id, "pix")).toEqual(deuCerto);
    expect(marcarComoPago(c.id, "pix")).toEqual(naoDeu("Esta cobrança já estava paga."));
    expect(cancelarCobranca(c.id, "Cortesia")).toEqual(naoDeu("Esta cobrança já estava paga."));
    expect(marcarComoPago("nao-existe", "dinheiro")).toEqual(naoDeu("Não achamos esta cobrança."));
  });

  it("gastos e viagem", () => {
    expect(anotarGasto({ tipo: "outros", descricao: "", valor: 1000, data: hoje })).toEqual(naoDeu("Escreva o que foi o gasto."));
    expect(apagarGasto("nao-existe")).toEqual(naoDeu("Este gasto já tinha sido apagado."));
    expect(atualizarViagem((v) => v)).toEqual(naoDeu("Nenhuma viagem está acontecendo agora."));
  });
});
