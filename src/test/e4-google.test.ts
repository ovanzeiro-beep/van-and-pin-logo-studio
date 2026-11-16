import { describe, expect, it, vi } from "vitest";

// E4: a Google account only comes in after the box of the Termos was checked in "Criar conta" (LGPD).
const falso = vi.hoisted(() => {
  const estado = { rpc: [] as string[], saiu: 0 };
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
            data: { nome: "Ana Souza", ultimo_papel: null, aceite_termos_em: null },
          }),
        }),
      }),
    }),
    rpc: async (nome: string) => (estado.rpc.push(nome), { error: null }),
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

import { obterMensagemDasAcoes } from "@/lib/acoes";
import { entrarComEmail, entrarComGoogle, SEM_ACEITE_GOOGLE } from "@/lib/conta";
import { obterSessao } from "@/lib/sessao";

describe("E4: login com o Google e os Termos", () => {
  it("conta do Google sem o aceite: não entra e explica o que fazer", async () => {
    await entrarComEmail("ana@gmail.com", "x");
    expect(obterSessao().conta).toBeNull();
    expect(falso.estado.saiu).toBe(1);
    expect(falso.estado.rpc).toEqual([]);
    expect(obterMensagemDasAcoes()?.texto).toBe(SEM_ACEITE_GOOGLE);
  });

  it("vindo de Criar conta com o aceite marcado: o aceite é gravado e a pessoa entra", async () => {
    expect(await entrarComGoogle(true)).toEqual({ ok: true });
    await entrarComEmail("ana@gmail.com", "x");
    expect(falso.estado.rpc).toEqual(["aceitar_termos"]);
    expect(obterSessao().conta?.id).toBe("u-g");
  });
});
