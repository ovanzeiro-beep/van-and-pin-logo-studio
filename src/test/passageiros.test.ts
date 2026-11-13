import { describe, expect, it } from "vitest";
import { destinosExemplo, passageirosExemplo, pedidosExemplo, vanzeiroExemplo } from "@/data/exemplo";
import {
  contarPassageiros,
  descricaoPlano,
  formatarTelefone,
  lerValor,
  passageiroDeRascunho,
  passoPassageiroCompleto,
  presencaDaViagem,
  rascunhoPassageiroVazio,
} from "@/lib/passageiros";
import { obterPassageiros, obterPedidos, salvarPassageiro } from "@/lib/passageiros-store";

const pontos = ["Jacarezinho", "Santo Antônio da Platina", "Londrina"];

describe("Passageiros de exemplo", () => {
  it("each rota fixa has 4 to 6 passengers", () => {
    for (const d of destinosExemplo.filter((x) => x.tipo === "fixa")) {
      const n = contarPassageiros(passageirosExemplo, d.id);
      expect(n).toBeGreaterThanOrEqual(4);
      expect(n).toBeLessThanOrEqual(6);
    }
  });
  it("Jacarezinho → Londrina has 2 join requests", () => {
    expect(pedidosExemplo.filter((p) => p.destinoId === "jacarezinho-londrina")).toHaveLength(2);
  });
});

describe("Plano e contato", () => {
  it("shows the plan with its value", () => {
    expect(descricaoPlano({ plano: "mensal", valor: 280 }).replace(/\s/g, " ")).toBe("Mensal · R$ 280,00");
  });
  it("formats a WhatsApp number with DDD", () => {
    expect(formatarTelefone("43998123456")).toBe("(43) 99812-3456");
  });
  it("reads values typed with a comma", () => {
    expect(lerValor("280,50")).toBe(280.5);
    expect(lerValor("")).toBeNull();
  });
});

describe("Passos de adicionar passageiro", () => {
  it("step 1 needs a name and a phone with DDD", () => {
    const r = { ...rascunhoPassageiroVazio(), nome: "Ana" };
    expect(passoPassageiroCompleto(1, { ...r, telefone: "9981-2345" }, pontos)).toBe(false);
    expect(passoPassageiroCompleto(1, { ...r, telefone: "(43) 99812-3456" }, pontos)).toBe(true);
  });
  it("step 2 needs a city from the destino's stops and an address", () => {
    const r = { ...rascunhoPassageiroVazio(), endereco: "Rodoviária" };
    expect(passoPassageiroCompleto(2, { ...r, cidade: "Curitiba" }, pontos)).toBe(false);
    expect(passoPassageiroCompleto(2, { ...r, cidade: "Santo Antônio da Platina" }, pontos)).toBe(true);
  });
  it("quinzenal and mensal need a due day; por viagem and diário do not", () => {
    const r = { ...rascunhoPassageiroVazio(), valor: "280" };
    expect(passoPassageiroCompleto(3, { ...r, plano: "mensal" }, pontos)).toBe(false);
    expect(passoPassageiroCompleto(3, { ...r, plano: "quinzenal", vencimento: "15" }, pontos)).toBe(true);
    expect(passoPassageiroCompleto(3, { ...r, plano: "viagem" }, pontos)).toBe(true);
    expect(passoPassageiroCompleto(3, { ...r, plano: "diario" }, pontos)).toBe(true);
  });
  it("accepting a pedido prefills name and phone", () => {
    const r = rascunhoPassageiroVazio({ nome: "Larissa Moreira", telefone: "43997012345" });
    expect(r.nome).toBe("Larissa Moreira");
    expect(r.telefone).toBe("(43) 99701-2345");
  });
  it("saving an accepted pedido adds the passenger and clears the pedido", () => {
    const pedido = pedidosExemplo[0]!;
    const antes = contarPassageiros(obterPassageiros(), pedido.destinoId);
    const r = {
      ...rascunhoPassageiroVazio(pedido),
      cidade: "Jacarezinho",
      endereco: "Rua Paraná, 10",
      plano: "viagem" as const,
      valor: "45",
    };
    salvarPassageiro(passageiroDeRascunho(r, pedido.destinoId), pedido.id);
    expect(contarPassageiros(obterPassageiros(), pedido.destinoId)).toBe(antes + 1);
    expect(obterPedidos().some((p) => p.id === pedido.id)).toBe(false);
  });
});

describe("Passageiros da viagem de hoje no Início", () => {
  it("Centro → Unisul shows its 6 sample passengers split into vão, sem resposta and não vão", () => {
    const r = presencaDaViagem(passageirosExemplo, "centro-unisul", vanzeiroExemplo.respostasHoje);
    expect(r).toEqual({ total: 6, vao: 4, semResposta: 1, naoVao: 1 });
  });
  it("a new passenger counts in the total as sem resposta", () => {
    const novo = { id: "p-novo", destinoId: "centro-unisul" };
    const r = presencaDaViagem([...passageirosExemplo, novo], "centro-unisul", vanzeiroExemplo.respostasHoje);
    expect(r.total).toBe(7);
    expect(r.semResposta).toBe(2);
  });
  it("a removed passenger leaves the count", () => {
    const lista = passageirosExemplo.filter((p) => p.id !== "p-juliana");
    const r = presencaDaViagem(lista, "centro-unisul", vanzeiroExemplo.respostasHoje);
    expect(r).toEqual({ total: 5, vao: 3, semResposta: 1, naoVao: 1 });
  });
});

describe("Descontar faltas no cadastro", () => {
  const r = { ...rascunhoPassageiroVazio(), plano: "mensal" as const, valor: "280", vencimento: "10" };
  it("starts as Não", () => {
    expect(rascunhoPassageiroVazio().descontaFaltas).toBe(false);
  });
  it("with Sim, the value of each falta is required", () => {
    expect(passoPassageiroCompleto(3, { ...r, descontaFaltas: true }, pontos)).toBe(false);
    expect(passoPassageiroCompleto(3, { ...r, descontaFaltas: true, valorFalta: "15" }, pontos)).toBe(true);
  });
  it("is never saved for por viagem or diário", () => {
    const p = passageiroDeRascunho({ ...r, plano: "diario", descontaFaltas: true, valorFalta: "15" }, "d");
    expect(p.descontaFaltas).toBe(false);
    expect(p.valorFalta).toBeNull();
  });
});
