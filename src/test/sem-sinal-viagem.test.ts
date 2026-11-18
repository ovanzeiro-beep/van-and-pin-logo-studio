import { describe, expect, it, vi } from "vitest";

// Without signal inside the van: the taps wait on the phone and go to the database when the signal comes back.
const falso = vi.hoisted(() => {
  const estado = {
    viagens: [] as Record<string, unknown>[],
    semSinal: true,
    statusRecusa: 0,
    tentativas: 0,
  };
  const falha = { error: { message: "TypeError: Failed to fetch" } };
  const cliente = {
    rpc: async () => ({ data: null, error: null }),
    from: () => ({
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
import { enviarPendentes, envioRecusado, viagensPendentes } from "@/lib/banco/fila";
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

  it("conserva o embarque até o servidor aceitar o envio", async () => {
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
});
