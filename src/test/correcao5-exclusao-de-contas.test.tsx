import { render, screen, fireEvent } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { ExcluirMinhaConta } from "@/components/app/ExcluirMinhaConta";
import { obterCobrancas } from "@/lib/cobrancas-store";
import { excluirMinhaConta, MOTIVO_CONTA_DO_VANZEIRO } from "@/lib/exclusoes";
import { idDoVanzeiro } from "@/lib/sessao";

describe("Correção 5: excluir a conta não apaga o histórico de ninguém", () => {
  it("vanzeiro: nenhuma cobrança some; pagas ficam; o que estava em aberto é cancelado com motivo", () => {
    const meu = () => obterCobrancas().filter((c) => c.vanzeiroId === idDoVanzeiro());
    const antes = meu();
    const pagas = antes.filter((c) => c.pagamento).map((c) => c.id);
    expect(antes.length).toBeGreaterThan(0);
    expect(excluirMinhaConta("vanzeiro").ok).toBe(true);
    const depois = meu();
    expect(depois.map((c) => c.id).sort()).toEqual(antes.map((c) => c.id).sort());
    expect(
      depois.filter((c) => pagas.includes(c.id)).every((c) => c.pagamento && !c.cancelamento),
    ).toBe(true);
    expect(depois.every((c) => c.pagamento || c.cancelamento)).toBe(true);
    expect(depois.some((c) => c.cancelamento?.motivo === MOTIVO_CONTA_DO_VANZEIRO)).toBe(true);
  });

  it("a confirmação explica o que acontece, sem prometer o que mudou", () => {
    render(<ExcluirMinhaConta papel="vanzeiro" numDestinos={2} />);
    fireEvent.click(screen.getByRole("button", { name: /Excluir minha conta/ }));
    expect(
      screen.getByText(/O histórico de viagens e pagamentos fica para os passageiros/),
    ).toBeTruthy();
    expect(screen.queryByText(/Cobranças pendentes são canceladas/)).toBeNull();
  });

  it("o banco (Correção 5): login não apaga mais em cascata e a exceção do nome só vale na exclusão", () => {
    const sql = readFileSync(
      "supabase/migrations/20261121120000_correcao5_exclusao_de_contas.sql",
      "utf8",
    );
    expect(sql).toMatch(/drop constraint if exists contas_id_fkey;/);
    expect(sql).toMatch(/current_setting\('vanzeiro\.anonimizar', true\) = 'sim'/);
    expect(sql).not.toMatch(/on delete cascade/i);
    expect(sql).toMatch(/Uma das suas viagens está acontecendo agora/);
  });
});
