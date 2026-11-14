import { describe, expect, it } from "vitest";
import { DATA_DE_HOJE } from "@/data/exemplo";

const hoje = DATA_DE_HOJE;

describe("Remover passageiro do destino (decisão 2)", () => {
  it("cancela as pendentes com o motivo, mantém as que estão devendo e as pagas, e a pessoa sai da lista", async () => {
    const { removerPassageiroDoDestino, MOTIVO_REMOVIDO_DO_DESTINO } = await import("@/lib/exclusoes");
    const { obterCobrancas } = await import("@/lib/cobrancas-store");
    const { obterPassageiros, obterSaidas } = await import("@/lib/passageiros-store");
    const { situacao } = await import("@/lib/cobrancas");
    const dela = () => obterCobrancas().filter((c) => c.passageiroId === "p-pedro");
    const pendentes = dela().filter((c) => situacao(c, hoje) === "pendente").map((c) => c.id);
    const devendo = dela().filter((c) => situacao(c, hoje) === "devendo").map((c) => c.id);
    const pagas = dela().filter((c) => situacao(c, hoje) === "pago").length;
    expect(pendentes.length).toBeGreaterThan(0);
    expect(removerPassageiroDoDestino("p-pedro", hoje)).toBe(true);
    for (const id of pendentes) expect(obterCobrancas().find((c) => c.id === id)?.cancelamento?.motivo).toBe(MOTIVO_REMOVIDO_DO_DESTINO);
    for (const id of devendo) expect(situacao(obterCobrancas().find((c) => c.id === id)!, hoje)).toBe("devendo");
    expect(dela().filter((c) => situacao(c, hoje) === "pago").length).toBe(pagas);
    expect(obterPassageiros().some((p) => p.id === "p-pedro")).toBe(false);
    expect(obterSaidas().some((p) => p.id === "p-pedro")).toBe(true);
  });
});
