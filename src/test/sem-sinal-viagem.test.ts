import { consultaFinanceiraSimulada } from "./consulta-financeira-simulada";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Without signal inside the van: the taps wait on the phone and go to the database when the signal comes back.
const falso = vi.hoisted(() => {
  const estado = {
    viagens: [] as Record<string, unknown>[],
    semSinal: true,
    statusRecusa: 0,
    tentativas: 0,
    falharCobranca: false,
    dinheiro: {} as Record<string, Record<string, unknown>[]>,
  };
  const falha = { error: { message: "TypeError: Failed to fetch" } };
  const cliente = {
    rpc: async () => ({ data: null, error: null }),
    from: (tabela: string) => {
      if (tabela !== "viagens") {
        return {
          select: () => consultaFinanceiraSimulada(estado.dinheiro[tabela] ?? []),
          upsert: async (linhas: Record<string, unknown>[]) => {
            if (tabela === "cobrancas" && estado.falharCobranca) return falha;
            const guardadas = (estado.dinheiro[tabela] ??= []);
            for (const linha of linhas) {
              if (!guardadas.some((r) => JSON.stringify(r) === JSON.stringify(linha))) {
                guardadas.push(linha);
              }
            }
            return { error: null };
          },
        };
      }
      return {
        select: () => ({
          eq: async () => (estado.semSinal ? falha : { data: estado.viagens, error: null }),
          lt: () => ({
            eq: () => ({ order: () => ({ limit: async () => ({ data: [], error: null }) }) }),
          }),
        }),
        insert: async (linha: Record<string, unknown>) =>
          estado.semSinal ? falha : (estado.viagens.push(linha), { error: null }),
        update: () => ({ eq: async () => (estado.semSinal ? falha : { error: null }) }),
        upsert: async (linha: Record<string, unknown>) => {
          estado.tentativas++;
          if (estado.semSinal) return falha;
          if (estado.statusRecusa) {
            return { error: { message: "Envio recusado" }, status: estado.statusRecusa };
          }
          estado.viagens = [...estado.viagens.filter((v) => v["id"] !== linha["id"]), linha];
          return { error: null };
        },
      };
    },
  };
  return { estado, cliente };
});
vi.mock("@/lib/supabase", () => ({
  USA_BANCO: { conta: true, destinos: true },
  supabase: () => falso.cliente,
  SUPABASE_URL: "",
  SUPABASE_CHAVE_PUBLICA: "",
}));

import { destinosExemplo } from "@/data/exemplo";
import { enviarPendentes, envioRecusado, viagensPendentes } from "@/lib/banco/fila";
import {
  carregarViagens,
  comecarViagemNoBanco,
  marcarEmbarcouNoBanco,
  marcarNaoEstavaNoBanco,
} from "@/lib/banco/viagem";
import { limparCobrancas } from "@/lib/cobrancas-store";
import { carregarRespostasDoBanco } from "@/lib/respostas-store";
import { mudarSessao } from "@/lib/sessao";
import { emAndamento, limparViagens, obterViagensDoDia } from "@/lib/viagem-store";

const destino = destinosExemplo.find((d) => d.id === "centro-unisul")!;

const contaA = { id: destino.vanzeiroId, email: "", nome: "Conta A" };
const contaB = { id: "conta-b", email: "", nome: "Conta B" };

beforeEach(() => {
  localStorage.clear();
  limparViagens();
  limparCobrancas();
  mudarSessao({ conta: contaA });
  Object.assign(falso.estado, {
    viagens: [],
    semSinal: true,
    statusRecusa: 0,
    tentativas: 0,
    dinheiro: {},
    falharCobranca: false,
  });
});

async function marcarOffline() {
  expect(await comecarViagemNoBanco(destino, ["p-gabriel", "p-fernanda"])).toEqual({ ok: true });
  expect(await marcarEmbarcouNoBanco("p-gabriel")).toEqual({ ok: true });
  expect(await marcarNaoEstavaNoBanco("p-fernanda")).toEqual({ ok: true });
}

describe("Sem sinal: a viagem continua e vai para o banco quando o sinal volta", () => {
  it("sem sinal, iniciar e marcar funcionam na tela e ficam guardados no celular", async () => {
    await marcarOffline();
    expect(emAndamento(obterViagensDoDia())?.embarcaram).toEqual(["p-gabriel"]);
    expect(falso.estado.viagens).toEqual([]);
    // Only the newest state of the trip waits (it has every tap), and it survives closing the app.
    expect(viagensPendentes()).toHaveLength(1);
    expect(
      JSON.parse(localStorage.getItem("vanzeiro-viagens-sem-sinal")!)["centro-unisul_2026-11-13"]
        .estado.naoEstavam,
    ).toEqual(["p-fernanda"]);
  });

  it("conserva o embarque até o servidor aceitar o envio", async () => {
    await marcarOffline();
    await enviarPendentes();
    expect(viagensPendentes()).toHaveLength(1);

    falso.estado.semSinal = false;
    falso.estado.statusRecusa = 503;
    await enviarPendentes();
    expect(viagensPendentes()).toHaveLength(1);
    expect(falso.estado.viagens).toEqual([]);
    expect(envioRecusado("centro-unisul_2026-11-13")).toBe(false);

    falso.estado.statusRecusa = 403;
    await enviarPendentes();
    expect(viagensPendentes()).toHaveLength(1);
    expect(envioRecusado("centro-unisul_2026-11-13")).toBe(true);
    const tentativas = falso.estado.tentativas;
    falso.estado.statusRecusa = 0;
    await enviarPendentes();
    expect(falso.estado.tentativas).toBe(tentativas);

    await enviarPendentes("centro-unisul_2026-11-13");
    await enviarPendentes();
    expect(falso.estado.viagens).toHaveLength(1);
    expect(falso.estado.viagens[0]).not.toHaveProperty("recusada");
    expect(falso.estado.viagens[0]).toMatchObject({
      id: "centro-unisul_2026-11-13",
      fase: "busca",
    });
    expect((falso.estado.viagens[0]!["estado"] as { embarcaram: string[] }).embarcaram).toEqual([
      "p-gabriel",
    ]);
    expect(viagensPendentes()).toEqual([]);
  });

  it("recupera as marcações da conta ao abrir a viagem ainda sem rede", async () => {
    await marcarOffline();
    limparViagens();
    await carregarViagens();
    expect(emAndamento(obterViagensDoDia())).toMatchObject({
      embarcaram: ["p-gabriel"],
      naoEstavam: ["p-fernanda"],
    });
  });

  it("não carrega nem envia a pendência da outra conta", async () => {
    await marcarOffline();
    limparViagens();
    await enviarPendentes();
    const tentativas = falso.estado.tentativas;
    mudarSessao({ conta: contaB });
    falso.estado.semSinal = false;
    await carregarViagens();
    await enviarPendentes("centro-unisul_2026-11-13");
    expect(emAndamento(obterViagensDoDia())).toBeUndefined();
    expect(viagensPendentes()).toEqual([]);
    expect(falso.estado.tentativas).toBe(tentativas);

    mudarSessao({ conta: contaA });
    await carregarViagens();
    expect(emAndamento(obterViagensDoDia())?.embarcaram).toEqual(["p-gabriel"]);
    expect(viagensPendentes()).toEqual([]);
  });

  it("reconcilia embarque, falta no prazo e cobranças após reabrir, sem duplicar", async () => {
    const data = "2026-11-13";
    carregarRespostasDoBanco({
      respostas: { [data]: { "p-fernanda": "nao-vai" } },
      momentos: {},
      fixas: { vouSempre: [], naoVou: [] },
    });
    expect(await comecarViagemNoBanco(destino, ["p-camila", "p-gabriel"])).toEqual({ ok: true });
    expect(await marcarEmbarcouNoBanco("p-camila")).toEqual({ ok: true });
    expect(await marcarNaoEstavaNoBanco("p-gabriel")).toEqual({ ok: true });

    limparViagens();
    limparCobrancas();
    await carregarViagens();
    expect(emAndamento(obterViagensDoDia())).toMatchObject({
      embarcaram: ["p-camila"],
      naoEstavam: ["p-gabriel"],
    });

    falso.estado.semSinal = false;
    falso.estado.falharCobranca = true;
    await enviarPendentes();
    expect(viagensPendentes()).toHaveLength(1);
    expect(falso.estado.dinheiro["embarques"]).toHaveLength(1);
    expect(falso.estado.dinheiro["faltas"]).toHaveLength(1);
    const tentativas = falso.estado.tentativas;

    falso.estado.falharCobranca = false;
    await enviarPendentes();
    await enviarPendentes();
    expect(viagensPendentes()).toEqual([]);
    expect(falso.estado.tentativas).toBe(tentativas);
    expect(falso.estado.viagens).toHaveLength(1);
    expect(falso.estado.dinheiro["embarques"]).toEqual([
      { matricula_id: "p-camila", data, viagem_id: "centro-unisul_2026-11-13" },
    ]);
    expect(falso.estado.dinheiro["faltas"]).toEqual([
      { matricula_id: "p-fernanda", data, avisou_no_prazo: true, avisou_em: null },
    ]);
    expect(falso.estado.dinheiro["cobrancas"]).toEqual([
      expect.objectContaining({ matricula_id: "p-camila", tipo: "viagem", valor_base: 1200 }),
      expect.objectContaining({
        matricula_id: "p-fernanda",
        tipo: "quinzenal",
        faltas: 1,
        valor_falta: 1000,
      }),
    ]);
  });

  it("avisa quando falta espaço e mantém a última marcação salva", async () => {
    expect(await comecarViagemNoBanco(destino, ["p-gabriel"])).toEqual({ ok: true });
    const anterior = viagensPendentes();
    const gravar = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Sem espaço", "QuotaExceededError");
    });
    try {
      const resultado = await marcarEmbarcouNoBanco("p-gabriel");
      expect(resultado).toMatchObject({ ok: false, motivo: expect.stringContaining("aparelho") });
      expect(emAndamento(obterViagensDoDia())?.embarcaram).toEqual([]);
      expect(viagensPendentes()).toEqual(anterior);

      limparViagens();
      const inicio = await comecarViagemNoBanco({ ...destino, id: "outra-viagem" }, ["p-gabriel"]);
      expect(inicio).toMatchObject({ ok: false, motivo: expect.stringContaining("aparelho") });
      expect(emAndamento(obterViagensDoDia())).toBeUndefined();
    } finally {
      gravar.mockRestore();
    }
  });
});
