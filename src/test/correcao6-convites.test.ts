import { beforeEach, describe, expect, it, vi } from "vitest";

// Correção 6: invite codes "VAN-" + 6 letters/numbers chosen by the database, a limit of wrong codes in the server.
const falso = vi.hoisted(() => ({ rpc: vi.fn() }));
vi.mock("@/lib/supabase", () => ({ USA_BANCO: { conta: true }, supabase: () => falso }));
vi.mock("@/lib/destinos-store", () => ({ obterDestinos: () => [] }));

import {
  acharPorCodigo,
  AvisoDoConvite,
  gerarConviteUnico,
  normalizarConvite,
  procurarPorCodigo,
} from "@/lib/convite";

beforeEach(() => falso.rpc.mockReset());

describe("Correção 6: código de convite", () => {
  it("aceita minúsculas, espaços e sem traço; recusa letras que se confundem e tamanho errado", () => {
    for (const t of ["van 7k2q9m", "VAN-7K2Q9M", "7k2q9m", " van-7k2q-9m "])
      expect(normalizarConvite(t)).toBe("VAN-7K2Q9M");
    for (const t of [
      "VAN-7K2Q9O",
      "VAN-7K2Q91",
      "VAN-7K2Q9I",
      "VAN-7K2Q9L",
      "VAN-7K2Q9",
      "VAN-7K2Q9MM",
      "",
      "VAN",
    ])
      expect(normalizarConvite(t)).toBeNull();
    // Codes made before the Correção 6 are still read (the database decides if they are valid).
    expect(normalizarConvite("van 4821")).toBe("VAN-4821");
  });

  it("um código que começa com VAN não perde letras", () => {
    expect(normalizarConvite("VANVAN234")).toBe("VAN-VAN234");
    expect(normalizarConvite("VAN234")).toBe("VAN-VAN234");
  });

  it("procura no banco com o código arrumado e não consulta quando o código é impossível", async () => {
    falso.rpc.mockResolvedValue({
      data: [
        { id: "d1", origem: "A", destino: "B", paradas: [], saida: "06:00", vanzeiro_nome: "Rosa" },
      ],
      error: null,
    });
    expect((await procurarPorCodigo("van 7k2q9m"))?.convite).toBe("VAN-7K2Q9M");
    expect(falso.rpc).toHaveBeenCalledWith("destino_pelo_convite", { codigo: "VAN-7K2Q9M" });
    falso.rpc.mockClear();
    expect(await procurarPorCodigo("VAN-7K2Q9O")).toBeNull();
    expect(falso.rpc).not.toHaveBeenCalled();
  });

  it("muitos códigos errados: mostra o aviso do servidor, não 'sem sinal'", async () => {
    falso.rpc.mockResolvedValue({
      data: null,
      error: { code: "P0001", message: "Muitos códigos errados. Espere 1 hora e tente de novo." },
    });
    const erro = await procurarPorCodigo("VAN-7K2Q9M").catch((e: unknown) => e);
    expect(erro).toBeInstanceOf(AvisoDoConvite);
    expect((erro as Error).message).toBe("Muitos códigos errados. Espere 1 hora e tente de novo.");
  });

  it("código novo (sem o banco) segue o formato e não se repete em 2.000", () => {
    const vistos = new Set<string>();
    for (let i = 0; i < 2000; i++) {
      const c = gerarConviteUnico();
      expect(c).toMatch(/^VAN-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$/);
      expect(vistos.has(c)).toBe(false);
      vistos.add(c);
    }
  });

  it("acha o destino pelos dois formatos", () => {
    const destinos = [
      { id: "novo", convite: "VAN-7K2Q9M" },
      { id: "antigo", convite: "VAN-4821" },
    ];
    expect(acharPorCodigo(destinos, "7k2q9m")?.id).toBe("novo");
    expect(acharPorCodigo(destinos, "van-4821")?.id).toBe("antigo");
    expect(acharPorCodigo(destinos, "VAN-7K2Q9N")).toBeUndefined();
  });
});
