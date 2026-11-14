import { describe, expect, it } from "vitest";
import { destinosExemplo, passageirosExemplo } from "@/data/exemplo";
import { gerarCobrancas } from "@/lib/cobrancas";
import { destinoDeRascunho, rascunhoVazio } from "@/lib/destinos";
import { passageiroDeRascunho, rascunhoPassageiroVazio } from "@/lib/passageiros";
import { obterPedidos } from "@/lib/passageiros-store";
import { criarConta } from "@/lib/acesso";
import { pedirParaEntrar } from "@/lib/sessao-passageiro";
import { idDoVanzeiro } from "@/lib/sessao";
import { iniciarViagem } from "@/lib/viagem";

const rascunhoDestino = { ...rascunhoVazio(), origem: "A", destino: "B", tipo: "fixa" as const, dias: ["seg" as const], saida: "06:00", temVolta: false };
const rascunhoPassageiro = { ...rascunhoPassageiroVazio(), nome: "Ana", telefone: "43999990000", cidade: "A", endereco: "Rua 1", plano: "mensal" as const, valor: "200", vencimento: "10" };

describe("Todo dado leva o vanzeiro dono", () => {
  it("destino novo é do vanzeiro que está usando o app", () => {
    expect(destinoDeRascunho(rascunhoDestino).vanzeiroId).toBe(idDoVanzeiro());
  });

  it("editar um destino não troca o dono", () => {
    const deOutro = { ...destinosExemplo[0]!, vanzeiroId: "vanzeiro-outro" };
    expect(destinoDeRascunho(rascunhoDestino, deOutro).vanzeiroId).toBe("vanzeiro-outro");
  });

  it("passageiro novo, a cobrança dele e a viagem são do dono do destino", () => {
    const destino = { ...destinoDeRascunho(rascunhoDestino), vanzeiroId: "vanzeiro-outro" };
    const p = passageiroDeRascunho(rascunhoPassageiro, destino);
    expect(p.vanzeiroId).toBe("vanzeiro-outro");
    const [c] = gerarCobrancas(p, "2026-11-01", "2026-12-31", "2026-11-13", { embarques: [], faltas: [] });
    expect(c?.vanzeiroId).toBe("vanzeiro-outro");
    expect(iniciarViagem(destino, [p.id], "2026-11-16").vanzeiroId).toBe("vanzeiro-outro");
  });

  it("pedido para entrar é do dono do destino do código", () => {
    criarConta("Bruna");
    pedirParaEntrar("centro-unisul", "Bruna", "43999991111");
    const pedido = obterPedidos().at(-1);
    expect(pedido?.nome).toBe("Bruna");
    expect(pedido?.vanzeiroId).toBe(destinosExemplo.find((d) => d.id === "centro-unisul")?.vanzeiroId);
  });

  it("os dados de exemplo são todos do vanzeiro de exemplo", () => {
    expect(destinosExemplo.every((d) => d.vanzeiroId === idDoVanzeiro())).toBe(true);
    expect(passageirosExemplo.every((p) => p.vanzeiroId === idDoVanzeiro())).toBe(true);
  });
});
