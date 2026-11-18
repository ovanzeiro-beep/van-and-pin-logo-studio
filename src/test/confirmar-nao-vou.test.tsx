import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BotaoNaoVou, prazoDoNaoVou } from "@/components/app/passageiro/BotaoVou";
import { passageirosExemplo } from "@/data/exemplo";
import { dataDeHoje } from "@/lib/agora";

const eu = passageirosExemplo.find((p) => p.id === "p-mariana")!;

describe("'Não vou' pede confirmação (toque sem querer não tira o lugar)", () => {
  it("o prazo vira 'Pode mudar de ideia'", () => {
    expect(prazoDoNaoVou("Pode desistir no app até as 17:00")).toBe(
      "Pode mudar de ideia no app até as 17:00",
    );
  });

  it("quem tinha dito Vou vê que o lugar fica livre; vê a opção de confirmar cancelamento", () => {
    render(
      <BotaoNaoVou
        passageiroId={eu.id}
        destinoId={eu.destinoId}
        data={dataDeHoje()}
        resposta="vai"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Não vou/ }));
    expect(screen.getByText("Cancelar participação?")).toBeTruthy();
    expect(screen.getByText(/Seu lugar na van fica livre para outra pessoa/)).toBeTruthy();
    expect(screen.getByText(/Pode mudar de ideia no app/)).toBeTruthy();
    expect(screen.getByRole("button", { name: /Confirmar cancelamento/ })).toBeTruthy();
  });

  it("sem ter dito Vou, não fala de lugar", () => {
    render(
      <BotaoNaoVou
        passageiroId={eu.id}
        destinoId={eu.destinoId}
        data={dataDeHoje()}
        resposta={undefined}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Não vou/ }));
    expect(screen.queryByText(/Seu lugar na van fica livre/)).toBeNull();
    expect(screen.getByRole("button", { name: "Confirmar que não vou" })).toBeTruthy();
  });
});
