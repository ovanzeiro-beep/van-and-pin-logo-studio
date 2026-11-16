import { describe, expect, it } from "vitest";
import { DATA_DE_HOJE } from "@/data/exemplo";
import { obterRegistroDasViagens } from "@/lib/cobrancas-store";
import { obterDestinos } from "@/lib/destinos-store";
import { obterPassageiros } from "@/lib/passageiros-store";
import { obterMomentoDaResposta, responder } from "@/lib/respostas-store";
import { comecarViagem } from "@/lib/viagem-store";

const hoje = DATA_DE_HOJE;

describe("Q5: a hora da resposta fica guardada", () => {
  it("guarda quando a pessoa respondeu e qual era o prazo (Cambará → UENP: prazo 05:40)", () => {
    expect(obterMomentoDaResposta("p-juliana", hoje)).toBeUndefined();
    responder("p-juliana", hoje, "vai");
    expect(obterMomentoDaResposta("p-juliana", hoje)).toEqual({ em: "2026-11-13 05:10", prazo: "2026-11-13 05:40" });
  });

  it("resposta recusada (prazo fechado) não guarda hora", () => {
    // Jacarezinho → Londrina: prazo 05:00, já passou às 05:10.
    responder("p-juliana-londrina", hoje, "nao-vai");
    expect(obterMomentoDaResposta("p-juliana-londrina", hoje)).toBeUndefined();
  });

  it("a falta com desconto leva junto quando a pessoa avisou 'Não vou'", () => {
    // Fernanda (Cambará, mensal) avisa "Não vou" às 05:10; o vanzeiro inicia a viagem.
    const fer = obterPassageiros().find((p) => p.id === "p-fernanda")!;
    responder(fer.id, hoje, "nao-vai");
    const cambara = obterDestinos().find((d) => d.id === "centro-unisul")!;
    comecarViagem(cambara, []);
    const falta = obterRegistroDasViagens().faltas.find((f) => f.passageiroId === fer.id && f.data === hoje);
    expect(falta).toEqual({ passageiroId: fer.id, data: hoje, avisouNoPrazo: true, avisouEm: "2026-11-13 05:10" });
  });
});
