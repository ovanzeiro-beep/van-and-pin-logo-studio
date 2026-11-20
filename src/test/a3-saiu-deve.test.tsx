import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { marcarComoPago, obterCobrancas } from "@/lib/cobrancas-store";
import { formatarReais } from "@/lib/dinheiro";
import { sairDoDestino } from "@/lib/exclusoes";
import { mudarSessao, mudarSessaoPassageiro } from "@/lib/sessao";
import { useEmAbertoDeQuemSaiu, useIdsDasMinhasCobrancas, useMinhaSituacao } from "@/lib/sessao-passageiro";

describe("A3 (opção 1): quem sai do último destino continua vendo o que deve", () => {
  it("Beatriz sai do único destino: fica sem van, mas vê a cobrança vencida (R$ 280,00, devendo)", () => {
    mudarSessao({ papel: "passageiro" });
    mudarSessaoPassageiro({ passageiroId: "p-beatriz", nome: "Beatriz Martins", telefone: "43988452301", pedidoId: null });
    expect(renderHook(() => useMinhaSituacao()).result.current.tipo).toBe("membro");
    expect(renderHook(() => useEmAbertoDeQuemSaiu()).result.current).toBeNull();

    expect(sairDoDestino("p-beatriz").ok).toBe(true);
    expect(renderHook(() => useMinhaSituacao()).result.current.tipo).toBe("sem-van");
    expect(renderHook(() => useIdsDasMinhasCobrancas()).result.current).toEqual(["p-beatriz"]);
    const emAberto = renderHook(() => useEmAbertoDeQuemSaiu()).result.current;
    expect(emAberto).toEqual({ total: 28000, devendo: true });
    expect(formatarReais(emAberto!.total)).toBe(formatarReais(28000));
  });

  // Correção 2 (D1-C): o mês já começado (21/10–20/11) continua valendo depois da saída; pago, o cartão some.
  it("quem sai no meio do mês vê a mensalidade em andamento; sem dever nada, não vê o cartão", () => {
    mudarSessaoPassageiro({ passageiroId: "p-thiago", pedidoId: null });
    expect(sairDoDestino("p-thiago").ok).toBe(true);
    expect(renderHook(() => useEmAbertoDeQuemSaiu()).result.current).toEqual({
      total: 28000,
      devendo: false,
    });
    const abertas = obterCobrancas().filter(
      (x) => x.passageiroId === "p-thiago" && !x.pagamento && !x.cancelamento,
    );
    expect(abertas.length).toBeGreaterThan(0);
    for (const c of abertas) expect(marcarComoPago(c.id, "pix").ok).toBe(true);
    expect(renderHook(() => useEmAbertoDeQuemSaiu()).result.current).toBeNull();
  });
});
