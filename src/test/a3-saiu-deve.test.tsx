import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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

    expect(sairDoDestino("p-beatriz")).toBe(true);
    expect(renderHook(() => useMinhaSituacao()).result.current.tipo).toBe("sem-van");
    expect(renderHook(() => useIdsDasMinhasCobrancas()).result.current).toEqual(["p-beatriz"]);
    const emAberto = renderHook(() => useEmAbertoDeQuemSaiu()).result.current;
    expect(emAberto).toEqual({ total: 28000, devendo: true });
    expect(formatarReais(emAberto!.total)).toBe(formatarReais(28000));
  });

  it("quem saiu sem dever nada não vê o cartão", () => {
    mudarSessaoPassageiro({ passageiroId: "p-thiago", pedidoId: null });
    expect(sairDoDestino("p-thiago")).toBe(true);
    expect(renderHook(() => useEmAbertoDeQuemSaiu()).result.current).toBeNull();
  });
});
