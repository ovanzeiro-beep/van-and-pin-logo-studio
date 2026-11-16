import { describe, expect, it } from "vitest";
import { destinosExemplo } from "@/data/exemplo";
import { linkParaOGrupo, resumoParaOGrupo } from "@/lib/resumo-do-grupo";

const destino = destinosExemplo.find((d) => d.id === "centro-unisul")!;
const p = (id: string, nome: string, cidade = "Jacarezinho") => ({ id, nome, cidade });

describe("T4: resumo do dia para o grupo da van", () => {
  it("saída, quantos vão e a ordem da busca, só com nome e cidade (sem endereço)", () => {
    const t = resumoParaOGrupo({
      destino,
      data: "2026-11-13",
      vao: [p("1", "Mariana Souza"), p("2", "Pedro Henrique Lima", "Cambará")],
      semResposta: [],
      prazo: "05:40",
      lugares: 15,
    });
    expect(t).toContain(`Saída ${destino.saida}`);
    expect(t).toContain("Vão: 2 pessoas (a van tem 15 lugares)");
    expect(t).toContain("Ordem da busca:\n1. Mariana (Jacarezinho)\n2. Pedro (Cambará)");
    expect(t).not.toContain("Ainda não responderam");
    expect(t).not.toMatch(/Rua|Praça/);
  });

  it("lista quem ainda não respondeu, com o prazo; nomes iguais aparecem completos", () => {
    const t = resumoParaOGrupo({
      destino,
      data: "2026-11-13",
      vao: [p("1", "Juliana Alves")],
      semResposta: [{ id: "2", nome: "Juliana Costa" }, { id: "3", nome: "Thiago Nunes" }],
      prazo: "05:40",
      lugares: null,
    });
    expect(t).toContain("Vão: 1 pessoa\n");
    expect(t).toContain("1. Juliana Alves (Jacarezinho)");
    expect(t).toContain("Ainda não responderam (até 05:40): Juliana Costa, Thiago.");
  });

  it("abre o WhatsApp sem número, para o vanzeiro escolher o grupo", () => {
    expect(linkParaOGrupo("Olá\nTudo")).toBe("https://wa.me/?text=Ol%C3%A1%0ATudo");
  });
});
