import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { destinosExemplo, passageirosExemplo } from "@/data/exemplo";
import { gerarConviteUnico } from "@/lib/convite";
import { destinoDeRascunho, rascunhoVazio } from "@/lib/destinos";
import { obterPassageiros, obterPedidos, recusarPedido } from "@/lib/passageiros-store";
import { obterRespostasParaTeste, responder } from "@/lib/respostas-store";
import { listaDaViagem } from "@/lib/viagem";
import { comecarViagem, obterViagensDoDia } from "@/lib/viagem-store";
import { dataDeHoje } from "@/lib/agora";

// Rules of section 6 of CLAUDE.md that had no test of their own. The others are in
// cadastro, acesso, sessao, destinos, passageiros, viagem, cobrancas, etapa7b and dono tests.

// Às 05:10 (agora nos exemplos): Cambará → UENP sai 06:40, prazo 05:40 (aberto); Jacarezinho → Londrina sai 06:00, prazo 05:00 (fechado).
const cambara = destinosExemplo.find((d) => d.id === "centro-unisul")!;

describe("Destinos", () => {
  it("destino novo começa com 'Confirmar até' 1 hora antes da saída", () => {
    const d = destinoDeRascunho({ ...rascunhoVazio(), origem: "A", destino: "B", tipo: "fixa", dias: ["seg"], saida: "07:00", temVolta: false });
    expect(d.prazo).toBe("1h");
  });

  it("cada destino novo ganha um código de convite que não se repete", () => {
    const usados = new Set(destinosExemplo.map((d) => d.convite));
    for (let i = 0; i < 200; i++) {
      const codigo = gerarConviteUnico();
      expect(codigo).toMatch(/^VAN-\d{4}$/);
      expect(usados.has(codigo)).toBe(false);
      usados.add(codigo);
    }
  });
});

describe("Passageiros", () => {
  it("o vanzeiro recusa um pedido: o pedido sai e a pessoa não vira passageiro", () => {
    const pedido = obterPedidos()[0]!;
    recusarPedido(pedido.id);
    expect(obterPedidos().some((p) => p.id === pedido.id)).toBe(false);
    expect(obterPassageiros().some((p) => p.nome === pedido.nome)).toBe(false);
  });
});

describe("Confirmação", () => {
  it("o passageiro pode mudar 'Vou' / 'Não vou' até o prazo", () => {
    responder("p-juliana", dataDeHoje(), "vai");
    expect(obterRespostasParaTeste(dataDeHoje())["p-juliana"]).toBe("vai");
    responder("p-juliana", dataDeHoje(), "nao-vai");
    expect(obterRespostasParaTeste(dataDeHoje())["p-juliana"]).toBe("nao-vai");
  });

  it("depois do prazo a resposta não muda mais", () => {
    expect(obterRespostasParaTeste(dataDeHoje())["p-juliana-londrina"]).toBeUndefined();
    responder("p-juliana-londrina", dataDeHoje(), "vai");
    expect(obterRespostasParaTeste(dataDeHoje())["p-juliana-londrina"]).toBeUndefined();
  });

  it("quem não confirmou ou disse 'Não vou' não entra na busca", () => {
    const respostas = obterRespostasParaTeste(dataDeHoje());
    const lista = listaDaViagem(passageirosExemplo, cambara, respostas);
    comecarViagem(cambara, lista.vao.map((p) => p.id));
    const ordem = obterViagensDoDia().viagens[cambara.id]!.ordem;
    const foraDaBusca = passageirosExemplo.filter((p) => p.destinoId === cambara.id && respostas[p.id] !== "vai").map((p) => p.id);
    expect(foraDaBusca.length).toBeGreaterThan(0);
    expect(ordem.length).toBeGreaterThan(0);
    expect(ordem.some((id) => foraDaBusca.includes(id))).toBe(false);
  });

  it("com a viagem começada, a resposta não muda mais, mesmo antes do prazo", () => {
    responder("p-juliana", dataDeHoje(), "vai");
    expect(obterRespostasParaTeste(dataDeHoje())["p-juliana"]).toBe("nao-vai");
  });
});

describe("Viagem", () => {
  // "Estou na van" pelo celular: viagem.test.ts ("Conferência pelo celular do passageiro").
  it("'Ficou aqui' é só do vanzeiro: nenhuma tela do passageiro usa a conferência do vanzeiro", () => {
    expect(arquivosDoPassageiro().filter((f) => /\bconferir\(/.test(readFileSync(f, "utf8")))).toEqual([]);
  });
});

describe("Dinheiro", () => {
  it("nenhuma tela do passageiro marca cobrança como paga ou cancela", () => {
    expect(arquivosDoPassageiro().filter((f) => /marcarComoPago|cancelarCobranca/.test(readFileSync(f, "utf8")))).toEqual([]);
  });
});

function arquivosDoPassageiro() {
  const src = join(__dirname, "..");
  const telas = readdirSync(join(src, "routes")).filter((n) => n.startsWith("passageiro")).map((n) => join(src, "routes", n));
  const pecas = readdirSync(join(src, "components/app/passageiro")).map((n) => join(src, "components/app/passageiro", n));
  expect(telas.length).toBeGreaterThan(3);
  return [...telas, ...pecas];
}
