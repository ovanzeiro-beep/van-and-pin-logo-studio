import { describe, expect, it } from "vitest";
import { comoInstalar } from "@/lib/instalar";

describe("Instalar o app pelo link", () => {
  it("instalado: não mostra nada", () => {
    expect(comoInstalar({ instalado: true, temPedido: true, ehIphone: false })).toBeNull();
    expect(comoInstalar({ instalado: true, temPedido: false, ehIphone: true })).toBeNull();
  });
  it("Android/Chrome ofereceu a instalação: botão que instala", () => {
    expect(comoInstalar({ instalado: false, temPedido: true, ehIphone: false })).toBe("botao");
  });
  it("iPhone: botão que explica como adicionar à tela de início", () => {
    expect(comoInstalar({ instalado: false, temPedido: false, ehIphone: true })).toBe("iphone");
  });
  it("navegador sem como instalar (ex.: computador sem oferta): não mostra nada", () => {
    expect(comoInstalar({ instalado: false, temPedido: false, ehIphone: false })).toBeNull();
  });
});
