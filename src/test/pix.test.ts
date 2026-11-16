import { describe, expect, it } from "vitest";
import { chaveParaPix, crc16, pixCopiaECola } from "@/lib/pix";

describe("T2: Pix copia e cola", () => {
  it("bate com o exemplo do manual do Banco Central (código conhecido, com o número de conferência 1D3D)", () => {
    const codigo = pixCopiaECola({ chave: "123e4567-e12b-12d1-a456-426655440000", nome: "Fulano de Tal", cidade: "BRASILIA", centavos: null })!;
    // Mesmos campos do manual, com o nome em letra maiúscula (o que todo banco aceita).
    expect(codigo.slice(0, -4)).toBe("00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-4266554400005204000053039865802BR5913FULANO DE TAL6008BRASILIA62070503***6304");
    expect(codigo.slice(-4)).toBe(crc16(codigo.slice(0, -4)));
    expect(crc16("00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-4266554400005204000053039865802BR5913Fulano de Tal6008BRASILIA62070503***6304")).toBe("1D3D");
  });

  it("leva o valor certo, o nome e a cidade sem acento, e o número de conferência no fim", () => {
    const c = pixCopiaECola({ chave: "carlos.vanzeiro@email.com", nome: "Carlos Pereira", cidade: "Jacarezinho", centavos: 28050 })!;
    expect(c).toContain("0014br.gov.bcb.pix0125carlos.vanzeiro@email.com");
    expect(c).toContain("5406280.50");
    expect(c).toContain("5914CARLOS PEREIRA6011JACAREZINHO");
    expect(c.slice(-8, -4)).toBe("6304");
    expect(c.slice(-4)).toBe(crc16(c.slice(0, -4)));
    expect(pixCopiaECola({ chave: "x@y.com", nome: "José Antônio", cidade: "Santo Antônio da Platina", centavos: 4500 })).toContain("5912JOSE ANTONIO6015SANTO ANTONIO D");
  });

  it("tipos de chave: só gera quando não há dúvida", () => {
    expect(chaveParaPix("Carlos@Email.com")).toEqual({ tipo: "email", valor: "carlos@email.com" });
    expect(chaveParaPix("(43) 99955-1234")).toEqual({ tipo: "telefone", valor: "+5543999551234" });
    expect(chaveParaPix("+55 43 99955-1234")).toEqual({ tipo: "telefone", valor: "+5543999551234" });
    expect(chaveParaPix("123.456.789-09")).toEqual({ tipo: "cpf", valor: "12345678909" });
    expect(chaveParaPix("12.345.678/0001-90")).toEqual({ tipo: "cnpj", valor: "12345678000190" });
    expect(chaveParaPix("43999551234")).toBeNull(); // CPF ou celular? não dá para saber
    expect(chaveParaPix("")).toBeNull();
    expect(pixCopiaECola({ chave: "43999551234", nome: "Carlos", cidade: "X", centavos: 100 })).toBeNull();
  });
});
