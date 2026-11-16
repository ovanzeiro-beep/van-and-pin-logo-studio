import { describe, expect, it, vi } from "vitest";

// E4: a Google account only comes in after the box of the Termos was checked in "Criar conta" (LGPD).
const falso = vi.hoisted(() => {
  const estado = { rpc: [] as string[], saiu: 0, aceito: false };
  const usuario = { id: "u-g", email: "ana@gmail.com", user_metadata: { full_name: "Ana Souza" } };
  const cliente = {
    auth: {
      signInWithPassword: async () => ({ data: { user: usuario }, error: null }),
      signInWithOAuth: async () => ({ error: null }),
      signOut: async () => ((estado.saiu += 1), { error: null }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({
            data: {
              nome: "Ana Souza",
              ultimo_papel: null,
              aceite_termos_em: estado.aceito ? "2026-11-16T10:00:00Z" : null,
            },
          }),
        }),
      }),
    }),
    rpc: async (nome: string) => (estado.rpc.push(nome), (estado.aceito = true), { error: null }),
  };
  return { estado, cliente };
});
vi.mock("@/lib/supabase", () => ({
  USA_BANCO: { conta: true },
  supabase: () => falso.cliente,
  SUPABASE_URL: "https://teste.supabase.co",
  SUPABASE_CHAVE_PUBLICA: "chave",
}));
vi.stubGlobal("fetch", async () => ({ json: async () => ({ external: { google: true } }) }));

import {
  aceitarTermosEContinuar,
  entrarComEmail,
  entrarComGoogle,
  obterAceitePendente,
} from "@/lib/conta";
import { mudarSessao, obterSessao } from "@/lib/sessao";

describe("E4: login com o Google e os Termos", () => {
  it("primeira vez com o Google: a janelinha dos Termos aparece na hora; aceitando, a pessoa entra", async () => {
    await entrarComEmail("ana@gmail.com", "x");
    expect(obterSessao().conta).toBeNull();
    expect(obterAceitePendente()?.id).toBe("u-g");
    expect(falso.estado.rpc).toEqual([]);
    expect(await aceitarTermosEContinuar()).toEqual({ ok: true });
    expect(falso.estado.rpc).toEqual(["aceitar_termos"]);
    expect(obterAceitePendente()).toBeNull();
    expect(obterSessao().conta?.id).toBe("u-g");
  });

  it("vindo de Criar conta com o aceite marcado: grava o aceite sem perguntar de novo", async () => {
    falso.estado.aceito = false;
    falso.estado.rpc = [];
    mudarSessao({ conta: null });
    expect(await entrarComGoogle(true)).toEqual({ ok: true });
    await entrarComEmail("ana@gmail.com", "x");
    expect(falso.estado.rpc).toEqual(["aceitar_termos"]);
    expect(obterAceitePendente()).toBeNull();
  });
});
