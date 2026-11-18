import { describe, expect, it, vi } from "vitest";

// W6: the trip in the database, with Supabase simulated.
const falso = vi.hoisted(() => {
  const estado = { viagens: [] as Record<string, unknown>[], erro: null as null | { code: string; message: string }, rpc: [] as unknown[] };
  const cliente = {
    rpc: async (nome: string, a: unknown) => (estado.rpc.push({ nome, a }), { data: null, error: null }),
    from: () => ({
      insert: async (linha: Record<string, unknown>) => {
        if (estado.viagens.some((v) => v["vanzeiro_id"] === linha["vanzeiro_id"] && v["fase"] !== "encerrada"))
          return { error: { code: "23505", message: 'duplicate key value violates unique constraint "viagens_uma_em_andamento"' } };
        estado.viagens.push(linha);
        return { error: null };
      },
      update: (mudanca: Record<string, unknown>) => ({
        eq: async (_c: string, id: unknown) => {
          const erro = estado.erro;
          estado.erro = null;
          if (erro) return { error: erro };
          estado.viagens.forEach((v) => v["id"] === id && Object.assign(v, mudanca));
          return { error: null };
        },
      }),
    }),
  };
  return { estado, cliente };
});
vi.mock("@/lib/supabase", () => ({ USA_BANCO: { conta: true, destinos: true }, supabase: () => falso.cliente, SUPABASE_URL: "", SUPABASE_CHAVE_PUBLICA: "" }));

import { destinosExemplo } from "@/data/exemplo";
import { comecarViagemNoBanco, encerradaDaLinha, marcarEmbarcouNoBanco, marcarNaoEstavaNoBanco, viagemDoPassageiro } from "@/lib/banco/viagem";
import { conferenciaDoPassageiro, historicoDoPassageiro, proximoDaBusca } from "@/lib/viagem";
import { emAndamento, obterViagensDoDia } from "@/lib/viagem-store";

const destino = destinosExemplo.find((d) => d.id === "centro-unisul")!;

describe("W6: viagem no banco (Supabase simulado)", () => {
  it("iniciar grava a viagem inteira no banco; uma segunda viagem ao mesmo tempo é recusada", async () => {
    expect(await comecarViagemNoBanco(destino, ["p-gabriel", "p-fernanda"])).toEqual({ ok: true });
    const linha = falso.estado.viagens[0]!;
    expect(linha).toMatchObject({ id: "centro-unisul_2026-11-13", destino_id: "centro-unisul", fase: "busca" });
    expect((linha["estado"] as { ordem: string[] }).ordem).toEqual(["p-gabriel", "p-fernanda"]);
    expect(emAndamento(obterViagensDoDia())?.id).toBe("centro-unisul_2026-11-13");
    const outro = destinosExemplo.find((d) => d.id === "jacarezinho-londrina")!;
    expect(await comecarViagemNoBanco(outro, ["p-mariana"])).toEqual({ ok: false, motivo: "Já tem uma viagem acontecendo. Termine ela antes de começar outra." });
  });

  it("cada toque é salvo na hora (a viagem continua de onde parou)", async () => {
    expect(await marcarEmbarcouNoBanco("p-gabriel")).toEqual({ ok: true });
    expect((falso.estado.viagens[0]!["estado"] as { embarcaram: string[] }).embarcaram).toEqual(["p-gabriel"]);
  });

  it("se o banco recusar o toque, a tela volta como estava", async () => {
    falso.estado.erro = { code: "P0001", message: "Recusado." };
    const r = await marcarNaoEstavaNoBanco("p-fernanda");
    expect(r.ok).toBe(false);
    expect(proximoDaBusca(emAndamento(obterViagensDoDia())!)).toBe("p-fernanda");
  });

  it("o passageiro só vê o próprio lugar na viagem, e a conferência pergunta 'Estou na van'", () => {
    const v = viagemDoPassageiro("p-juliana", { id: "centro-unisul", vanzeiroId: "vanzeiro-carlos" }, { viagem_id: "v1", fase: "conferencia", na_ordem: true, embarcou: true, conferencia: null, comecou_em: "2026-11-13T09:40:00Z" });
    expect(v.ordem).toEqual(["p-juliana"]);
    expect(v.comecouEm).toBe("06:40");
    expect(conferenciaDoPassageiro(v, "p-juliana")).toBe("perguntar");
    const confirmado = viagemDoPassageiro("p-juliana", { id: "centro-unisul", vanzeiroId: "vanzeiro-carlos" }, { viagem_id: "v1", fase: "conferencia", na_ordem: true, embarcou: true, conferencia: "na-van", comecou_em: "2026-11-13T09:40:00Z" });
    expect(conferenciaDoPassageiro(confirmado, "p-juliana")).toBe("confirmado");
  });

  it("o histórico do passageiro mostra a sua ausência no ponto", () => {
    const v = viagemDoPassageiro("p-fernanda", destino, {
      viagem_id: "v1",
      fase: "encerrada",
      na_ordem: true,
      embarcou: false,
      nao_estava: true,
      conferencia: null,
      comecou_em: "2026-11-13T09:40:00Z",
    });
    expect(v.naoEstavam).toEqual(["p-fernanda"]);
    expect(
      historicoDoPassageiro(
        { id: "p-fernanda", plano: "diario" },
        destino,
        v.data,
        { embarques: [], faltas: [] },
        v,
        0,
      ),
    ).toEqual([{ data: v.data, embarcou: false, motivo: "nao-estava" }]);
  });

  it("viagem encerrada vira histórico com o nome e o horário do dia", () => {
    const estado = { temVolta: true, foto: { nome: "Cambará → UENP", saida: "06:40", volta: "17:50" }, embarcaram: ["a"], naoEstavam: ["b"], ficaram: [] };
    expect(encerradaDaLinha({ id: "x", vanzeiro_id: "v", destino_id: "d", data: "2026-11-12", fase: "encerrada", estado: estado as never, comecou_em: "", terminou_em: null })).toEqual({ vanzeiroId: "v", destinoId: "d", data: "2026-11-12", ...estado });
  });
});
