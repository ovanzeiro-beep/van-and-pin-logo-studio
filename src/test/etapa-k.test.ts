import { describe, expect, it } from "vitest";
import { DATA_DE_HOJE } from "@/data/exemplo";
import { obterRegistroDasViagens, registrarEmbarque, registrarFalta } from "@/lib/cobrancas-store";
import { obterDestinos } from "@/lib/destinos-store";
import { sairDoDestino } from "@/lib/exclusoes";
import {
  moverPassageiro,
  obterAceitos,
  obterMatriculas,
  obterPassageiros,
  obterPedidos,
  obterSaidas,
  obterTodosOsPedidos,
  recusarPedido,
  salvarPassageiro,
} from "@/lib/passageiros-store";
import { passageiroDeRascunho, rascunhoPassageiroVazio } from "@/lib/passageiros";
import { obterRespostasFechadas } from "@/lib/respostas-store";
import { chegarAoDestino } from "@/lib/viagem";
import { atualizarViagem, comecarViagem, emAndamento, marcarEmbarcou, obterViagensDoDia } from "@/lib/viagem-store";

const hoje = DATA_DE_HOJE;
const passageiro = (id: string) => obterPassageiros().find((p) => p.id === id)!;

describe("Etapa K: embarques e faltas guardados como registro", () => {
  it("embarque vira registro e não se repete", () => {
    const antes = obterRegistroDasViagens().embarques.length;
    registrarEmbarque(passageiro("p-lucas"), hoje);
    registrarEmbarque(passageiro("p-lucas"), hoje);
    const depois = obterRegistroDasViagens().embarques;
    expect(depois.length).toBe(antes + 1);
    expect(depois.at(-1)).toEqual({ passageiroId: "p-lucas", data: hoje, viagemId: undefined });
  });

  it("falta avisada no prazo vira registro; sem aviso no prazo, não", () => {
    const antes = obterRegistroDasViagens().faltas.length;
    registrarFalta(passageiro("p-mariana"), hoje, false);
    expect(obterRegistroDasViagens().faltas.length).toBe(antes);
    registrarFalta(passageiro("p-mariana"), hoje, true);
    registrarFalta(passageiro("p-mariana"), hoje, true);
    expect(obterRegistroDasViagens().faltas.length).toBe(antes + 1);
  });
});

describe("Etapa K: pedidos e matrículas nunca somem", () => {
  it("pedido recusado fica guardado como 'recusado' e sai da lista de espera", () => {
    recusarPedido("pedido-joao");
    expect(obterPedidos().some((p) => p.id === "pedido-joao")).toBe(false);
    expect(obterTodosOsPedidos().find((p) => p.id === "pedido-joao")?.situacao).toBe("recusado");
  });

  it("pedido aceito fica guardado como 'aceito', com a matrícula criada", () => {
    const pedido = obterPedidos().find((p) => p.id === "pedido-larissa")!;
    const londrina = obterDestinos().find((d) => d.id === pedido.destinoId)!;
    const r = { ...rascunhoPassageiroVazio(pedido), cidade: "Jacarezinho", endereco: "Rua 1", plano: "viagem" as const, valor: "45" };
    const novo = passageiroDeRascunho(r, londrina);
    salvarPassageiro(novo, pedido.id);
    const guardado = obterTodosOsPedidos().find((p) => p.id === pedido.id)!;
    expect(guardado.situacao).toBe("aceito");
    expect(guardado.matriculaId).toBe(novo.id);
    expect(obterAceitos()[pedido.id]).toBe(novo.id);
  });

  it("quem sai do destino continua guardado, com o dia da saída", () => {
    expect(sairDoDestino("p-thiago")).toBe(true);
    expect(obterPassageiros().some((p) => p.id === "p-thiago")).toBe(false);
    expect(obterSaidas().find((p) => p.id === "p-thiago")?.saiuEm).toBe(hoje);
    expect(obterMatriculas().some((p) => p.id === "p-thiago")).toBe(true);
  });
});

describe("Etapa K: ordem de busca em campo próprio", () => {
  it("cada cidade de cada destino tem 1, 2, 3…; as setas trocam os números", () => {
    const daCidade = () =>
      obterPassageiros()
        .filter((p) => p.destinoId === "jacarezinho-londrina" && p.cidade === "Jacarezinho")
        .map((p) => [p.id, p.ordem]);
    const antes = daCidade();
    expect(antes.map(([, o]) => o)).toEqual(antes.map((_, i) => i + 1));
    const [primeiro, segundo] = antes;
    moverPassageiro(String(segundo![0]), -1);
    const depois = daCidade();
    expect(depois[0]).toEqual([segundo![0], 1]);
    expect(depois[1]).toEqual([primeiro![0], 2]);
  });
});

describe("Etapa K: a viagem guarda número, início, fim e respostas fechadas", () => {
  it("começar fecha as respostas como registro; terminar marca a hora", () => {
    const d = obterDestinos().find((x) => x.id === "centro-unisul")!;
    comecarViagem(d, ["p-gabriel"]);
    const v = emAndamento(obterViagensDoDia())!;
    expect(v.id).toBe(`centro-unisul_${hoje}`);
    expect(v.comecouEm).toMatch(/^\d\d:\d\d$/);
    expect(obterRespostasFechadas()).toContainEqual({ destinoId: "centro-unisul", data: hoje });
    marcarEmbarcou("p-gabriel");
    atualizarViagem(chegarAoDestino);
    atualizarViagem((x) => ({ ...x, fase: "encerrada" }));
    const feita = obterViagensDoDia().viagens["centro-unisul"]!;
    expect(feita.terminouEm).toMatch(/^\d\d:\d\d$/);
    expect(obterRegistroDasViagens().embarques).toContainEqual({ passageiroId: "p-gabriel", data: hoje, viagemId: `centro-unisul_${hoje}` });
  });
});
