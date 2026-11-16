import { describe, expect, it } from "vitest";
import { destinosExemplo } from "@/data/exemplo";
import { obterRegistroDasViagens } from "@/lib/cobrancas-store";
import { obterPassageiros } from "@/lib/passageiros-store";
import { problemaDoPeriodo, respostaFixa, respostasComFixas, type RespostasFixas } from "@/lib/respostas-fixas";
import {
  fecharRespostas,
  ligarVouSempre,
  marcarNaoVouNoPeriodo,
  obterMomentoDaResposta,
  obterRespostasFixas,
  obterRespostasDoDia,
  periodosDeNaoVou,
  responder,
  tirarNaoVouDoPeriodo,
} from "@/lib/respostas-store";
import { registrarFaltasDoPrazo } from "@/lib/viagem-store";

// Relógio dos exemplos: 13/11/2026 às 05:10. Cambará → UENP (centro-unisul) sai 06:40, prazo 05:40.
const hoje = "2026-11-13";

describe("T3: regras do 'Vou sempre' e do 'Não vou de… até…'", () => {
  const fixas = (f: Partial<RespostasFixas>): RespostasFixas => ({ vouSempre: [], naoVou: [], ...f });

  it("o período de 'Não vou' vale mais que o 'Vou sempre'; fora dele, conta 'Vou'", () => {
    const f = fixas({
      vouSempre: [{ passageiroId: "p", desde: "2026-11-01 10:00", ate: null }],
      naoVou: [{ id: "n", passageiroId: "p", de: "2026-11-20", ate: "2026-11-22", em: "2026-11-02 10:00", tiradoEm: null }],
    });
    expect(respostaFixa(f, "p", "2026-11-21", "2026-11-21 05:40")).toEqual({ resposta: "nao-vai", em: "2026-11-02 10:00" });
    expect(respostaFixa(f, "p", "2026-11-23", "2026-11-23 05:40")).toEqual({ resposta: "vai", em: "2026-11-01 10:00" });
    expect(respostaFixa(f, "outro", "2026-11-23", "2026-11-23 05:40")).toBeUndefined();
  });

  it("só vale para o dia se foi marcado antes do prazo; desligar depois do prazo não muda aquele dia", () => {
    const depois = fixas({ vouSempre: [{ passageiroId: "p", desde: "2026-11-13 06:00", ate: null }] });
    expect(respostaFixa(depois, "p", hoje, "2026-11-13 05:40")).toBeUndefined();
    const desligado = fixas({ vouSempre: [{ passageiroId: "p", desde: "2026-11-01 10:00", ate: "2026-11-13 06:00" }] });
    expect(respostaFixa(desligado, "p", hoje, "2026-11-13 05:40")?.resposta).toBe("vai");
    expect(respostaFixa(desligado, "p", "2026-11-16", "2026-11-16 05:40")).toBeUndefined();
  });

  it("o que a pessoa respondeu no dia sempre vale; o 'Vou' automático só pega lugar livre (quem ligou primeiro fica)", () => {
    const d = destinosExemplo.find((x) => x.id === "centro-unisul")!;
    const passageiros = [
      { id: "a", destinoId: d.id },
      { id: "b", destinoId: d.id },
      { id: "c", destinoId: d.id },
    ];
    const f = fixas({
      vouSempre: [
        { passageiroId: "c", desde: "2026-11-02 08:00", ate: null },
        { passageiroId: "b", desde: "2026-11-01 08:00", ate: null },
        { passageiroId: "a", desde: "2026-11-01 07:00", ate: null },
      ],
    });
    const r = respostasComFixas({ a: "nao-vai" }, hoje, { passageiros, destinos: [d], fixas: f, fechada: () => false, lugares: () => 1 });
    expect(r).toEqual({ a: "nao-vai", b: "vai" });
    const fechada = respostasComFixas({}, hoje, { passageiros, destinos: [d], fixas: f, fechada: () => true, lugares: () => null });
    expect(fechada).toEqual({});
  });

  it("período: não pode começar antes de hoje nem acabar antes de começar", () => {
    expect(problemaDoPeriodo("", "", hoje)).toBe("Escolha o primeiro e o último dia.");
    expect(problemaDoPeriodo("2026-11-12", "2026-11-20", hoje)).toBe("O primeiro dia não pode ser antes de hoje.");
    expect(problemaDoPeriodo("2026-11-20", "2026-11-19", hoje)).toBe("O último dia não pode ser antes do primeiro.");
    expect(problemaDoPeriodo(hoje, hoje, hoje)).toBeNull();
  });
});

describe("T3: no app (os dois painéis veem o mesmo)", () => {
  it("'Vou sempre' conta como 'Vou' hoje; a pessoa ainda pode dizer 'Não vou' até o prazo", () => {
    expect(obterRespostasDoDia(hoje)["p-juliana"]).toBeUndefined();
    ligarVouSempre("p-juliana", true);
    expect(obterRespostasDoDia(hoje)["p-juliana"]).toBe("vai");
    expect(obterRespostasDoDia("2026-11-16")["p-juliana"]).toBe("vai");
    responder("p-juliana", hoje, "nao-vai");
    expect(obterRespostasDoDia(hoje)["p-juliana"]).toBe("nao-vai");
    expect(obterRespostasDoDia("2026-11-16")["p-juliana"]).toBe("vai");
    ligarVouSempre("p-juliana", false);
    expect(obterRespostasDoDia("2026-11-16")["p-juliana"]).toBeUndefined();
  });

  it("vale só para o destino escolhido", () => {
    ligarVouSempre("p-juliana", true);
    expect(obterRespostasDoDia("2026-11-16")["p-juliana-londrina"]).toBeUndefined();
    ligarVouSempre("p-juliana", false);
  });

  it("'Não vou de… até…' conta como avisado no prazo e dá o desconto quando o prazo passa", () => {
    marcarNaoVouNoPeriodo("p-fernanda", "2026-11-16", "2026-11-17");
    expect(obterRespostasDoDia("2026-11-16")["p-fernanda"]).toBe("nao-vai");
    expect(obterMomentoDaResposta("p-fernanda", "2026-11-16")?.em).toBe("2026-11-13 05:10");
    registrarFaltasDoPrazo({ data: "2026-11-16", hora: "06:00" });
    expect(obterRegistroDasViagens().faltas).toContainEqual({ passageiroId: "p-fernanda", data: "2026-11-16", avisouNoPrazo: true, avisouEm: "2026-11-13 05:10" });
    const [periodo] = periodosDeNaoVou(obterRespostasFixas(), "p-fernanda", hoje);
    tirarNaoVouDoPeriodo(periodo!.id);
    expect(periodosDeNaoVou(obterRespostasFixas(), "p-fernanda", hoje)).toEqual([]);
    expect(obterRespostasDoDia("2026-11-17")["p-fernanda"]).toBeUndefined();
  });

  it("quando a viagem começa, as respostas automáticas ficam guardadas como estavam", () => {
    const quem = obterPassageiros().find((p) => p.destinoId === "centro-unisul" && obterRespostasDoDia(hoje)[p.id] === undefined)!;
    ligarVouSempre(quem.id, true);
    expect(obterRespostasDoDia(hoje)[quem.id]).toBe("vai");
    fecharRespostas("centro-unisul", hoje);
    ligarVouSempre(quem.id, false);
    expect(obterRespostasDoDia(hoje)[quem.id]).toBe("vai");
    expect(obterRespostasDoDia("2026-11-16")[quem.id]).toBeUndefined();
  });
});
