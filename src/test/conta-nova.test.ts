import { describe, expect, it } from "vitest";
import { abrirPainelVanzeiro, marcarContaNova } from "@/lib/conta-nova";
import { obterCobrancas } from "@/lib/cobrancas-store";
import { obterDestinos } from "@/lib/destinos-store";
import { obterPassageiros, obterPedidos } from "@/lib/passageiros-store";
import { obterRespostasParaTeste } from "@/lib/respostas-store";
import { primeiroNome, textoDaVan, type PerfilVanzeiro } from "@/lib/vanzeiro-store";
import { DATA_DE_HOJE } from "@/data/exemplo";

describe("Primeiro uso do vanzeiro", () => {
  it("'Entrar' (no new account) keeps the sample data", () => {
    abrirPainelVanzeiro();
    expect(obterDestinos().length).toBeGreaterThan(0);
    expect(obterPassageiros().length).toBeGreaterThan(0);
  });

  it("a new account opens the vanzeiro panel empty", () => {
    marcarContaNova("Bruna Lima");
    abrirPainelVanzeiro();
    expect(obterDestinos()).toEqual([]);
    expect(obterPassageiros()).toEqual([]);
    expect(obterPedidos()).toEqual([]);
    expect(obterCobrancas()).toEqual([]);
    expect(obterRespostasParaTeste(DATA_DE_HOJE)).toEqual({});
  });

  it("greets by first name and hides an empty van", () => {
    const novo: PerfilVanzeiro = { nome: "Bruna Lima", telefone: "", pix: "", van: { modelo: "", placa: "" } };
    expect(primeiroNome(novo)).toBe("Bruna");
    expect(primeiroNome({ ...novo, nome: " " })).toBe("Vanzeiro");
    expect(textoDaVan(novo)).toBe("");
    expect(textoDaVan({ ...novo, van: { modelo: "Sprinter", placa: "ABC-1D23" } })).toBe("Sprinter · ABC-1D23");
  });
});
