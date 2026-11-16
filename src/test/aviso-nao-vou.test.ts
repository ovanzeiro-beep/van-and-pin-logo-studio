import { describe, expect, it } from "vitest";
import { obterAvisos } from "@/lib/avisos-store";
import { marcarNaoVouNoPeriodo, obterRespostasFixas, periodosDeNaoVou, tirarNaoVouDoPeriodo } from "@/lib/respostas-store";

const hoje = "2026-11-13";
const avisosDaJuliana = () => obterAvisos().filter((a) => a.chave?.startsWith("nao_vou_periodo_") && a.passageiroId === "p-juliana");

describe("T7: aviso no sininho do vanzeiro para o 'Não vou de… até…'", () => {
  it("marcar avisa o vanzeiro; tirar troca pelo aviso de que tirou (um aviso por período)", () => {
    marcarNaoVouNoPeriodo("p-juliana", "2026-11-16", "2026-11-17");
    expect(avisosDaJuliana()).toHaveLength(1);
    expect(avisosDaJuliana()[0]).toMatchObject({
      tipo: "resposta_passageiro",
      paraVanzeiroOuPassageiroId: "vanzeiro-carlos",
      destinoId: "centro-unisul",
      lido: false,
      textoResumido: 'Juliana marcou "Não vou" de 16/11 até 17/11, em Cambará → UENP Jacarezinho',
    });
    const [periodo] = periodosDeNaoVou(obterRespostasFixas(), "p-juliana", hoje);
    tirarNaoVouDoPeriodo(periodo!.id);
    expect(avisosDaJuliana()).toHaveLength(1);
    expect(avisosDaJuliana()[0]?.textoResumido).toBe('Juliana tirou o "Não vou" de 16/11 até 17/11, em Cambará → UENP Jacarezinho');
    tirarNaoVouDoPeriodo(periodo!.id);
    expect(avisosDaJuliana()).toHaveLength(1);
  });

  it("um dia só aparece como 'em 20/11'", () => {
    marcarNaoVouNoPeriodo("p-juliana", "2026-11-20", "2026-11-20");
    expect(avisosDaJuliana().some((a) => a.textoResumido === 'Juliana marcou "Não vou" em 20/11, em Cambará → UENP Jacarezinho')).toBe(true);
  });
});
