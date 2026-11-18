import { consultaFinanceiraSimulada } from "./consulta-financeira-simulada";
import { describe, expect, it, vi } from "vitest";

// W7: charges, payments, cancellations, boardings, faltas and expenses with Supabase simulated.
const falso = vi.hoisted(() => {
  const banco: Record<string, Record<string, unknown>[]> = {
    cobrancas: [],
    embarques: [],
    faltas: [],
    gastos: [],
  };
  const chave: Record<string, (r: Record<string, unknown>) => string> = {
    cobrancas: (r) => String(r["id"]),
    gastos: (r) => String(r["id"]),
    embarques: (r) => `${r["matricula_id"]}|${r["data"]}`,
    faltas: (r) => `${r["matricula_id"]}|${r["data"]}`,
  };
  const erro = { atual: null as null | { code: string; message: string } };
  const from = (t: string) => ({
    select: () => consultaFinanceiraSimulada(banco[t]!),
    upsert: async (linhas: Record<string, unknown>[]) => {
      for (const l of linhas)
        if (!banco[t]!.some((x) => chave[t]!(x) === chave[t]!(l))) banco[t]!.push({ ...l });
      return { error: null };
    },
    insert: async (l: Record<string, unknown>) => {
      if (erro.atual) return { error: erro.atual };
      banco[t]!.push({ ...l });
      return { error: null };
    },
    update: (m: Record<string, unknown>) => ({
      eq: async (_c: string, id: string) => {
        const l = banco[t]!.find((x) => x["id"] === id)!;
        if (l["pagamento_data"] || l["cancelamento_data"])
          return {
            error: {
              code: "P0001",
              message: "Esta cobrança já foi paga ou cancelada e não muda mais.",
            },
          };
        Object.assign(l, m);
        return { error: null };
      },
    }),
    delete: () => ({
      eq: async (_c: string, id: string) => (
        (banco[t] = banco[t]!.filter((x) => x["id"] !== id)),
        { error: null }
      ),
    }),
  });
  return { banco, erro, cliente: { from } };
});

vi.mock("@/lib/supabase", () => ({
  USA_BANCO: { conta: true, destinos: true },
  supabase: () => falso.cliente,
  SUPABASE_URL: "",
  SUPABASE_CHAVE_PUBLICA: "",
}));

import {
  anotarGastoNoBanco,
  apagarGastoNoBanco,
  cancelarCobrancaNoBanco,
  carregarDinheiro,
  cobrancaDaLinha,
  linhaDaCobranca,
  marcarComoPagoNoBanco,
  sincronizarDinheiro,
} from "@/lib/banco/dinheiro";
import { comecarContaDeVerdade } from "@/lib/acesso";
import {
  garantirProximaCobranca,
  obterCobrancas,
  registrarEmbarque,
  registrarFalta,
} from "@/lib/cobrancas-store";
import { resumoDoMes } from "@/lib/cobrancas";
import { obterGastos } from "@/lib/gastos-store";
import { mudarSessao } from "@/lib/sessao";

const rosa = { id: "u-rosa", nome: "Rosa" };
const mensal = {
  id: "m1",
  vanzeiroId: "u-rosa",
  destinoId: "d1",
  nome: "Ana Lima",
  telefone: "43999990001",
  cidade: "Cambará",
  endereco: "Rua 1",
  plano: "mensal" as const,
  valor: 30000,
  vencimento: 20,
  descontaFaltas: true,
  valorFalta: 1500,
};
const porViagem = {
  ...mensal,
  id: "m2",
  nome: "Beto",
  plano: "viagem" as const,
  valor: 4500,
  vencimento: null,
  descontaFaltas: false,
  valorFalta: null,
};

describe("W7: dinheiro no banco (Supabase simulado)", () => {
  it("a cobrança vai e volta do banco do mesmo jeito", () => {
    comecarContaDeVerdade(rosa);
    garantirProximaCobranca(mensal);
    const c = obterCobrancas()[0]!;
    expect(cobrancaDaLinha(linhaDaCobranca(c))).toEqual(c);
  });

  it("o app cria as cobranças, embarques e faltas sozinho e eles vão para o banco", async () => {
    mudarSessao({ conta: { id: "u-rosa", email: "rosa@x.com", nome: "Rosa" } });
    registrarEmbarque(porViagem, "2026-11-13", "v1");
    registrarFalta(mensal, "2026-11-13", true, "2026-11-12 20:00");
    expect(await sincronizarDinheiro()).toBe(true);
    expect(falso.banco["cobrancas"]!.map((c) => c["matricula_id"]).sort()).toEqual(["m1", "m2"]);
    expect(falso.banco["embarques"]).toEqual([
      { matricula_id: "m2", data: "2026-11-13", viagem_id: "v1" },
    ]);
    expect(falso.banco["faltas"]).toEqual([
      {
        matricula_id: "m1",
        data: "2026-11-13",
        avisou_no_prazo: true,
        avisou_em: "2026-11-12 20:00",
      },
    ]);
    expect(falso.banco["cobrancas"]!.find((c) => c["matricula_id"] === "m1")!["faltas"]).toBe(1);
  });

  it("marcar como pago e cancelar: salvos no banco; uma cobrança nunca muda depois", async () => {
    const [mens, viag] = [
      obterCobrancas().find((c) => c.passageiroId === "m1")!,
      obterCobrancas().find((c) => c.passageiroId === "m2")!,
    ];
    expect(await marcarComoPagoNoBanco(viag.id, "pix")).toEqual({ ok: true });
    expect(falso.banco["cobrancas"]!.find((c) => c["id"] === viag.id)).toMatchObject({
      pagamento_forma: "pix",
      pagamento_data: "2026-11-13",
    });
    expect(await marcarComoPagoNoBanco(viag.id, "dinheiro")).toEqual({
      ok: false,
      motivo: "Esta cobrança já estava paga.",
    });
    expect(await cancelarCobrancaNoBanco(mens.id, " ")).toEqual({
      ok: false,
      motivo: "Escreva o motivo do cancelamento.",
    });
    expect(await cancelarCobrancaNoBanco(mens.id, "mudou de cidade")).toEqual({ ok: true });
    expect(falso.banco["cobrancas"]!.find((c) => c["id"] === mens.id)).toMatchObject({
      cancelamento_motivo: "Mudou de cidade",
    });
  });

  it("outro celular (o passageiro) lê o que o vanzeiro salvou", async () => {
    comecarContaDeVerdade({ id: "u-ana", nome: "Ana" });
    mudarSessao({ conta: { id: "u-ana", email: "ana@x.com", nome: "Ana" } });
    expect(obterCobrancas()).toEqual([]);
    await carregarDinheiro();
    expect(obterCobrancas().find((c) => c.passageiroId === "m2")?.pagamento).toEqual({
      data: "2026-11-13",
      forma: "pix",
    });
    // The passenger's phone never writes money.
    const antes = falso.banco["cobrancas"]!.length;
    garantirProximaCobranca({ ...mensal, id: "m9" });
    await sincronizarDinheiro();
    expect(falso.banco["cobrancas"]!.length).toBe(antes);
  });

  it("gastos: anotados e apagados no banco; erro do banco aparece e nada muda", async () => {
    comecarContaDeVerdade(rosa);
    mudarSessao({
      conta: { id: "u-rosa", email: "rosa@x.com", nome: "Rosa" },
      vanzeiroId: "u-rosa",
    });
    expect(
      await anotarGastoNoBanco({
        tipo: "outros",
        descricao: "lavar a van",
        valor: 3000,
        data: "2026-11-13",
      }),
    ).toEqual({ ok: true });
    expect(falso.banco["gastos"]![0]).toMatchObject({
      vanzeiro_id: "u-rosa",
      descricao: "Lavar a van",
      valor: 3000,
    });
    expect(obterGastos().map((g) => g.id)).toEqual([falso.banco["gastos"]![0]!["id"]]);
    expect(
      await anotarGastoNoBanco({
        tipo: "combustivel",
        descricao: "",
        valor: 100,
        data: "2026-12-01",
      }),
    ).toMatchObject({ ok: false });
    falso.erro.atual = { code: "P0001", message: "O dia do gasto não pode ser depois de hoje." };
    expect(
      await anotarGastoNoBanco({ tipo: "pedagio", descricao: "", valor: 900, data: "2026-11-13" }),
    ).toEqual({ ok: false, motivo: "O dia do gasto não pode ser depois de hoje." });
    falso.erro.atual = null;
    expect(obterGastos()).toHaveLength(1);
    expect(await apagarGastoNoBanco(obterGastos()[0]!.id)).toEqual({ ok: true });
    expect(falso.banco["gastos"]).toEqual([]);
    expect(obterGastos()).toEqual([]);
  });
  it("reabre o financeiro com todas as 1.005 cobranças diárias de R$ 30", async () => {
    const exemplo = falso.banco["cobrancas"]![0]!;
    falso.banco["cobrancas"] = Array.from({ length: 1005 }, (_, i) => ({
      ...exemplo, id: `volume-${i}`, tipo: "diario", valor_base: 3000, faltas: 0,
      vencimento: "2026-11-13", pagamento_data: null, cancelamento_data: null,
    }));
    for (let abertura = 0; abertura < 2; abertura++) {
      comecarContaDeVerdade({ id: "leitor-volume", nome: "Teste" });
      mudarSessao({ conta: { id: "leitor-volume", email: "teste@example.invalid", nome: "Teste" } });
      expect(await carregarDinheiro()).toBe(true);
      expect(obterCobrancas()).toHaveLength(1005);
      expect(resumoDoMes(obterCobrancas(), "2026-11-13").aReceber).toBe(3015000);
    }
  });

});
