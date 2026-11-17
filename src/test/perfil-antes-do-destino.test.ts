import { describe, expect, it } from "vitest";
import { itensDoPerfil, perfilCompleto, PERFIL_VAZIO } from "@/lib/vanzeiro-store";

describe("Antes do primeiro destino: o perfil completo", () => {
  it("conta nova: falta telefone, Pix e van", () => {
    expect(itensDoPerfil(PERFIL_VAZIO)).toEqual({ telefone: false, pix: false, van: false });
    expect(perfilCompleto(PERFIL_VAZIO)).toBe(false);
  });

  it("a van só está pronta com modelo, placa e lugares", () => {
    const base = {
      nome: "Rafael",
      telefone: "14997732018",
      pix: "346.138.258-22",
      van: { modelo: "Sprinter", placa: "AGL-8377", lugares: null },
    };
    expect(itensDoPerfil(base)).toEqual({ telefone: true, pix: true, van: false });
    expect(perfilCompleto({ ...base, van: { ...base.van, lugares: 15 } })).toBe(true);
    expect(
      itensDoPerfil({ ...base, telefone: "123", van: { ...base.van, lugares: 15 } }).telefone,
    ).toBe(false);
  });
});
