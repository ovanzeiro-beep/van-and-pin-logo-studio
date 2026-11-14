import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ViagemEmCurso } from "@/components/app/viagem/ViagemEmCurso";
import { destinosExemplo } from "@/data/exemplo";
import { iniciarViagem } from "@/lib/viagem";

const excursao = { ...destinosExemplo.find((d) => d.id === "excursao-beto-carrero")!, voltaData: "2026-11-29" };

describe("Chegou ao destino com volta em outro dia", () => {
  it("diz quando é a volta e mantém o botão Iniciar volta", () => {
    const v = { ...iniciarViagem(excursao, [], "2026-11-28"), fase: "chegada" as const };
    render(<ViagemEmCurso v={v} passageiros={[]} destino={excursao} />);
    expect(screen.getByText("Volta: 29/11, 19:00")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Iniciar volta/ })).toBeTruthy();
  });

  it("com a volta no mesmo dia, não mostra a linha", () => {
    const mesmoDia = { ...excursao, voltaData: null };
    const v = { ...iniciarViagem(mesmoDia, [], "2026-11-28"), fase: "chegada" as const };
    render(<ViagemEmCurso v={v} passageiros={[]} destino={mesmoDia} />);
    expect(screen.queryByText(/^Volta:/)).toBeNull();
  });
});
