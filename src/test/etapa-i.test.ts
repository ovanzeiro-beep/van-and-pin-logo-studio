import { describe, expect, it } from "vitest";
import { DATA_DE_HOJE, passageirosExemplo } from "@/data/exemplo";
import { textoDoVencimento } from "@/lib/cobrancas";
import { dataNoPassado, passoCompleto, rascunhoVazio } from "@/lib/destinos";
import { lerValor, telefoneJaNoDestino } from "@/lib/passageiros";
import { obterPassageiros, salvarPassageiro } from "@/lib/passageiros-store";

const hoje = DATA_DE_HOJE;

describe("Etapa I, erro 5: viagem avulsa não aceita data que já passou", () => {
  const r = { ...rascunhoVazio(), origem: "A", destino: "B", tipo: "avulsa" as const, saida: "08:00", temVolta: false };
  it("ontem não; hoje e depois sim", () => {
    expect(dataNoPassado({ ...r, data: "2026-11-12" }, hoje)).toBe(true);
    expect(passoCompleto(2, { ...r, data: "2026-11-12" }, hoje)).toBe(false);
    expect(passoCompleto(2, { ...r, data: hoje }, hoje)).toBe(true);
    expect(passoCompleto(2, { ...r, data: "2026-11-28" }, hoje)).toBe(true);
  });
  it("rota fixa não usa data", () => {
    expect(dataNoPassado({ tipo: "fixa", data: "2020-01-01" }, hoje)).toBe(false);
  });
});

describe("Etapa I, erro 7: cobrança que vence hoje diz 'vence hoje'", () => {
  const c = { pagamento: null, cancelamento: null };
  it("hoje, depois e antes", () => {
    expect(textoDoVencimento({ ...c, vencimento: hoje }, hoje)).toBe("vence hoje");
    expect(textoDoVencimento({ ...c, vencimento: "2026-11-20" }, hoje)).toBe("vence em 20/11");
    expect(textoDoVencimento({ ...c, vencimento: "2026-11-05" }, hoje)).toBe("venceu em 05/11");
  });
});

describe("Etapa I, erro 9: cadastro de passageiro", () => {
  it("valor zero nunca passa, nem escrito como 0,001", () => {
    expect(lerValor("0")).toBeNull();
    expect(lerValor("0,00")).toBeNull();
    expect(lerValor("0,001")).toBeNull();
    expect(lerValor("0,01")).toBe(0.01);
    expect(lerValor("280")).toBe(280);
  });

  it("o mesmo telefone não entra duas vezes no mesmo destino; a própria pessoa editando não conta", () => {
    const gabriel = passageirosExemplo.find((p) => p.id === "p-gabriel")!;
    expect(telefoneJaNoDestino(passageirosExemplo, "centro-unisul", "(43) 99912-5566")).toBe(true);
    expect(telefoneJaNoDestino(passageirosExemplo, "centro-unisul", "(43) 99912-5566", gabriel)).toBe(false);
    expect(telefoneJaNoDestino(passageirosExemplo, "jacarezinho-londrina", "(43) 99912-5566")).toBe(false);
  });

  it("salvar um passageiro novo com telefone repetido no destino não salva", () => {
    const gabriel = obterPassageiros().find((p) => p.id === "p-gabriel")!;
    const antes = obterPassageiros().length;
    salvarPassageiro({ ...gabriel, id: "p-copia", pessoaId: undefined, nome: "Outro Nome" });
    expect(obterPassageiros().length).toBe(antes);
  });
});
