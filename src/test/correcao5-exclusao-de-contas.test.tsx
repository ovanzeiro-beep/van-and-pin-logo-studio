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
import { linhasDoRelatorio, relatorioDoVanzeiro } from "@/lib/relatorio";
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
      {
        ...base,
        id: "5",
        referencia: "Viagem de 24/11",
        vencimento: "2026-11-25",
        valorBase: 15000,
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
    gastos.push({
      id: "g2",
      vanzeiroId: "v",
      tipo: "outros",
      descricao: "Lavagem",
      valor: 3500,
      data: "2026-11-16",
    });
    gastos.push({
      id: "g3",
      vanzeiroId: "outro",
      tipo: "combustivel",
      descricao: "",
      valor: 777,
      data: "2026-11-16",
    });
    expect(linhasDoRelatorio(cobrancas, gastos, "v", "2026-11-21")).toEqual([
      [
        "Recebido",
        "2026-11-11",
        "Ana; Souza",
        15000,
        "Pago (Pix)",
        "Viagem de 10/11",
        "2026-11-17",
      ],
      ["A receber", "2026-11-19", "Ana; Souza", 15000, "Devendo", "Viagem de 12/11", "2026-11-19"],
      ["A receber", "2026-11-25", "Ana; Souza", 15000, "Pendente", "Viagem de 24/11", "2026-11-25"],
      [
        "Cancelado",
        "2026-11-20",
        "Ana; Souza",
        30000,
        "Cancelada: Destino excluído",
        "Mensal",
        "2026-12-10",
      ],
      ["Gasto", "2026-11-15", null, 20000, null, "Combustível", null],
      ["Gasto", "2026-11-16", null, 3500, null, "Outros: Lavagem", null],
    ]);
    // A real .xlsx (a zip): header, dates as Excel days, money as numbers, nothing from another vanzeiro.
    const xlsx = relatorioDoVanzeiro(cobrancas, gastos, "v", "2026-11-21");
    expect([...xlsx.slice(0, 4)]).toEqual([0x50, 0x4b, 0x03, 0x04]);
    const texto = new TextDecoder().decode(xlsx);
    expect(texto).toContain("xl/worksheets/sheet1.xml");
    expect(texto).toContain('<t xml:space="preserve">Situação</t>');
    expect(texto).toContain('<c r="B2" s="2"><v>46337</v></c>'); // 11/11/2026
    expect(texto).toContain('<c r="D2" s="3"><v>150.00</v></c>');
    expect(texto).not.toContain("De outro");
    expect(texto).not.toContain("7.77");
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

describe("Correção 5: acerto informado nas listas", () => {
  it("o item mostra o acerto, mas continua em aberto e o saldo não muda", async () => {
    const { render: r, screen: sc } = await import("@testing-library/react");
    const { CobrancaItem } = await import("@/components/app/CobrancaItem");
    const { RouterProvider, createRouter, createRootRoute, createMemoryHistory } =
      await import("@tanstack/react-router");
    const { resumoDoMes } = await import("@/lib/cobrancas");
    const { dataDeHoje } = await import("@/lib/agora");
    const c = obterCobrancas().find((x) => !x.pagamento && !x.cancelamento)!;
    const antes = resumoDoMes(obterCobrancas(), dataDeHoje());
    await informarAcertoNoBanco(c.id);
    const raiz = createRootRoute({ component: () => <CobrancaItem c={c} para="passageiro" /> });
    const router = createRouter({
      routeTree: raiz,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });
    r(<RouterProvider router={router} />);
    expect(await sc.findByText(/Acerto informado por você em/)).toBeTruthy();
    expect(sc.getByText(/continua em aberto/)).toBeTruthy();
    expect(resumoDoMes(obterCobrancas(), dataDeHoje())).toEqual(antes);
  });
});
