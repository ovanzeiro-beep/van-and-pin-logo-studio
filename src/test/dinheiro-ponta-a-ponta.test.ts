import { describe, expect, it, vi } from "vitest";

// Varredura do dinheiro, ponta a ponta, com um banco simulado dividido entre o celular do vanzeiro e o do passageiro:
// passageiro novo → cobrança; viagem → embarque → cobrança; pago e cancelado; o passageiro lê tudo; gastos.
const falso = vi.hoisted(() => {
  const banco: Record<string, Record<string, unknown>[]> = {
    cobrancas: [],
    embarques: [],
    faltas: [],
    gastos: [],
    viagens: [],
    matriculas: [],
  };
  const chave = (t: string, r: Record<string, unknown>) =>
    t === "embarques" || t === "faltas" ? `${r["matricula_id"]}|${r["data"]}` : String(r["id"]);
  const from = (t: string) => ({
    select: () => ({
      then: (ok: (r: unknown) => void) =>
        ok({ data: banco[t]!.map((x) => ({ ...x })), error: null }),
    }),
    insert: async (l: Record<string, unknown>) => (banco[t]!.push({ ...l }), { error: null }),
    upsert: async (ls: Record<string, unknown>[] | Record<string, unknown>) => {
      for (const l of Array.isArray(ls) ? ls : [ls])
        if (!banco[t]!.some((x) => chave(t, x) === chave(t, l))) banco[t]!.push({ ...l });
      return { error: null };
    },
    update: (m: Record<string, unknown>) => ({
      eq: async (_c: string, id: string) => {
        const l = banco[t]!.find((x) => x["id"] === id);
        if (t === "cobrancas" && l && (l["pagamento_data"] || l["cancelamento_data"]))
          return {
            error: {
              code: "P0001",
              message: "Esta cobrança já foi paga ou cancelada e não muda mais.",
            },
          };
        if (l) Object.assign(l, m);
        return { error: null };
      },
    }),
    delete: () => ({ eq: async () => ({ error: null }) }),
  });
  return { banco, cliente: { from, rpc: async () => ({ data: null, error: null }) } };
});
vi.mock("@/lib/supabase", () => ({
  USA_BANCO: { conta: true, destinos: true },
  supabase: () => falso.cliente,
  SUPABASE_URL: "",
  SUPABASE_CHAVE_PUBLICA: "",
}));

import { destinosExemplo } from "@/data/exemplo";
import {
  cancelarCobrancaNoBanco,
  carregarDinheiro,
  marcarComoPagoNoBanco,
  sincronizarDinheiro,
} from "@/lib/banco/dinheiro";
import { salvarPassageiroNoBanco } from "@/lib/banco/passageiros";
import { comecarViagemNoBanco, marcarEmbarcouNoBanco } from "@/lib/banco/viagem";
import { comecarContaDeVerdade } from "@/lib/acesso";
import { situacao, totalDevido } from "@/lib/cobrancas";
import { obterCobrancas } from "@/lib/cobrancas-store";
import { mudarSessao } from "@/lib/sessao";

const linha = (matricula: string) =>
  falso.banco["cobrancas"]!.filter((c) => c["matricula_id"] === matricula);

describe("Dinheiro de ponta a ponta (vanzeiro e passageiro)", () => {
  it("vanzeiro: passageiro Mensal novo já ganha a cobrança do mês, que vai para o banco", async () => {
    mudarSessao({ conta: { id: "vanzeiro-carlos", email: "carlos@x.com", nome: "Carlos" } });
    const novo = {
      id: "p-novo",
      vanzeiroId: "vanzeiro-carlos",
      destinoId: "centro-unisul",
      nome: "Bia Souza",
      telefone: "43999990111",
      cidade: "Cambará",
      endereco: "Rua 1",
      plano: "mensal" as const,
      valor: 25000,
      vencimento: 25,
      descontaFaltas: false,
      valorFalta: null,
    };
    expect(await salvarPassageiroNoBanco(novo)).toEqual({ ok: true });
    await sincronizarDinheiro();
    expect(linha("p-novo")).toEqual([
      expect.objectContaining({
        id: "p-novo_2026-11-25",
        referencia: "Mensalidade de novembro",
        valor_base: 25000,
      }),
    ]);
  });

  it("vanzeiro: na viagem, 'Embarcou' de quem é Diário cria a cobrança do dia, que vai para o banco", async () => {
    const destino = destinosExemplo.find((d) => d.id === "centro-unisul")!;
    expect(await comecarViagemNoBanco(destino, ["p-rafael", "p-camila"])).toEqual({ ok: true });
    expect(await marcarEmbarcouNoBanco("p-rafael")).toEqual({ ok: true });
    await sincronizarDinheiro();
    expect(falso.banco["embarques"]).toContainEqual(
      expect.objectContaining({ matricula_id: "p-rafael", data: "2026-11-13" }),
    );
    expect(linha("p-rafael").find((c) => c["id"] === "p-rafael_2026-11-13")).toMatchObject({
      tipo: "diario",
      valor_base: 2200,
      referencia: "Diária de 13/11",
    });
  });

  it("vanzeiro: marcar como pago (Pix) e cancelar com motivo ficam no banco; uma cobrança paga não muda mais", async () => {
    expect(await marcarComoPagoNoBanco("p-rafael_2026-11-13", "pix")).toEqual({ ok: true });
    expect(linha("p-rafael").find((c) => c["id"] === "p-rafael_2026-11-13")).toMatchObject({
      pagamento_forma: "pix",
    });
    expect(await cancelarCobrancaNoBanco("p-rafael_2026-11-13", "erro")).toEqual({
      ok: false,
      motivo: "Esta cobrança já estava paga.",
    });
    expect(await cancelarCobrancaNoBanco("p-novo_2026-11-25", "desistiu")).toEqual({ ok: true });
    expect(linha("p-novo")[0]).toMatchObject({ cancelamento_motivo: "Desistiu" });
  });

  it("passageiro: o celular dele lê as cobranças, o pago e o cancelado; o total devido é a soma das não pagas", async () => {
    comecarContaDeVerdade({ id: "u-rafael", nome: "Rafael" });
    mudarSessao({ conta: { id: "u-rafael", email: "rafael@x.com", nome: "Rafael" } });
    expect(obterCobrancas()).toEqual([]);
    await carregarDinheiro();
    const doRafael = obterCobrancas().filter((c) => c.passageiroId === "p-rafael");
    expect(doRafael.find((c) => c.id === "p-rafael_2026-11-13")?.pagamento).toEqual({
      data: "2026-11-13",
      forma: "pix",
    });
    expect(
      situacao(
        obterCobrancas().find((c) => c.id === "p-novo_2026-11-25")!,
        "2026-11-13",
      ),
    ).toBe("cancelada");
    expect(totalDevido(obterCobrancas(), "p-rafael")).toBe(
      doRafael.filter((c) => !c.pagamento && !c.cancelamento).reduce((s, c) => s + c.valorBase, 0),
    );
  });
});
