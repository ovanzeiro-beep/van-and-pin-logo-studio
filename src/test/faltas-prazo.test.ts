import { describe, expect, it } from "vitest";
import { obterCobrancas } from "@/lib/cobrancas-store";
import { responder } from "@/lib/respostas-store";
import { registrarFaltasDoPrazo } from "@/lib/viagem-store";

// Às 05:10 a viagem das 06:40 (Cambará → UENP) ainda aceita resposta: o prazo é 05:40.
const hoje = "2026-11-13";
const faltasDaFernanda = () =>
  obterCobrancas()
    .filter((c) => c.passageiroId === "p-fernanda" && !c.pagamento && !c.cancelamento && c.vencimento > hoje)
    .reduce((n, c) => n + c.faltas, 0);

describe("Falta conta quando o prazo passa", () => {
  it("o 'Não vou' no prazo vira falta quando o prazo passa, mesmo sem a viagem ser iniciada, e só uma vez", () => {
    const antes = faltasDaFernanda();
    responder("p-fernanda", hoje, "nao-vai");
    registrarFaltasDoPrazo({ data: hoje, hora: "05:30" });
    expect(faltasDaFernanda()).toBe(antes);
    registrarFaltasDoPrazo({ data: hoje, hora: "05:40" });
    expect(faltasDaFernanda()).toBe(antes + 1);
    registrarFaltasDoPrazo({ data: hoje, hora: "06:00" });
    expect(faltasDaFernanda()).toBe(antes + 1);
  });

  it("quem disse 'Vou' ou não respondeu não ganha falta", () => {
    const antes = obterCobrancas().reduce((n, c) => n + (c.passageiroId === "p-gabriel" || c.passageiroId === "p-juliana" ? c.faltas : 0), 0);
    registrarFaltasDoPrazo({ data: hoje, hora: "06:00" });
    expect(obterCobrancas().reduce((n, c) => n + (c.passageiroId === "p-gabriel" || c.passageiroId === "p-juliana" ? c.faltas : 0), 0)).toBe(antes);
  });
});
