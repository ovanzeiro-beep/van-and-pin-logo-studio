import { describe, expect, it } from "vitest";
import { DATA_DE_HOJE, destinosExemplo, passageirosExemplo } from "@/data/exemplo";
import { avisosDoRelogio } from "@/lib/avisos";
import { obterAvisos } from "@/lib/avisos-store";
import { obterCobrancas } from "@/lib/cobrancas-store";
import { formatarReais } from "@/lib/dinheiro";
import { obterDestinos } from "@/lib/destinos-store";
import { obterPassageiros } from "@/lib/passageiros-store";
import { responder } from "@/lib/respostas-store";
import { comecarViagem, passarDoTempo } from "@/lib/viagem-store";

const hoje = DATA_DE_HOJE;
const semRespostas = () => ({});
const doRelogio = (hora: string) => avisosDoRelogio({ data: hoje, hora }, destinosExemplo, passageirosExemplo, obterCobrancas(), semRespostas);

describe("Etapa H: avisos que nascem do relógio", () => {
  it("cobrança vencida vai para o vanzeiro, com o nome, o valor e o destino", () => {
    const a = doRelogio("05:10").find((x) => x.chave === "cobranca_vencida_p-beatriz_2026-11-05")!;
    expect(a.paraVanzeiroOuPassageiroId).toBe("vanzeiro-carlos");
    expect(a.textoResumido).toBe(`Beatriz está devendo ${formatarReais(28000)}, em Jacarezinho → Londrina`);
    expect(a.dataCriacao).toBe("2026-11-06");
  });

  it("cobrança vencendo em até 3 dias vai para o passageiro; mais longe, não", () => {
    const avisos = doRelogio("05:10").filter((x) => x.tipo === "cobranca_vencendo");
    expect(avisos.some((a) => a.cobrancaId === "p-pedro_2026-11-15" && a.paraVanzeiroOuPassageiroId === "p-pedro")).toBe(true);
    expect(avisos.find((a) => a.cobrancaId === "p-pedro_2026-11-15")?.textoResumido).toContain("vence em 15/11, em Jacarezinho → Londrina");
    expect(avisos.every((a) => obterCobrancas().find((c) => c.id === a.cobrancaId)!.vencimento <= "2026-11-16")).toBe(true);
  });

  it("prazo chegando: só nos 30 minutos antes do prazo, só para quem não respondeu", () => {
    // Cambará → UENP sai 06:40, prazo 05:40.
    const as0510 = doRelogio("05:10").filter((x) => x.tipo === "prazo_chegando" && x.destinoId === "centro-unisul");
    expect(as0510.length).toBe(passageirosExemplo.filter((p) => p.destinoId === "centro-unisul").length);
    expect(as0510[0]?.textoResumido).toBe("Responda até 05:40 se vai hoje, em Cambará → UENP Jacarezinho");
    expect(doRelogio("05:09").filter((x) => x.tipo === "prazo_chegando" && x.destinoId === "centro-unisul")).toEqual([]);
    expect(doRelogio("05:40").filter((x) => x.tipo === "prazo_chegando" && x.destinoId === "centro-unisul")).toEqual([]);
    const respondeu = avisosDoRelogio({ data: hoje, hora: "05:10" }, destinosExemplo, passageirosExemplo, [], () => ({ "p-juliana": "vai" }));
    expect(respondeu.some((a) => a.chave === `prazo_p-juliana_${hoje}`)).toBe(false);
  });

  it("o relógio passando de novo não repete os avisos", () => {
    passarDoTempo();
    const n = obterAvisos().length;
    expect(n).toBeGreaterThan(0);
    passarDoTempo();
    expect(obterAvisos().length).toBe(n);
  });
});

describe("Etapa H: avisos que nascem das ações", () => {
  it("resposta do passageiro avisa o vanzeiro; mudar a resposta troca o aviso", () => {
    responder("p-juliana", hoje, "nao-vai");
    let dela = obterAvisos().filter((a) => a.chave === `resposta_p-juliana_${hoje}`);
    expect(dela.map((a) => a.textoResumido)).toEqual(['Juliana avisou que hoje não vai de Cambará a UENP Jacarezinho.']);
    responder("p-juliana", hoje, "vai");
    dela = obterAvisos().filter((a) => a.chave === `resposta_p-juliana_${hoje}`);
    expect(dela.map((a) => a.textoResumido)).toEqual(['Juliana confirmou que hoje vai de Cambará a UENP Jacarezinho.']);
    expect(dela[0]?.paraVanzeiroOuPassageiroId).toBe("vanzeiro-carlos");
    expect(dela[0]?.lido).toBe(false);
  });

  it("iniciar a viagem avisa só quem vai que a van saiu", () => {
    const d = obterDestinos().find((x) => x.id === "centro-unisul")!;
    comecarViagem(d, ["p-gabriel"]);
    const saiu = obterAvisos().filter((a) => a.tipo === "van_saiu");
    expect(saiu.map((a) => a.paraVanzeiroOuPassageiroId)).toEqual(["p-gabriel"]);
    expect(saiu[0]?.textoResumido).toBe("A van saiu para a viagem de hoje, em Cambará → UENP Jacarezinho");
    expect(obterPassageiros().some((p) => p.id === "p-gabriel")).toBe(true);
  });
});
