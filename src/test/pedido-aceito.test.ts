import { describe, expect, it } from "vitest";
import { destinosExemplo } from "@/data/exemplo";
import { criarConta } from "@/lib/acesso";
import { obterAvisos } from "@/lib/avisos-store";
import { identidadePassageiro, passageiroDeRascunho, rascunhoPassageiroVazio } from "@/lib/passageiros";
import { obterPedidos, salvarPassageiro } from "@/lib/passageiros-store";
import { obterMinhasMatriculas, pedirParaEntrar } from "@/lib/sessao-passageiro";

describe("Pedido aceito avisa a pessoa no sininho", () => {
  it("quem pediu recebe 'O vanzeiro aceitou seu pedido para ...'; cadastrar direto não avisa", () => {
    const antes = obterAvisos().filter((a) => a.tipo === "pedido_aceito").length;
    criarConta("Rui Alves");
    pedirParaEntrar("centro-unisul", "Rui Alves", "43999998888");
    const pedido = obterPedidos().at(-1)!;
    const cambara = destinosExemplo.find((d) => d.id === "centro-unisul")!;
    const r = { ...rascunhoPassageiroVazio(pedido), cidade: "Cambará", endereco: "Rua 1", plano: "viagem" as const, valor: "12" };
    salvarPassageiro(passageiroDeRascunho(r, cambara), pedido.id);

    const eu = obterMinhasMatriculas()[0]!;
    const aceitos = obterAvisos().filter((a) => a.tipo === "pedido_aceito");
    expect(aceitos.length).toBe(antes + 1);
    expect(aceitos.at(-1)?.paraVanzeiroOuPassageiroId).toBe(identidadePassageiro(eu));
    expect(aceitos.at(-1)?.textoResumido).toBe("O vanzeiro aceitou seu pedido para Cambará → UENP Jacarezinho");

    const direto = { ...rascunhoPassageiroVazio(), nome: "Ana Nova", telefone: "(43) 99111-2222", cidade: "Cambará", endereco: "Rua 2", plano: "viagem" as const, valor: "12" };
    salvarPassageiro(passageiroDeRascunho(direto, cambara));
    expect(obterAvisos().filter((a) => a.tipo === "pedido_aceito").length).toBe(antes + 1);
  });
});
