import { describe, expect, it } from "vitest";
import { DATA_DE_HOJE } from "@/data/exemplo";
import { cancelarPendentes, mensagemCobranca, resumoDaSaida, situacao } from "@/lib/cobrancas";
import { obterCobrancas } from "@/lib/cobrancas-store";
import { obterDestinos } from "@/lib/destinos-store";
import { excluirDestino, MOTIVO_DESTINO_EXCLUIDO, MOTIVO_SAIU_DO_DESTINO, sairDoDestino } from "@/lib/exclusoes";
import { obterPassageiros, obterPedidos, obterSaidas } from "@/lib/passageiros-store";

const hoje = DATA_DE_HOJE;
const doPassageiro = (id: string) => obterCobrancas().filter((c) => c.passageiroId === id);

describe("Decisão 6: cobranças de quem sai de um destino", () => {
  it("counts what gets cancelled and what keeps being collected", () => {
    const ids = obterPassageiros().filter((p) => p.destinoId === "jacarezinho-londrina").map((p) => p.id);
    expect(resumoDaSaida(obterCobrancas(), ids, hoje)).toEqual({ pendentes: 3, devendo: 3 });
  });

  it("cancels only pendentes, with the reason; devendo, paid and cancelled stay as they are", () => {
    const antes = obterCobrancas();
    const depois = cancelarPendentes(antes, ["p-pedro", "p-beatriz", "p-lucas"], "Teste", hoje);
    for (const c of depois) {
      const era = antes.find((x) => x.id === c.id)!;
      if (["p-pedro", "p-beatriz", "p-lucas"].includes(c.passageiroId) && situacao(era, hoje) === "pendente") {
        expect(c.cancelamento).toEqual({ data: hoje, motivo: "Teste" });
        expect(situacao(c, hoje)).toBe("cancelada");
      } else {
        expect(c).toEqual(era);
      }
    }
  });

  it("the WhatsApp reminder reads well when the destino no longer exists", () => {
    const c = obterCobrancas().find((x) => x.id === "p-beatriz_2026-11-05")!;
    expect(mensagemCobranca(c, "", hoje)).toContain("da van, no valor de R$");
  });
});

describe("Sair deste destino (passageiro)", () => {
  it("the person leaves only that destino; their pendente there is cancelled", () => {
    expect(sairDoDestino("p-juliana")).toBe(true);
    expect(obterPassageiros().some((p) => p.id === "p-juliana")).toBe(false);
    expect(obterPassageiros().some((p) => p.id === "p-juliana-londrina")).toBe(true);
    expect(obterSaidas().map((p) => p.id)).toContain("p-juliana");
    const nov = doPassageiro("p-juliana").find((c) => c.vencimento === "2026-11-20")!;
    expect(nov.cancelamento?.motivo).toBe(MOTIVO_SAIU_DO_DESTINO);
    expect(doPassageiro("p-juliana").filter((c) => c.pagamento).length).toBeGreaterThan(0);
  });
});

describe("Excluir destino (vanzeiro)", () => {
  it("removes the destino, its passengers and pedidos, cancels pendentes and keeps devendo", () => {
    expect(excluirDestino("jacarezinho-londrina")).toBe(true);
    expect(obterDestinos().some((d) => d.id === "jacarezinho-londrina")).toBe(false);
    expect(obterPassageiros().some((p) => p.destinoId === "jacarezinho-londrina")).toBe(false);
    expect(obterPedidos().some((p) => p.destinoId === "jacarezinho-londrina")).toBe(false);
    const pedro = doPassageiro("p-pedro").filter((c) => c.vencimento >= hoje);
    expect(pedro.every((c) => c.cancelamento?.motivo === MOTIVO_DESTINO_EXCLUIDO)).toBe(true);
    expect(situacao(doPassageiro("p-beatriz").find((c) => c.vencimento === "2026-11-05")!, hoje)).toBe("devendo");
    expect(situacao(doPassageiro("p-mariana").find((c) => c.vencimento === "2026-11-10")!, hoje)).toBe("devendo");
    expect(doPassageiro("p-lucas").find((c) => c.vencimento === "2026-11-07")?.cancelamento?.motivo).toBe("Dia de cortesia");
  });
});

import { comecarViagem } from "@/lib/viagem-store";

describe("Com a viagem de hoje em andamento", () => {
  it("neither excluir destino nor sair deste destino works", () => {
    const cambara = obterDestinos().find((d) => d.id === "centro-unisul")!;
    comecarViagem(cambara, ["p-gabriel"]);
    expect(excluirDestino("centro-unisul")).toBe(false);
    expect(sairDoDestino("p-gabriel")).toBe(false);
    expect(obterDestinos().some((d) => d.id === "centro-unisul")).toBe(true);
    expect(obterPassageiros().some((p) => p.id === "p-gabriel")).toBe(true);
  });
});
