import { describe, expect, it, vi } from "vitest";

// Without signal inside the van: the taps wait on the phone and go to the database when the signal comes back.
const falso = vi.hoisted(() => {
  const estado = { viagens: [] as Record<string, unknown>[], semSinal: true };
  const falha = { error: { message: "TypeError: Failed to fetch" } };
  const cliente = {
    rpc: async () => ({ data: null, error: null }),
    from: () => ({
      insert: async (linha: Record<string, unknown>) =>
        estado.semSinal ? falha : (estado.viagens.push(linha), { error: null }),
      update: () => ({ eq: async () => (estado.semSinal ? falha : { error: null }) }),
      upsert: async (linha: Record<string, unknown>) => {
        if (estado.semSinal) return falha;
        estado.viagens = [...estado.viagens.filter((v) => v["id"] !== linha["id"]), linha];
        return { error: null };
      },
    }),
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
import { enviarPendentes, viagensPendentes } from "@/lib/banco/fila";
import {
  comecarViagemNoBanco,
  marcarEmbarcouNoBanco,
  marcarNaoEstavaNoBanco,
} from "@/lib/banco/viagem";
import { emAndamento, obterViagensDoDia } from "@/lib/viagem-store";

const destino = destinosExemplo.find((d) => d.id === "centro-unisul")!;

describe("Sem sinal: a viagem continua e vai para o banco quando o sinal volta", () => {
  it("sem sinal, iniciar e marcar funcionam na tela e ficam guardados no celular", async () => {
    expect(await comecarViagemNoBanco(destino, ["p-gabriel", "p-fernanda"])).toEqual({ ok: true });
    expect(await marcarEmbarcouNoBanco("p-gabriel")).toEqual({ ok: true });
    expect(await marcarNaoEstavaNoBanco("p-fernanda")).toEqual({ ok: true });
    expect(emAndamento(obterViagensDoDia())?.embarcaram).toEqual(["p-gabriel"]);
    expect(falso.estado.viagens).toEqual([]);
    // Only the newest state of the trip waits (it has every tap), and it survives closing the app.
    expect(viagensPendentes()).toHaveLength(1);
    expect(
      JSON.parse(localStorage.getItem("vanzeiro-viagens-sem-sinal")!)["centro-unisul_2026-11-13"]
        .estado.naoEstavam,
    ).toEqual(["p-fernanda"]);
  });

  it("o sinal voltou: tudo vai para o banco de uma vez e o celular esvazia", async () => {
    falso.estado.semSinal = false;
    await enviarPendentes();
    expect(falso.estado.viagens).toHaveLength(1);
    expect(falso.estado.viagens[0]).toMatchObject({
      id: "centro-unisul_2026-11-13",
      fase: "busca",
    });
    expect((falso.estado.viagens[0]!["estado"] as { embarcaram: string[] }).embarcaram).toEqual([
      "p-gabriel",
    ]);
    expect(viagensPendentes()).toEqual([]);
  });
});
