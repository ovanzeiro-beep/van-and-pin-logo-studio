import { describe, expect, it, vi } from "vitest";

// W5: answers in the database, with Supabase simulated.
const falso = vi.hoisted(() => {
  const estado = { erro: null as null | { code: string; message: string }, chamadas: [] as { nome: string; a: unknown }[] };
  const cliente = {
    rpc: async (nome: string, a: unknown) => {
      estado.chamadas.push({ nome, a });
      const erro = estado.erro;
      estado.erro = null;
      if (erro) return { data: null, error: erro };
      return { data: nome === "marcar_nao_vou" ? "nv-do-banco" : null, error: null };
    },
  };
  return { estado, cliente };
});
vi.mock("@/lib/supabase", () => ({ USA_BANCO: { conta: true, destinos: true }, supabase: () => falso.cliente, SUPABASE_URL: "", SUPABASE_CHAVE_PUBLICA: "" }));

import { marcarNaoVouNoBanco, momentoDe, responderNoBanco, respostasDasLinhas } from "@/lib/banco/respostas";
import { obterMomentoDaResposta, obterRespostasDoDia, obterRespostasFixas } from "@/lib/respostas-store";

const hoje = "2026-11-13";

describe("W5: respostas no banco (Supabase simulado)", () => {
  it("o que vem do banco fica no horário de Brasília, como o app guarda", () => {
    expect(momentoDe("2026-11-13T08:10:00Z")).toBe("2026-11-13 05:10");
    const d = respostasDasLinhas(
      [{ matricula_id: "m1", data: hoje, resposta: "nao-vai", respondida_em: "2026-11-13T08:00:00Z", prazo: "2026-11-13T08:40:00Z" }],
      [{ matricula_id: "m1", desde: "2026-11-10T12:00:00Z", ate: null }],
      [{ id: "nv1", matricula_id: "m1", de: "2026-11-20", ate: "2026-11-21", em: "2026-11-12T12:00:00Z", tirado_em: null }],
    );
    expect(d.respostas).toEqual({ [hoje]: { m1: "nao-vai" } });
    expect(d.momentos[hoje]?.["m1"]).toEqual({ em: "2026-11-13 05:00", prazo: "2026-11-13 05:40" });
    expect(d.fixas.vouSempre).toEqual([{ passageiroId: "m1", desde: "2026-11-10 09:00", ate: null }]);
    expect(d.fixas.naoVou[0]).toMatchObject({ id: "nv1", em: "2026-11-12 09:00", tiradoEm: null });
  });

  it("o banco recusa (prazo, lotação, dia sem viagem): o motivo aparece e nada muda", async () => {
    falso.estado.erro = { code: "P0001", message: "A van lotou. Não tem mais lugar nesta viagem." };
    expect(await responderNoBanco("p-juliana", hoje, "vai")).toEqual({ ok: false, motivo: "A van lotou. Não tem mais lugar nesta viagem." });
    expect(obterRespostasDoDia(hoje)["p-juliana"]).toBeUndefined();
  });

  it("o banco aceita: a resposta e a hora ficam guardadas", async () => {
    expect(await responderNoBanco("p-juliana", hoje, "nao-vai")).toEqual({ ok: true });
    expect(falso.estado.chamadas.at(-1)).toEqual({ nome: "responder", a: { matricula: "p-juliana", dia: hoje, resposta: "nao-vai" } });
    expect(obterRespostasDoDia(hoje)["p-juliana"]).toBe("nao-vai");
    expect(obterMomentoDaResposta("p-juliana", hoje)?.em).toBe("2026-11-13 05:10");
  });

  it("Não vou de… até… fica com o número que o banco deu (para poder tirar depois)", async () => {
    expect(await marcarNaoVouNoBanco("p-juliana", "2026-11-20", "2026-11-21")).toEqual({ ok: true });
    expect(obterRespostasFixas().naoVou.at(-1)).toMatchObject({ id: "nv-do-banco", passageiroId: "p-juliana", de: "2026-11-20", ate: "2026-11-21" });
  });
});
