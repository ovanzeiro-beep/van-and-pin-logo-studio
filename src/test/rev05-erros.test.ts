import { describe, expect, it, vi } from "vitest";

const falso = vi.hoisted(() => {
  const linhas: Record<string, unknown>[] = [];
  return {
    linhas,
    cliente: {
      from: () => ({
        insert: async (l: Record<string, unknown>) => (linhas.push(l), { error: null }),
      }),
    },
  };
});
vi.mock("@/lib/supabase", () => ({
  USA_BANCO: { conta: true, destinos: true },
  supabase: () => falso.cliente,
  SUPABASE_URL: "",
  SUPABASE_CHAVE_PUBLICA: "",
}));

import { limparTexto, registrarErro } from "@/lib/erros";

describe("REV-05: registro de erros dos celulares", () => {
  it("apaga e-mails e números longos do texto", () => {
    expect(limparTexto("falhou para ana@gmail.com no (43) 99912-5566", 200)).toBe(
      "falhou para [e-mail] no [número]",
    );
  });

  it("grava o erro uma vez só, com a tela, e para depois de 20", async () => {
    expect(await registrarErro(new TypeError("x is undefined"), "/vanzeiro/viagem")).toBe(true);
    expect(await registrarErro(new TypeError("x is undefined"), "/vanzeiro/viagem")).toBe(false);
    expect(falso.linhas[0]).toMatchObject({
      tela: "/vanzeiro/viagem",
      mensagem: "TypeError: x is undefined",
    });
    for (let i = 0; i < 30; i++) await registrarErro(`erro ${i}`, "/x");
    expect(falso.linhas).toHaveLength(20);
  });
});
