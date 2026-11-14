import { describe, expect, it } from "vitest";
import { cadastroOk, erroDoEmail, validarCadastro, validarPasso, podeContinuarComGoogle, type DadosCadastro } from "@/lib/cadastro";

const certo: DadosCadastro = {
  nome: "Bruna",
  email: "bruna@email.com",
  senha: "12345678",
  confirmar: "12345678",
  aceitouTermos: true,
};

describe("Criar conta", () => {
  it("Google requires acceptance of the terms", () => {
    expect(podeContinuarComGoogle(false)).toBe(false);
    expect(podeContinuarComGoogle(true)).toBe(true);
  });
  it("accepts a complete form", () => {
    expect(cadastroOk(validarCadastro(certo))).toBe(true);
  });

  it("requires every field", () => {
    const erros = validarCadastro({ nome: " ", email: "", senha: "", confirmar: "", aceitouTermos: true });
    expect(Object.keys(erros).sort()).toEqual(["confirmar", "email", "nome", "senha"]);
  });

  it("rejects an invalid e-mail", () => {
    expect(validarCadastro({ ...certo, email: "bruna@email" }).email).toBe("E-mail inválido");
    expect(erroDoEmail("bruna.email.com")).toBe("E-mail inválido");
  });

  it("rejects a password with fewer than 8 characters", () => {
    expect(validarCadastro({ ...certo, senha: "1234567", confirmar: "1234567" }).senha).toMatch(/8 caracteres/);
  });

  it("says when the passwords are different", () => {
    expect(validarCadastro({ ...certo, confirmar: "87654321" }).confirmar).toBe("As senhas não são iguais");
  });

  it("does not create the account without accepting the terms", () => {
    expect(cadastroOk(validarCadastro({ ...certo, aceitouTermos: false }))).toBe(false);
  });
});

describe("Criar conta em 2 passos", () => {
  const vazio = { nome: "", email: "", senha: "", confirmar: "", aceitouTermos: false };
  it("passo 1 pede nome, e-mail válido e o aceite dos Termos", () => {
    expect(Object.keys(validarPasso(1, vazio)).sort()).toEqual(["email", "nome", "termos"]);
    expect(validarPasso(1, { ...vazio, nome: "Ana", email: "ana@email.com", aceitouTermos: true })).toEqual({});
  });
  it("passo 2 pede a senha com 8 caracteres e a confirmação igual", () => {
    expect(Object.keys(validarPasso(2, vazio)).sort()).toEqual(["confirmar", "senha"]);
    expect(validarPasso(2, { ...vazio, senha: "12345678", confirmar: "12345679" }).confirmar).toBe("As senhas não são iguais");
    expect(validarPasso(2, { ...vazio, senha: "12345678", confirmar: "12345678" })).toEqual({});
  });
});
