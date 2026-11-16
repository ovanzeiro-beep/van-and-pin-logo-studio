import { describe, expect, it } from "vitest";
import { DATA_DE_HOJE, destinosExemplo } from "@/data/exemplo";
import { obterDestinos } from "@/lib/destinos-store";
import { excluirDestino, pausarOuAtivarDestino } from "@/lib/exclusoes";
import { iniciarViagem, viagemDaAba, viagemDoInicio } from "@/lib/viagem";
import { comecarViagem, obterViagensDoDia } from "@/lib/viagem-store";
import { viagensFeitas } from "@/lib/viagens-encerradas-store";

const hoje = DATA_DE_HOJE;

describe("Etapa G1: a aba Viagem abre na mesma viagem do Início", () => {
  it("sem escolha, as duas mostram a próxima viagem do dia", () => {
    const { escolhida, viagens } = obterViagensDoDia();
    expect(escolhida).toBe("");
    const inicio = viagemDoInicio(destinosExemplo, viagens, hoje).destino;
    expect(viagemDaAba(destinosExemplo, escolhida, viagens, hoje)?.id).toBe(inicio?.id);
  });

  it("depois de uma viagem feita, sem escolha, segue o Início (a próxima não feita)", () => {
    const londrina = destinosExemplo.find((d) => d.id === "jacarezinho-londrina")!;
    const viagens = { [londrina.id]: { fase: "encerrada" as const } };
    expect(viagemDaAba(destinosExemplo, "", viagens, hoje)?.id).toBe("centro-unisul");
  });

  it("a escolha do vanzeiro vale", () => {
    expect(viagemDaAba(destinosExemplo, "centro-unisul", {}, hoje)?.id).toBe("centro-unisul");
  });
});

describe("Etapa G2/G3: o Histórico guarda o destino como era no dia", () => {
  it("a viagem tira uma foto do nome e dos horários ao começar", () => {
    const d = destinosExemplo.find((x) => x.id === "jacarezinho-londrina")!;
    expect(iniciarViagem(d, [], hoje).foto).toEqual({ nome: "Jacarezinho → Londrina", saida: "06:00", volta: "18:30" });
  });

  it("mudar o destino depois não muda a viagem feita", () => {
    const d = destinosExemplo.find((x) => x.id === "jacarezinho-londrina")!;
    const feita = { ...iniciarViagem(d, ["a"], hoje), fase: "encerrada" as const };
    const [depois] = viagensFeitas([], { [d.id]: feita });
    expect(depois?.foto.saida).toBe("06:00");
  });

  it("excluir o destino não tira as viagens dele do Histórico", () => {
    const passadas = viagensFeitas(
      [{ vanzeiroId: "v", destinoId: "sumiu", data: "2026-11-01", temVolta: false, foto: { nome: "X → Y", saida: "07:00", volta: "Sem volta" }, embarcaram: [], naoEstavam: [], ficaram: [] }],
      {},
    );
    expect(passadas.map((v) => v.foto.nome)).toEqual(["X → Y"]);
  });
});

describe("Etapa G4: não dá para pausar com a viagem em andamento", () => {
  it("pausar avisa e não muda nada; depois de terminar funciona; ativar funciona sempre", () => {
    const d = obterDestinos().find((x) => x.id === "jacarezinho-londrina")!;
    comecarViagem(d, []);
    expect(pausarOuAtivarDestino(d.id).ok).toBe(false);
    expect(obterDestinos().find((x) => x.id === d.id)?.ativo).toBe(true);
    expect(excluirDestino(d.id).ok).toBe(false);

    const outro = obterDestinos().find((x) => x.id === "centro-unisul")!;
    expect(pausarOuAtivarDestino(outro.id).ok).toBe(true);
    expect(obterDestinos().find((x) => x.id === outro.id)?.ativo).toBe(false);
    expect(pausarOuAtivarDestino(outro.id).ok).toBe(true);
    expect(obterDestinos().find((x) => x.id === outro.id)?.ativo).toBe(true);
  });
});
