import { describe, expect, it } from "vitest";
import { criarConta, entrar, escolherPapel } from "@/lib/acesso";
import { obterAvisos } from "@/lib/avisos-store";
import { obterCobrancas } from "@/lib/cobrancas-store";
import { obterDestinos } from "@/lib/destinos-store";
import { obterPassageiros, obterPedidos } from "@/lib/passageiros-store";
import { obterRespostasParaTeste } from "@/lib/respostas-store";
import { primeiroNome, textoDaVan, type PerfilVanzeiro } from "@/lib/vanzeiro-store";
import { obterViagensEncerradas } from "@/lib/viagens-encerradas-store";
import { DATA_DE_HOJE } from "@/data/exemplo";

describe("Primeiro uso do vanzeiro", () => {
  it("'Entrar' (no new account) keeps the sample data", () => {
    entrar();
    escolherPapel("vanzeiro");
    expect(obterDestinos().length).toBeGreaterThan(0);
    expect(obterPassageiros().length).toBeGreaterThan(0);
  });

  it("a new account that chose 'Sou passageiro' first keeps the sample vanzeiro", () => {
    criarConta("Bruno");
    escolherPapel("passageiro");
    escolherPapel("vanzeiro");
    expect(obterDestinos().length).toBeGreaterThan(0);
  });

  it("a new account opens the vanzeiro panel empty", () => {
    criarConta("Bruna Lima");
    escolherPapel("vanzeiro");
    expect(obterDestinos()).toEqual([]);
    expect(obterPassageiros()).toEqual([]);
    expect(obterPedidos()).toEqual([]);
    expect(obterCobrancas()).toEqual([]);
    expect(obterRespostasParaTeste(DATA_DE_HOJE)).toEqual({});
    expect(obterAvisos()).toEqual([]);
    expect(obterViagensEncerradas()).toEqual([]);
  });

  it("greets by first name and hides an empty van", () => {
    const novo: PerfilVanzeiro = { nome: "Bruna Lima", telefone: "", pix: "", van: { modelo: "", placa: "" } };
    expect(primeiroNome(novo)).toBe("Bruna");
    expect(primeiroNome({ ...novo, nome: " " })).toBe("Vanzeiro");
    expect(textoDaVan(novo)).toBe("");
    expect(textoDaVan({ ...novo, van: { modelo: "Sprinter", placa: "ABC-1D23" } })).toBe("Sprinter · ABC-1D23");
  });
});

describe("Editar o Perfil do vanzeiro", () => {
  it("só nome e telefone são obrigatórios; Pix e van podem ficar em branco", async () => {
    const { perfilPodeSalvar } = await import("@/lib/vanzeiro-store");
    expect(perfilPodeSalvar({ nome: "Bruna Lima", telefone: "(43) 99999-1234" })).toBe(true);
    expect(perfilPodeSalvar({ nome: " ", telefone: "(43) 99999-1234" })).toBe(false);
    expect(perfilPodeSalvar({ nome: "Bruna Lima", telefone: "9999" })).toBe(false);
  });
});
