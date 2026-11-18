import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ChegadaAoDestino } from "@/components/app/passageiro/ChegadaAoDestino";
import { destinosExemplo } from "@/data/exemplo";
import { chegouAoDestinoComoPassageiro, situacaoParaPassageiro, iniciarViagem } from "@/lib/viagem";
import { previsaoDaVolta } from "@/lib/volta-do-passageiro";

const relogio = vi.hoisted(() => ({ data: "2026-11-18", hora: "17:48" }));
vi.mock("@/lib/agora", async (importar) => ({
  ...(await importar<typeof import("@/lib/agora")>()),
  agora: () => ({ ...relogio }),
}));

const destino = {
  ...destinosExemplo[0]!,
  tipo: "fixa" as const,
  saida: "14:00",
  volta: "18:30",
  voltaData: null,
};
const data = "2026-11-18";

afterEach(() => {
  vi.useRealTimers();
  Object.assign(relogio, { data, hora: "17:48" });
});

describe("Chegada ao destino no Início do passageiro", () => {
  it("troca o status de ida pela chegada só para quem embarcou e permaneceu na van", () => {
    const viagem = {
      ...iniciarViagem(destino, ["a", "b", "c"], data),
      fase: "chegada" as const,
      embarcaram: ["a", "b"],
      ficaram: ["b"],
      naoEstavam: ["c"],
    };
    expect(chegouAoDestinoComoPassageiro(viagem, "a")).toBe(true);
    expect(chegouAoDestinoComoPassageiro(viagem, "b")).toBe(false);
    expect(chegouAoDestinoComoPassageiro(viagem, "c")).toBe(false);

    const status = (
      fase: typeof viagem.fase | "busca" | "conferencia-volta" | "volta" | "encerrada",
      passageiroId = "a",
    ) =>
      situacaoParaPassageiro({
        viagem: { ...viagem, fase },
        passageiroId,
        destino,
        hoje: data,
        proximaData: data,
        resposta: "vai",
        aberta: false,
      }).situacao;
    expect(status("busca")).toBe("Na van");
    expect(status("chegada")).toBe("Chegamos ao destino");
    expect(status("chegada", "c")).toBe("Você não estava no ponto");
    expect(status("conferencia-volta")).toBe("Embarque da volta");
    expect(status("volta")).toBe("Volta em andamento");
    expect(status("encerrada")).toBe("Viagem encerrada");
  });

  it("no percurso só de ida mostra chegada e ida concluída", () => {
    render(<ChegadaAoDestino destino={{ ...destino, volta: null }} dataIda={data} />);
    expect(screen.getByText("Chegamos ao destino")).toBeTruthy();
    expect(screen.getByText("Ida concluída")).toBeTruthy();
    expect(screen.queryByText(/Volta às/)).toBeNull();
  });

  it("mostra o horário salvo e para de contar no zero", () => {
    vi.useFakeTimers();
    render(<ChegadaAoDestino destino={destino} dataIda={data} />);
    expect(screen.getByText("Volta às 18:30")).toBeTruthy();
    expect(screen.getByText("Faltam 42 min")).toBeTruthy();

    relogio.hora = "18:29";
    act(() => vi.advanceTimersByTime(15_000));
    expect(screen.getByText("Falta 1 min")).toBeTruthy();

    relogio.hora = "18:30";
    act(() => vi.advanceTimersByTime(15_000));
    expect(screen.getByText("Aguardando o motorista iniciar a volta.")).toBeTruthy();
    expect(screen.queryByText(/Falta[m]? /)).toBeNull();
  });

  it("usa a data da volta ao virar a meia-noite e em excursão de outro dia", () => {
    const noturna = { ...destino, saida: "22:00", volta: "00:30" };
    expect(previsaoDaVolta(noturna, data, { data, hora: "23:20" })).toEqual({
      horario: "Volta em qui, 19 de nov, às 00:30",
      situacao: "Faltam 1 h 10 min",
    });
    expect(previsaoDaVolta(noturna, data, { data: "2026-11-19", hora: "00:10" })?.situacao).toBe(
      "Faltam 20 min",
    );
    const avulsa = { ...destino, tipo: "avulsa" as const, voltaData: "2026-11-21" };
    expect(previsaoDaVolta(avulsa, data, { data, hora: "18:30" })).toEqual({
      horario: "Volta em sáb, 21 de nov, às 18:30",
      situacao: "Faltam 3 dias",
    });
  });
});
