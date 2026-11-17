import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ViagemEmCurso } from "@/components/app/viagem/ViagemEmCurso";
import { RelogioDoCafe } from "@/components/app/viagem/RelogioDoCafe";
import { destinosExemplo } from "@/data/exemplo";
import { horaDeAgora } from "@/lib/agora";
import { iniciarViagem, somarMinutos } from "@/lib/viagem";

const base = destinosExemplo.find((d) => d.id === "jacarezinho-londrina")!;
const comCafe = {
  ...base,
  paradas: [...base.paradas, "Posto Tocuman"],
  cafe: { parada: "Posto Tocuman", minutos: 20 },
};

describe("Parada do café na tela", () => {
  it("com café no destino, a busca mostra 'Café · 20 min' e 'Parada'", () => {
    const v = iniciarViagem(comCafe, ["p-mariana"], "2026-11-13");
    render(<ViagemEmCurso v={v} passageiros={[]} destino={comCafe} />);
    expect(screen.getByRole("button", { name: /Café · 20 min/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /^Parada$/ })).toBeTruthy();
  });

  it("sem café, continua só 'Fazer parada'", () => {
    const v = iniciarViagem(base, ["p-mariana"], "2026-11-13");
    render(<ViagemEmCurso v={v} passageiros={[]} destino={base} />);
    expect(screen.getByRole("button", { name: /Fazer parada/ })).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Café/ })).toBeNull();
  });

  it("na parada do café: onde, até que horas e quantos minutos faltam", () => {
    const v = {
      ...iniciarViagem(comCafe, ["p-mariana"], "2026-11-13"),
      fase: "parada" as const,
      voltaAs: somarMinutos(horaDeAgora(), 20),
    };
    render(<ViagemEmCurso v={v} passageiros={[]} destino={comCafe} />);
    expect(screen.getByText(/Parada do café · Posto Tocuman/)).toBeTruthy();
    expect(screen.getByText("20 min")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Retomar viagem/ })).toBeTruthy();
  });

  it("passageiro: 'Volte para a van até as …'; tempo acabado avisa", () => {
    render(
      <RelogioDoCafe onde="Posto Tocuman" voltaAs={somarMinutos(horaDeAgora(), 10)} passageiro />,
    );
    expect(screen.getByText(/Volte para a van até as/)).toBeTruthy();
    render(<RelogioDoCafe voltaAs={somarMinutos(horaDeAgora(), -5)} passageiro />);
    expect(screen.getByText("Hora de voltar para a van!")).toBeTruthy();
  });
});
