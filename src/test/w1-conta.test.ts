import { beforeEach, describe, expect, it, vi } from "vitest";

// W1: login and account. Supabase is simulated here (the tests never talk to the real database).
const falso = vi.hoisted(() => {
  const estado = {
    loginErro: null as null | { message: string; code?: string },
    cadastroComSessao: true,
    rpc: [] as { nome: string; args: unknown }[],
    cadastro: null as null | { email: string; options: { data: Record<string, string> } },
  };
  const usuario = { id: "u-1", email: "rosa@email.com", user_metadata: { nome: "Rosa Lima" } };
  const cliente = {
    auth: {
      signInWithPassword: async () => (estado.loginErro ? { data: { user: null }, error: estado.loginErro } : { data: { user: usuario }, error: null }),
      signUp: async (a: { email: string; options: { data: Record<string, string> } }) => {
        estado.cadastro = a;
        return { data: { user: usuario, session: estado.cadastroComSessao ? {} : null }, error: null };
      },
      signOut: async () => ({ error: null }),
    },
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { nome: "Rosa Lima", ultimo_papel: "vanzeiro" } }) }) }) }),
    rpc: async (nome: string, args?: unknown) => {
      estado.rpc.push({ nome, args });
      return { error: null };
    },
  };
  return { estado, cliente };
});

vi.mock("@/lib/supabase", () => ({ USA_BANCO: { conta: true }, supabase: () => falso.cliente }));

import { obterDestinos } from "@/lib/destinos-store";
import { criarContaComEmail, entrarComEmail, escolherPapelDaConta, excluirContaDoBanco, sairDaConta } from "@/lib/conta";
import { obterSessao } from "@/lib/sessao";
import { validarSenhaNova } from "@/lib/cadastro";

beforeEach(() => {
  falso.estado.loginErro = null;
  falso.estado.cadastroComSessao = true;
  falso.estado.rpc = [];
});

describe("W1: login e conta de verdade (Supabase simulado)", () => {
  it("senha errada: o motivo em português e ninguém entra", async () => {
    falso.estado.loginErro = { message: "Invalid login credentials", code: "invalid_credentials" };
    expect(await entrarComEmail("rosa@email.com", "errada")).toEqual({ ok: false, motivo: "E-mail ou senha errados." });
    expect(obterSessao().conta).toBeNull();
  });

  it("entrar: a pessoa fica na sessão com o último painel usado; os exemplos saem da memória", async () => {
    expect(obterDestinos().length).toBeGreaterThan(0);
    expect(await entrarComEmail(" rosa@email.com ", "12345678")).toEqual({ ok: true });
    expect(obterSessao().conta).toEqual({ id: "u-1", email: "rosa@email.com", nome: "Rosa Lima" });
    expect(obterSessao().papel).toBe("vanzeiro");
    expect(obterSessao().vanzeiroId).toBe("u-1");
    expect(obterDestinos()).toEqual([]);
  });

  it("criar conta leva o nome e a hora do aceite dos Termos; se o Supabase pedir, avisa para confirmar o e-mail", async () => {
    falso.estado.cadastroComSessao = false;
    const r = await criarContaComEmail({ nome: " Rosa Lima ", email: "rosa@email.com", senha: "12345678" });
    expect(r).toEqual({ ok: true, confirmarEmail: true });
    expect(falso.estado.cadastro?.options.data).toEqual({ nome: "Rosa Lima", aceite_termos_em: "2026-11-13T08:10:00.000Z" });
  });

  it("escolher o papel guarda na conta; excluir apaga a conta; sair limpa a sessão", async () => {
    await entrarComEmail("rosa@email.com", "12345678");
    await escolherPapelDaConta("passageiro");
    expect(falso.estado.rpc).toContainEqual({ nome: "escolher_papel", args: { papel: "passageiro" } });
    expect(await excluirContaDoBanco()).toEqual({ ok: true });
    expect(falso.estado.rpc.map((x) => x.nome)).toContain("excluir_minha_conta");
    await entrarComEmail("rosa@email.com", "12345678");
    await sairDaConta();
    expect(obterSessao().conta).toBeNull();
  });

  it("senha nova: as mesmas regras do cadastro", () => {
    expect(validarSenhaNova("123", "123").senha).toBe("A senha precisa ter pelo menos 8 caracteres");
    expect(validarSenhaNova("12345678", "1234567x").confirmar).toBe("As senhas não são iguais");
    expect(validarSenhaNova("12345678", "12345678")).toEqual({});
  });
});
