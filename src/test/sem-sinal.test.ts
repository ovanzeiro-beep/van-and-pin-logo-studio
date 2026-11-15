import { describe, expect, it } from "vitest";
import { arquivosParaGuardar, podeGuardarCopia } from "@/lib/sem-sinal";

describe("A1: o app funciona sem sinal dentro da van", () => {
  it("guarda a cópia só no app de verdade (não na edição nem na prévia do Lovable)", () => {
    expect(podeGuardarCopia({ emDesenvolvimento: false, dentroDeOutraTela: false, temSuporte: true })).toBe(true);
    expect(podeGuardarCopia({ emDesenvolvimento: true, dentroDeOutraTela: false, temSuporte: true })).toBe(false);
    expect(podeGuardarCopia({ emDesenvolvimento: false, dentroDeOutraTela: true, temSuporte: true })).toBe(false);
    expect(podeGuardarCopia({ emDesenvolvimento: false, dentroDeOutraTela: false, temSuporte: false })).toBe(false);
  });

  it("guarda os arquivos do app e as letras; nada de outros sites", () => {
    const site = "https://ovanzeiro.app";
    const lista = arquivosParaGuardar(
      [
        `${site}/assets/index-abc.js`,
        `${site}/assets/index-abc.js`,
        `${site}/assets/styles-x.css`,
        "https://fonts.googleapis.com/css2?family=Manrope",
        "https://fonts.gstatic.com/s/manrope/a.woff2",
        "https://outro-site.com/assets/x.js",
        `${site}/vanzeiro`,
      ],
      site,
    );
    expect(lista).toEqual([
      `${site}/assets/index-abc.js`,
      `${site}/assets/styles-x.css`,
      "https://fonts.googleapis.com/css2?family=Manrope",
      "https://fonts.gstatic.com/s/manrope/a.woff2",
    ]);
  });
});
