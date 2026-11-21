import { fireEvent, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { ExcluirMinhaConta } from "@/components/app/ExcluirMinhaConta";
import { obterAcertos } from "@/lib/acertos-store";
import { informarAcertoNoBanco } from "@/lib/banco/acertos";
import type { Cobranca } from "@/lib/cobrancas";
import { obterCobrancas } from "@/lib/cobrancas-store";
import {
  aReceberAntesDeExcluir,
  excluirMinhaConta,
  MOTIVO_DESTINO_EXCLUIDO,
} from "@/lib/exclusoes";
import type { Gasto } from "@/lib/gastos";
import { relatorioDoVanzeiro } from "@/lib/relatorio";
import { idDoVanzeiro } from "@/lib/sessao";

const sql = readFileSync(
  "supabase/migrations/20261121120000_correcao5_exclusao_de_contas.sql",
  "utf8",
);

describe("Correção 5 (revisada): excluir a conta não apaga histórico nem perdoa dívida sozinha", () => {
  it("antes de excluir, o vanzeiro vê quanto tem a receber e o diálogo oferece o relatório", () => {
    const r = aReceberAntesDeExcluir();
    expect(r.valor).toBeGreaterThan(0);
    render(<ExcluirMinhaConta papel="vanzeiro" numDestinos={2} />);
    fireEvent.click(screen.getByRole("button", { name: /Excluir minha conta/ }));
    expect(screen.getByText(/a receber de/)).toBeTruthy();
    expect(screen.getByRole("button", { name: /Baixar meu relatório/ })).toBeTruthy();
    expect(screen.queryByText(/O que ainda está em aberto é cancelado/)).toBeNull();
  });

  it("vanzeiro exclui: nenhuma cobrança some; pagas ficam; em aberto só cancela período futuro (Correção 2)", () => {
    const meu = () => obterCobrancas().filter((c) => c.vanzeiroId === idDoVanzeiro());
    const antes = meu();
    expect(excluirMinhaConta("vanzeiro").ok).toBe(true);
    const depois = meu();
    expect(depois.map((c) => c.id).sort()).toEqual(antes.map((c) => c.id).sort());
    for (const c of depois) {
      const era = antes.find((x) => x.id === c.id)!;
      if (era.pagamento || era.cancelamento) expect(c).toEqual(era);
      if (c.cancelamento && !era.cancelamento)
        expect(c.cancelamento.motivo).toBe(MOTIVO_DESTINO_EXCLUIDO);
    }
    expect(depois.some((c) => !c.pagamento && !c.cancelamento)).toBe(true);
  });

  it("acerto informado é declaração do passageiro: a cobrança não muda", async () => {
    const c = obterCobrancas().find((x) => !x.pagamento && !x.cancelamento)!;
    const antes = JSON.stringify(c);
    expect((await informarAcertoNoBanco(c.id)).ok).toBe(true);
    expect(obterAcertos()[c.id]).toBeTruthy();
    expect(JSON.stringify(obterCobrancas().find((x) => x.id === c.id))).toBe(antes);
  });

  it("relatório: recebidos, em aberto, cancelados e gastos, em planilha", () => {
    const base = {
      vanzeiroId: "v",
      passageiroId: "p",
      destinoId: "d",
      nome: "Ana; Souza",
      telefone: "",
      tipo: "viagem",
      faltas: 0,
      valorFalta: 0,
    } as const;
    const cobrancas = [
      {
        ...base,
        id: "1",
        referencia: "Viagem de 10/11",
        vencimento: "2026-11-17",
        valorBase: 15000,
        pagamento: { data: "2026-11-11", forma: "pix" },
      },
      {
        ...base,
        id: "2",
        referencia: "Viagem de 12/11",
        vencimento: "2026-11-19",
        valorBase: 15000,
      },
      {
        ...base,
        id: "3",
        referencia: "Mensal",
        vencimento: "2026-12-10",
        valorBase: 30000,
        cancelamento: { data: "2026-11-20", motivo: "Destino excluído" },
      },
      {
        ...base,
        id: "4",
        vanzeiroId: "outro",
        referencia: "De outro",
        vencimento: "2026-11-19",
        valorBase: 999,
      },
    ] as unknown as Cobranca[];
    const gastos = [
      {
        id: "g",
        vanzeiroId: "v",
        tipo: "combustivel",
        descricao: "",
        valor: 20000,
        data: "2026-11-15",
      },
    ] as Gasto[];
    const csv = relatorioDoVanzeiro(cobrancas, gastos, "v").split("\r\n");
    expect(csv[0]).toBe("Tipo;Data;Descrição;Passageiro;Valor (R$);Situação");
    expect(csv).toContain('Recebido;2026-11-11;Viagem de 10/11;"Ana; Souza";150,00;Pago (Pix)');
    expect(csv).toContain('A receber;2026-11-19;Viagem de 12/11;"Ana; Souza";150,00;Em aberto');
    expect(csv).toContain(
      'Cancelado;2026-11-20;Mensal;"Ana; Souza";300,00;Cancelado: Destino excluído',
    );
    expect(csv).toContain("Gasto;2026-11-15;Combustível;;200,00;");
    expect(csv.join()).not.toContain("De outro");
  });

  it("banco: sem cascata, sem perdão automático, contato com fim de finalidade e prazo legal configurável", () => {
    expect(sql).toMatch(/drop constraint if exists contas_id_fkey;/);
    expect(sql).not.toMatch(/on delete cascade/i);
    expect(sql).not.toMatch(/Conta do vanzeiro excluída/);
    expect(sql).toMatch(/create table if not exists public\.acertos_informados/);
    expect(sql).toMatch(/function public\.encerrar_finalidade_dos_contatos/);
    expect(sql).toMatch(/regras_de_guarda/);
    expect(sql).toMatch(/Uma das suas viagens está acontecendo agora/);
  });
});
