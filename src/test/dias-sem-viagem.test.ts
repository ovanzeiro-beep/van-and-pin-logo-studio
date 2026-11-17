import { describe, expect, it } from "vitest";
import { DATA_DE_HOJE } from "@/data/exemplo";
import { obterAvisos } from "@/lib/avisos-store";
import { obterRegistroDasViagens } from "@/lib/cobrancas-store";
import { destinoDeRascunho, rascunhoDeDestino } from "@/lib/destinos";
import { obterDestinos, salvarDestino } from "@/lib/destinos-store";
import { cancelarViagemDoDia, desfazerCancelamento, diasCanceladosFuturos, diasQuePodemSerCancelados } from "@/lib/dias-sem-viagem";
import { viagensDoDia } from "@/lib/viagem";
import { comecarViagem, registrarFaltasDoPrazo } from "@/lib/viagem-store";

const hoje = DATA_DE_HOJE; // sexta, 13/11
const cambara = () => obterDestinos().find((d) => d.id === "centro-unisul")!;
const londrina = () => obterDestinos().find((d) => d.id === "jacarezinho-londrina")!;

describe("S1: cancelar a viagem de um dia (feriado)", () => {
  it("só dá para cancelar dia que tem viagem, com motivo", () => {
    expect(cancelarViagemDoDia("centro-unisul", "2026-11-14", "Feriado").ok).toBe(false); // sábado: não tem viagem
    expect(cancelarViagemDoDia("centro-unisul", hoje, "  ").ok).toBe(false);
    expect(cancelarViagemDoDia("centro-unisul", "2026-11-12", "Feriado").ok).toBe(false); // já passou
    expect(diasQuePodemSerCancelados(cambara()).slice(0, 3)).toEqual([hoje, "2026-11-16", "2026-11-17"]);
  });

  it("cancelar hoje: a viagem some, os passageiros são avisados, e quem disse 'Não vou' não ganha desconto", () => {
    const antes = obterAvisos().length;
    expect(cancelarViagemDoDia("centro-unisul", hoje, "Feriado").ok).toBe(true);
    expect(viagensDoDia(obterDestinos(), hoje).map((d) => d.id)).toEqual(["jacarezinho-londrina"]);
    const novos = obterAvisos().slice(antes);
    expect(novos.every((a) => a.tipo === "viagem_cancelada")).toBe(true);
    expect(new Set(novos.map((a) => a.paraVanzeiroOuPassageiroId)).size).toBe(novos.length);
    expect(novos.find((a) => a.paraVanzeiroOuPassageiroId === "p-juliana")?.textoResumido).toMatch(
      (/^Viagem cancelada hoje: Cambará → UENP Jacarezinho\. Motivo: Feriado\. Não precisa confirmar presença\. A próxima viagem é .+, às \d\d:\d\d\.$/),
    );
    // O prazo passa (05:40): a Camila (mensal, "Não vou") não ganha falta, porque não teve viagem.
    registrarFaltasDoPrazo({ data: hoje, hora: "06:00" });
    expect(obterRegistroDasViagens().faltas.some((f) => f.passageiroId === "p-camila" && f.data === hoje)).toBe(false);
    expect(diasCanceladosFuturos(cambara())).toEqual([{ data: hoje, motivo: "Feriado", canceladoEm: hoje }]);
  });

  it("editar o destino não perde os dias cancelados", () => {
    salvarDestino(destinoDeRascunho({ ...rascunhoDeDestino(cambara()), saida: "06:45" }, cambara()));
    expect(cambara().saida).toBe("06:45");
    expect(cambara().diasCancelados?.map((c) => c.data)).toEqual([hoje]);
  });

  it("desfazer: a viagem volta e os passageiros são avisados", () => {
    expect(desfazerCancelamento("centro-unisul", hoje).ok).toBe(true);
    expect(viagensDoDia(obterDestinos(), hoje).map((d) => d.id)).toContain("centro-unisul");
    expect(obterAvisos().at(-1)?.tipo).toBe("viagem_de_volta");
    expect(desfazerCancelamento("centro-unisul", hoje).ok).toBe(false);
  });

  it("viagem que já começou não pode ser cancelada", () => {
    comecarViagem(londrina(), []);
    expect(diasQuePodemSerCancelados(londrina())).not.toContain(hoje);
    expect(cancelarViagemDoDia("jacarezinho-londrina", hoje, "Feriado").ok).toBe(false);
    expect(cancelarViagemDoDia("jacarezinho-londrina", "2026-11-14", "Feriado").ok).toBe(true); // sábado seguinte pode
  });
});
