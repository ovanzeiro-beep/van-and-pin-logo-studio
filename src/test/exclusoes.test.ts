import { describe, expect, it } from "vitest";
import { DATA_DE_HOJE } from "@/data/exemplo";
import {
  cancelarPeriodosFuturos,
  inicioDoPeriodo,
  mensagemCobranca,
  resumoDaSaida,
  situacao,
} from "@/lib/cobrancas";
import { obterCobrancas } from "@/lib/cobrancas-store";
import { obterDestinos } from "@/lib/destinos-store";
import { excluirDestino, excluirMinhaConta, MOTIVO_DESTINO_EXCLUIDO, MOTIVO_SAIU_DO_DESTINO, sairDoDestino } from "@/lib/exclusoes";
import { obterPassageiros, obterPedidos, obterSaidas } from "@/lib/passageiros-store";

const hoje = DATA_DE_HOJE;
const doPassageiro = (id: string) => obterCobrancas().filter((c) => c.passageiroId === id);

describe("Decisão 6: cobranças de quem sai de um destino", () => {
  it("counts what gets cancelled and what keeps being collected", () => {
    const ids = obterPassageiros().filter((p) => p.destinoId === "jacarezinho-londrina").map((p) => p.id);
    expect(resumoDaSaida(obterCobrancas(), ids, hoje)).toEqual({ pendentes: 3, devendo: 2 });
  });

  // Correção 2 (D1-C, 20/11/2026) substitui a decisão 6: só cai o que é de um período que começa depois da saída.
  it("cancels only pendentes of a period that starts after the exit; trips made, started periods, devendo, paid and cancelled stay", () => {
    // A quinzena seguinte do Pedro (16/11–30/11) ainda não existe nos exemplos (o app cria uma à frente): entra aqui.
    const base = obterCobrancas().find(
      (c) => c.passageiroId === "p-pedro" && c.vencimento === "2026-11-15",
    )!;
    const antes = [
      ...obterCobrancas(),
      { ...base, id: "p-pedro_2026-11-30", vencimento: "2026-11-30", periodoFaltas: null },
    ];
    const quem = obterPassageiros().filter((p) =>
      ["p-pedro", "p-beatriz", "p-lucas"].includes(p.id),
    );
    const dia = new Map(quem.map((p) => [p.id, p.vencimento]));
    const depois = cancelarPeriodosFuturos(antes, quem, "Teste", hoje);
    let canceladas = 0;
    let mantidasDoPeriodoIniciado = 0;
    for (const c of depois) {
      const era = antes.find((x) => x.id === c.id)!;
      const inicio = dia.has(c.passageiroId) ? inicioDoPeriodo(era, dia.get(c.passageiroId)) : null;
      if (
        dia.has(c.passageiroId) &&
        situacao(era, hoje) === "pendente" &&
        inicio !== null &&
        inicio > hoje
      ) {
        expect(c.cancelamento).toEqual({ data: hoje, motivo: "Teste" });
        canceladas++;
      } else {
        expect(c).toEqual(era);
        if (dia.has(c.passageiroId) && situacao(era, hoje) === "pendente")
          mantidasDoPeriodoIniciado++;
      }
    }
    expect(canceladas).toBeGreaterThan(0);
    expect(mantidasDoPeriodoIniciado).toBeGreaterThan(0);
  });

  it("the WhatsApp reminder reads well when the destino no longer exists", () => {
    const c = obterCobrancas().find((x) => x.id === "p-beatriz_2026-11-05")!;
    expect(mensagemCobranca(c, "", hoje)).toContain("da van, no valor de R$");
  });
});

describe("Sair deste destino (passageiro)", () => {
  it("the person leaves only that destino; the month already started (21/10–20/11) keeps being charged", () => {
    expect(sairDoDestino("p-juliana").ok).toBe(true);
    expect(obterPassageiros().some((p) => p.id === "p-juliana")).toBe(false);
    expect(obterPassageiros().some((p) => p.id === "p-juliana-londrina")).toBe(true);
    expect(obterSaidas().map((p) => p.id)).toContain("p-juliana");
    const nov = doPassageiro("p-juliana").find((c) => c.vencimento === "2026-11-20")!;
    expect(nov.cancelamento).toBeNull();
    expect(situacao(nov, hoje)).toBe("pendente");
    expect(
      doPassageiro("p-juliana").some((c) => c.cancelamento?.motivo === MOTIVO_SAIU_DO_DESTINO),
    ).toBe(false);
    expect(doPassageiro("p-juliana").filter((c) => c.pagamento).length).toBeGreaterThan(0);
  });
});

describe("Excluir destino (vanzeiro)", () => {
  it("removes the destino, its passengers and pedidos, cancels only future periods and keeps devendo", () => {
    expect(excluirDestino("jacarezinho-londrina").ok).toBe(true);
    expect(obterDestinos().some((d) => d.id === "jacarezinho-londrina")).toBe(false);
    expect(obterPassageiros().some((p) => p.destinoId === "jacarezinho-londrina")).toBe(false);
    expect(obterPedidos().some((p) => p.destinoId === "jacarezinho-londrina")).toBe(false);
    // Pedro (Quinzenal, dias 15 e 30): a quinzena 31/10–15/11 já começou e fica; a 16/11–30/11 começa depois e cai.
    const pedro = doPassageiro("p-pedro").filter((c) => c.vencimento >= hoje);
    for (const c of pedro) {
      const futura = (inicioDoPeriodo(c, 15) ?? "") > hoje;
      expect(c.cancelamento?.motivo ?? null).toBe(futura ? MOTIVO_DESTINO_EXCLUIDO : null);
    }
    expect(pedro.some((c) => c.cancelamento === null)).toBe(true);
    expect(situacao(doPassageiro("p-beatriz").find((c) => c.vencimento === "2026-11-05")!, hoje)).toBe("devendo");
    expect(situacao(doPassageiro("p-mariana").find((c) => c.vencimento === "2026-11-10")!, hoje)).toBe("devendo");
    expect(doPassageiro("p-lucas").find((c) => c.id === "p-lucas_2026-11-07")?.cancelamento?.motivo).toBe("Dia de cortesia");
  });
});

import { comecarViagem, limparViagens } from "@/lib/viagem-store";

describe("Com a viagem de hoje em andamento", () => {
  it("neither excluir destino nor sair deste destino works", () => {
    const cambara = obterDestinos().find((d) => d.id === "centro-unisul")!;
    comecarViagem(cambara, ["p-gabriel"]);
    expect(excluirDestino("centro-unisul").ok).toBe(false);
    expect(sairDoDestino("p-gabriel").ok).toBe(false);
    expect(obterDestinos().some((d) => d.id === "centro-unisul")).toBe(true);
    expect(obterPassageiros().some((p) => p.id === "p-gabriel")).toBe(true);
  });
});

describe("Excluir minha conta", () => {
  // Clean up any active trip before testing account deletion
  beforeEach(() => {
    limparViagens();
  });

  it("vanzeiro: deletes all destinos, passengers and their pendentes", () => {
    const numDestinos = obterDestinos().length;
    expect(numDestinos).toBeGreaterThan(0);
    expect(excluirMinhaConta("vanzeiro").ok).toBe(true);
    expect(obterDestinos().length).toBe(0);
    expect(obterPassageiros().length).toBe(0);
  });

  it("passageiro: leaves all destinos; their pendentes are cancelled, devendo stay", () => {
    const antes = obterPassageiros();
    const eu = antes.find((p) => p.pessoaId === "pessoa-juliana");
    if (!eu) return; // Juliana has only one membership, so she'll be gone after the first one
    const numAntigos = antes.filter((p) => p.pessoaId === "pessoa-juliana").length;
    expect(numAntigos).toBeGreaterThan(0);

    excluirMinhaConta("passageiro");

    const depois = obterPassageiros();
    expect(depois.filter((p) => p.pessoaId === "pessoa-juliana").length).toBe(0);
    expect(obterSaidas().filter((p) => p.pessoaId === "pessoa-juliana").length).toBeGreaterThan(0);
  });
});
