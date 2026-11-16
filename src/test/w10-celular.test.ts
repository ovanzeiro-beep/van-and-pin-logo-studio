import { describe, expect, it } from "vitest";
import { bytesDaChave, guardarEsteCelular } from "@/lib/banco/celular";

describe("W10: notificação no celular", () => {
  it("a chave pública vira os bytes que o navegador pede", () => {
    expect([...bytesDaChave("AQID_-8")]).toEqual([1, 2, 3, 255, 239]);
  });

  it("sem conta e sem banco (testes), não guarda nada", async () => {
    expect(await guardarEsteCelular()).toBe(false);
  });
});
