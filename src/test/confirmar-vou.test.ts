import { describe, expect, it } from "vitest";
import { diaPorExtenso, textoDaConfirmacao } from "@/components/app/passageiro/BotaoVou";

const destino = {
  saida: "11:00",
  prazo: "30min" as const,
  ativo: true,
  tipo: "fixa" as const,
  dias: ["seg", "ter", "qua", "qui", "sex", "sab", "dom"] as never,
  data: null,
  diasCancelados: [],
};

describe("Confirmar presença antes do Vou (dono, 17/11)", () => {
  it("mostra o dia por extenso, a saída e o prazo para desistir", () => {
    expect(diaPorExtenso("2026-11-18", "2026-11-17")).toBe("Quarta, 18 de nov");
    expect(diaPorExtenso("2026-11-17", "2026-11-17")).toBe("Hoje, 17 de nov");
    expect(
      textoDaConfirmacao(destino, "2026-11-17", { data: "2026-11-17", hora: "09:00" }),
    ).toEqual({
      dia: "Hoje, 17 de nov",
      saida: "Saída às 11:00",
      prazo: "Pode desistir no app até as 10:30",
      aviso: null,
    });
  });

  it("prazo de hoje encerrado: avisa que a confirmação é para a próxima viagem", () => {
    expect(
      textoDaConfirmacao(destino, "2026-11-18", { data: "2026-11-17", hora: "10:35" }).aviso,
    ).toBe(
      "O prazo da viagem de hoje encerrou às 10:30. Esta confirmação é para quarta, 18 de nov.",
    );
    expect(
      textoDaConfirmacao(destino, "2026-11-18", { data: "2026-11-17", hora: "09:00" }).aviso,
    ).toBeNull();
  });
});
