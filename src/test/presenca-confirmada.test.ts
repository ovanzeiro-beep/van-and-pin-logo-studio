import { describe, expect, it } from "vitest";
import { obterAvisos } from "@/lib/avisos-store";
import { dataDeHoje } from "@/lib/agora";
import { responder } from "@/lib/respostas-store";

describe("Aviso de presença confirmada (dono, 17/11)", () => {
  it("o passageiro que diz 'Vou' recebe a confirmação com o prazo para desistir", () => {
    const hoje = dataDeHoje();
    expect(responder("p-juliana", hoje, "vai")).toEqual({ ok: true });
    const dela = obterAvisos().filter((a) => a.chave === `presenca_p-juliana_${hoje}`);
    expect(dela.map((a) => [a.tipo, a.paraVanzeiroOuPassageiroId, a.textoResumido])).toEqual([
      [
        "presenca_confirmada",
        "p-juliana",
        "Você confirmou que hoje vai de Cambará a UENP Jacarezinho. Se desistir, avise no app até as 05:40.",
      ],
    ]);
  });
});
