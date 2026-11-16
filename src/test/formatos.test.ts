import { describe, expect, it } from "vitest";
import { chavePixPadrao, emailPadrao, frase, nomeDePessoa, nomeProprio, placaPadrao } from "@/lib/formatos";
import { destinoDeRascunho, rascunhoVazio } from "@/lib/destinos";
import { obterPerfilVanzeiro, salvarPerfilVanzeiro } from "@/lib/vanzeiro-store";

describe("Formatação do que é digitado (decisão do dono, 16/11/2026)", () => {
  it("nomes, cidades e endereços como 'Mariana Souza'", () => {
    expect(nomeDePessoa("  mariana   SOUZA ")).toBe("Mariana Souza");
    expect(nomeDePessoa("ANA paula")).toBe("Ana Paula");
    expect(nomeProprio("MARIANA SOUZA")).toBe("Mariana Souza");
    expect(nomeProprio("santo antônio da platina")).toBe("Santo Antônio da Platina");
    expect(nomeProprio("rua paraná, 455")).toBe("Rua Paraná, 455");
    expect(nomeProprio("rua dos pinheiros, 10")).toBe("Rua dos Pinheiros, 10");
    expect(nomeProprio("ana-clara d'ávila")).toBe("Ana-Clara D'Ávila");
    expect(nomeProprio("")).toBe("");
  });

  it("siglas digitadas em maiúscula continuam (quando o resto não está todo em maiúscula)", () => {
    expect(nomeProprio("UENP jacarezinho")).toBe("UENP Jacarezinho");
    expect(nomeProprio("Cambará → UENP Jacarezinho")).toBe("Cambará → UENP Jacarezinho");
  });

  it("e-mail, placa, motivos e chave Pix", () => {
    expect(emailPadrao("  Rosa@Email.COM ")).toBe("rosa@email.com");
    expect(placaPadrao("abc1d23")).toBe("ABC-1D23");
    expect(placaPadrao("abc-1234")).toBe("ABC-1234");
    expect(frase("  feriado   municipal ")).toBe("Feriado municipal");
    expect(chavePixPadrao(" Carlos@Email.com ")).toBe("carlos@email.com");
    expect(chavePixPadrao("(43) 99955-1234")).toBe("(43) 99955-1234");
  });

  it("é assim que vai salvo: destino e perfil do vanzeiro", () => {
    const d = destinoDeRascunho({ ...rascunhoVazio(), tipo: "fixa", origem: "jacarezinho", destino: "UENP campus", dias: ["seg"], saida: "06:00", paradas: [" santo antônio da platina "] });
    expect([d.origem, d.destino, d.paradas]).toEqual(["Jacarezinho", "UENP Campus", ["Santo Antônio da Platina"]]);
    const antes = obterPerfilVanzeiro();
    salvarPerfilVanzeiro({ nome: "carlos PEREIRA", telefone: "(43) 99955-1234", pix: " Carlos@Email.com ", van: { modelo: "sprinter", placa: "abc1d23", lugares: 15 } });
    expect(obterPerfilVanzeiro()).toEqual({ nome: "Carlos Pereira", telefone: "43999551234", pix: "carlos@email.com", van: { modelo: "Sprinter", placa: "ABC-1D23", lugares: 15 } });
    salvarPerfilVanzeiro(antes);
  });
});
