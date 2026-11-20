import { describe, expect, it } from "vitest";
import { DATA_DE_HOJE } from "@/data/exemplo";

const hoje = DATA_DE_HOJE;

describe("Remover passageiro do destino (decisão 2)", () => {
  // Correção 2 (D1-C, 20/11/2026): só cai a pendente de período que começa depois da remoção.
  it("cancela só a quinzena futura, mantém a quinzena iniciada, as que estão devendo e as pagas, e a pessoa sai da lista", async () => {
    const { removerPassageiroDoDestino, MOTIVO_REMOVIDO_DO_DESTINO } = await import("@/lib/exclusoes");
    const { obterCobrancas } = await import("@/lib/cobrancas-store");
    const { obterPassageiros, obterSaidas } = await import("@/lib/passageiros-store");
    const { situacao, inicioDoPeriodo } = await import("@/lib/cobrancas");
    const dela = () => obterCobrancas().filter((c) => c.passageiroId === "p-pedro");
    const pendentes = dela().filter((c) => situacao(c, hoje) === "pendente").map((c) => c.id);
    const devendo = dela().filter((c) => situacao(c, hoje) === "devendo").map((c) => c.id);
    const pagas = dela().filter((c) => situacao(c, hoje) === "pago").length;
    expect(pendentes.length).toBeGreaterThan(0);
    expect(removerPassageiroDoDestino("p-pedro", hoje).ok).toBe(true);
    let canceladas = 0;
    for (const id of pendentes) {
      const c = obterCobrancas().find((x) => x.id === id)!;
      const futura = (inicioDoPeriodo(c, 15) ?? "") > hoje; // Pedro: Quinzenal, dias 15 e 30
      expect(c.cancelamento?.motivo ?? null).toBe(futura ? MOTIVO_REMOVIDO_DO_DESTINO : null);
      if (futura) canceladas++;
    }
    expect(canceladas).toBeLessThan(pendentes.length);
    for (const id of devendo) expect(situacao(obterCobrancas().find((c) => c.id === id)!, hoje)).toBe("devendo");
    expect(dela().filter((c) => situacao(c, hoje) === "pago").length).toBe(pagas);
    expect(obterPassageiros().some((p) => p.id === "p-pedro")).toBe(false);
    expect(obterSaidas().some((p) => p.id === "p-pedro")).toBe(true);
  });
});
