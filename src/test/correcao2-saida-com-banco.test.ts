import { beforeEach, describe, expect, it, vi } from "vitest";

// CORREÇÃO 2 (20/11/2026): com o banco ligado, quem decide o que é cancelado na saída é o banco (só períodos que
// começam depois da saída). O celular não manda cancelamento nenhum: marca a saída e lê as cobranças de volta.
const falso = vi.hoisted(() => {
  const chamadas: string[] = [];
  const consulta = (tabela: string) => {
    const q: Record<string, unknown> = {};
    // A releitura falha: o celular fica com o que tem na memória (e a saída, que deu certo no banco, continua ok).
    const fim = () => ({ data: null, error: { message: "sem resposta" }, count: null });
    for (const m of ["select", "order", "limit", "gt", "eq", "is", "neq", "in"]) {
      q[m] = () => {
        if (m === "select") chamadas.push(`select ${tabela}`);
        return q;
      };
    }
    q["then"] = (ok: (r: unknown) => void) => ok(fim());
    return q;
  };
  const cliente = {
    rpc: async (nome: string) => {
      chamadas.push(`rpc ${nome}`);
      return { data: null, error: null };
    },
    from: (tabela: string) => ({
      ...consulta(tabela),
      update: () => ({
        eq: () => {
          chamadas.push(`update ${tabela}`);
          return Object.assign(Promise.resolve({ error: null }), {
            is: async () => ({ error: null }),
          });
        },
      }),
      upsert: async () => {
        chamadas.push(`upsert ${tabela}`);
        return { error: null };
      },
    }),
  };
  return { chamadas, cliente };
});
vi.mock("@/lib/supabase", () => ({
  USA_BANCO: { conta: true, destinos: true },
  supabase: () => falso.cliente,
  SUPABASE_URL: "",
  SUPABASE_CHAVE_PUBLICA: "",
}));

import { removerPassageiroNoBanco, sairDoDestinoNoBanco } from "@/lib/banco/passageiros";
import { excluirDestinoNoBanco } from "@/lib/banco/destinos";
import { obterCobrancas } from "@/lib/cobrancas-store";
import { mudarSessao } from "@/lib/sessao";

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));
const canceladasPelaSaida = () =>
  obterCobrancas().filter((c) =>
    ["Saiu do destino", "Removido do destino", "Destino excluído"].includes(
      c.cancelamento?.motivo ?? "",
    ),
  );

beforeEach(() => {
  falso.chamadas.length = 0;
  mudarSessao({ conta: { id: "vanzeiro-carlos", email: "", nome: "Carlos" }, papel: "vanzeiro" });
});

describe("Correção 2: com o banco, a saída não cancela cobranças no celular", () => {
  it("vanzeiro remove um passageiro: marca a saída, não manda cancelamento e relê as cobranças", async () => {
    expect((await removerPassageiroNoBanco("p-pedro")).ok).toBe(true);
    await esperar(600); // o envio automático do dinheiro acontece ~400 ms depois de uma mudança
    expect(falso.chamadas).toContain("update matriculas");
    expect(falso.chamadas).not.toContain("update cobrancas");
    expect(falso.chamadas.indexOf("select cobrancas")).toBeGreaterThan(
      falso.chamadas.indexOf("update matriculas"),
    );
    expect(canceladasPelaSaida()).toEqual([]);
  });

  it("passageiro sai do destino: só a função do banco e a releitura", async () => {
    expect((await sairDoDestinoNoBanco("p-juliana")).ok).toBe(true);
    await esperar(600);
    expect(falso.chamadas).toContain("rpc sair_do_destino");
    expect(falso.chamadas).not.toContain("update cobrancas");
    expect(falso.chamadas).toContain("select cobrancas");
    expect(canceladasPelaSaida()).toEqual([]);
  });

  it("vanzeiro exclui um destino: nenhuma cobrança cancelada pelo celular", async () => {
    expect((await excluirDestinoNoBanco("jacarezinho-londrina")).ok).toBe(true);
    await esperar(600);
    expect(falso.chamadas).toContain("update destinos");
    expect(falso.chamadas).not.toContain("update cobrancas");
    expect(canceladasPelaSaida()).toEqual([]);
  });
});
