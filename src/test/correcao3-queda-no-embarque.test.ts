import { consultaFinanceiraSimulada } from "./consulta-financeira-simulada";
import { beforeEach, describe, expect, it, vi } from "vitest";

// CORREÇÃO 3 (20/11/2026): cenários da Fase 4 com o banco novo. O simulador faz o que o gatilho
// viagem_registra_embarques faz: a viagem gravada cria embarque e cobrança (mesma regra do app, provada igual à do
// banco no teste C3.1 de scripts/auditoria-laboratorio.py).
const falso = vi.hoisted(() => {
  const estado = {
    viagens: [] as Record<string, unknown>[],
    semSinal: true,
    statusRecusa: 0,
    tentativas: 0,
    falharCobranca: false,
    dinheiro: {} as Record<string, Record<string, unknown>[]>,
    gatilho: null as null | ((viagem: Record<string, unknown>) => void),
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
        insert: async (linha: Record<string, unknown>) => {
          if (estado.semSinal) return falha;
          estado.viagens.push(linha);
          estado.gatilho?.(linha);
          return { error: null };
        },
        update: (mudanca: Record<string, unknown>) => ({
          eq: async (_c: string, id: string) => {
            if (estado.semSinal) return falha;
            estado.viagens = estado.viagens.map((v) => (v["id"] === id ? { ...v, ...mudanca } : v));
            const v = estado.viagens.find((x) => x["id"] === id);
            if (v) estado.gatilho?.(v);
            return { error: null };
          },
        }),
        upsert: async (linha: Record<string, unknown>) => {
          estado.tentativas++;
          if (estado.semSinal) return falha;
          if (estado.statusRecusa) {
            return { error: { message: "Envio recusado" }, status: estado.statusRecusa };
          }
          estado.viagens = [...estado.viagens.filter((v) => v["id"] !== linha["id"]), linha];
          estado.gatilho?.(linha);
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
    gatilho: gatilhoDoBanco,
  });
});

async function marcarOffline() {
  expect(await comecarViagemNoBanco(destino, ["p-gabriel", "p-fernanda"])).toEqual({ ok: true });
  expect(await marcarEmbarcouNoBanco("p-gabriel")).toEqual({ ok: true });
  expect(await marcarNaoEstavaNoBanco("p-fernanda")).toEqual({ ok: true });
}

import { carregarDinheiro, linhaDaCobranca } from "@/lib/banco/dinheiro";
import { aplicarEmbarque } from "@/lib/cobrancas";
import { obterCobrancas } from "@/lib/cobrancas-store";
import { obterMatriculas } from "@/lib/passageiros-store";

function gatilhoDoBanco(viagem: Record<string, unknown>) {
  const v = viagem["estado"] as { embarcaram?: string[] } | undefined;
  const data = viagem["data"] as string;
  const id = viagem["id"] as string;
  for (const mid of v?.embarcaram ?? []) {
    const p = obterMatriculas().find((x) => x.id === mid);
    if (!p) continue;
    const embarques = (falso.estado.dinheiro["embarques"] ??= []);
    if (!embarques.some((e) => e["matricula_id"] === mid && e["data"] === data))
      embarques.push({ matricula_id: mid, data, viagem_id: id });
    const [c] = aplicarEmbarque([], p, data, data, id);
    const cobrancas = (falso.estado.dinheiro["cobrancas"] ??= []);
    if (c && !cobrancas.some((x) => x["id"] === c.id)) cobrancas.push(linhaDaCobranca(c));
  }
}

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));
const daCamila = (lista: { matricula_id?: unknown; passageiroId?: string }[]) =>
  lista.filter((c) => c.matricula_id === "p-camila" || c.passageiroId === "p-camila");

async function reabrirOApp() {
  limparViagens();
  limparCobrancas();
  await carregarViagens();
  await enviarPendentes();
  await carregarDinheiro();
  await esperar(600);
}

describe("Correção 3: embarque e cobrança não se perdem quando a internet cai", () => {
  it("A: a cobrança do app falha no envio e o app é fechado — o banco já tinha criado a cobrança", async () => {
    falso.estado.semSinal = false;
    expect(await comecarViagemNoBanco(destino, ["p-camila"])).toEqual({ ok: true });
    falso.estado.falharCobranca = true;
    expect(await marcarEmbarcouNoBanco("p-camila")).toEqual({ ok: true });
    await esperar(600);
    falso.estado.falharCobranca = false;
    await reabrirOApp();
    expect(daCamila(falso.estado.dinheiro["embarques"] ?? [])).toHaveLength(1);
    expect(daCamila(falso.estado.dinheiro["cobrancas"] ?? [])).toHaveLength(1);
    expect(daCamila(obterCobrancas())).toEqual([
      expect.objectContaining({ tipo: "viagem", valorBase: 1200, cancelamento: null }),
    ]);
  });

  it("B: o app é fechado antes do envio automático (menos de 400 ms)", async () => {
    falso.estado.semSinal = false;
    expect(await comecarViagemNoBanco(destino, ["p-camila"])).toEqual({ ok: true });
    expect(await marcarEmbarcouNoBanco("p-camila")).toEqual({ ok: true });
    limparViagens();
    limparCobrancas();
    await reabrirOApp();
    expect(daCamila(falso.estado.dinheiro["embarques"] ?? [])).toHaveLength(1);
    expect(daCamila(falso.estado.dinheiro["cobrancas"] ?? [])).toHaveLength(1);
    expect(daCamila(obterCobrancas())).toHaveLength(1);
  });

  it("C: sem sinal, fecha e abre ainda sem sinal, e só depois o sinal volta — uma cobrança, sem duplicar", async () => {
    expect(await comecarViagemNoBanco(destino, ["p-camila"])).toEqual({ ok: true });
    expect(await marcarEmbarcouNoBanco("p-camila")).toEqual({ ok: true });
    limparViagens();
    limparCobrancas();
    await carregarViagens();
    expect(emAndamento(obterViagensDoDia())?.embarcaram).toEqual(["p-camila"]);
    falso.estado.semSinal = false;
    await reabrirOApp();
    await enviarPendentes();
    expect(viagensPendentes()).toEqual([]);
    expect(daCamila(falso.estado.dinheiro["embarques"] ?? [])).toHaveLength(1);
    expect(daCamila(falso.estado.dinheiro["cobrancas"] ?? [])).toHaveLength(1);
    expect(daCamila(obterCobrancas())).toHaveLength(1);
  });

  it("D: toques e reenvios repetidos com sinal oscilando — uma cobrança só", async () => {
    falso.estado.semSinal = false;
    expect(await comecarViagemNoBanco(destino, ["p-camila", "p-gabriel"])).toEqual({ ok: true });
    expect(await marcarEmbarcouNoBanco("p-camila")).toEqual({ ok: true });
    expect(await marcarEmbarcouNoBanco("p-camila")).toEqual({ ok: true });
    falso.estado.semSinal = true;
    expect(await marcarNaoEstavaNoBanco("p-gabriel")).toEqual({ ok: true });
    falso.estado.semSinal = false;
    await enviarPendentes();
    await enviarPendentes();
    await reabrirOApp();
    expect(daCamila(falso.estado.dinheiro["cobrancas"] ?? [])).toHaveLength(1);
    expect(daCamila(obterCobrancas())).toHaveLength(1);
  });
});
