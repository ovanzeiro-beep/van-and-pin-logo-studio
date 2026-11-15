import { describe, expect, it } from "vitest";
import { destinosExemplo } from "@/data/exemplo";
import { entrar, escolherPapel, sair } from "@/lib/acesso";
import { obterDestinos, salvarDestino } from "@/lib/destinos-store";
import { excluirMinhaConta } from "@/lib/exclusoes";
import { identidadePassageiro } from "@/lib/passageiros";
import { obterPassageiros } from "@/lib/passageiros-store";
import { idDoVanzeiro, obterSessao } from "@/lib/sessao";
import { obterMinhasMatriculas } from "@/lib/sessao-passageiro";

describe("Quem usa o app e o papel, num lugar só", () => {
  it("o papel escolhido fica guardado e 'Sair' apaga", () => {
    entrar();
    expect(obterSessao().papel).toBeNull();
    escolherPapel("passageiro");
    expect(obterSessao().papel).toBe("passageiro");
    escolherPapel("vanzeiro");
    expect(obterSessao().papel).toBe("vanzeiro");
    sair();
    expect(obterSessao().papel).toBeNull();
  });

  it("o passageiro de exemplo é a Juliana, nos dois destinos dela", () => {
    const minhas = obterMinhasMatriculas();
    expect(minhas.map((p) => p.id).sort()).toEqual(["p-juliana", "p-juliana-londrina"]);
  });

  it("os avisos da Juliana são encontrados pela identidade dela", async () => {
    const { passarDoTempo } = await import("@/lib/viagem-store");
    const { obterAvisos } = await import("@/lib/avisos-store");
    passarDoTempo();
    const eu = obterMinhasMatriculas()[0]!;
    expect(obterAvisos().filter((a) => a.paraVanzeiroOuPassageiroId === identidadePassageiro(eu)).length).toBeGreaterThan(0);
  });

  it("'Excluir minha conta' do passageiro tira só a própria pessoa dos destinos", () => {
    const antes = obterPassageiros().map((p) => p.id);
    expect(excluirMinhaConta("passageiro")).toBe(true);
    const sairam = antes.filter((id) => !obterPassageiros().some((p) => p.id === id));
    expect(sairam.sort()).toEqual(["p-juliana", "p-juliana-londrina"]);
  });

  it("'Excluir minha conta' do vanzeiro exclui só os destinos dele", () => {
    salvarDestino({ ...destinosExemplo[0]!, id: "de-outro", vanzeiroId: "vanzeiro-outro", convite: "VAN-1111" });
    expect(excluirMinhaConta("vanzeiro")).toBe(true);
    expect(obterDestinos().map((d) => d.id)).toEqual(["de-outro"]);
    expect(obterDestinos().every((d) => d.vanzeiroId !== idDoVanzeiro())).toBe(true);
  });
});

describe("Excluir minha conta com viagem em andamento", () => {
  it("avisa e não exclui nada enquanto a viagem de um destino da conta está em andamento", async () => {
    const { comecarViagem } = await import("@/lib/viagem-store");
    const { contaComViagemEmAndamento } = await import("@/lib/exclusoes");
    const destino = { ...destinosExemplo[1]!, id: "meu-destino", vanzeiroId: idDoVanzeiro(), convite: "VAN-2222" };
    salvarDestino(destino);
    expect(contaComViagemEmAndamento("vanzeiro")).toBe(false);
    comecarViagem(destino, []);
    expect(contaComViagemEmAndamento("vanzeiro")).toBe(true);
    const antes = obterDestinos().length;
    expect(excluirMinhaConta("vanzeiro")).toBe(false);
    expect(obterDestinos().length).toBe(antes);
  });
});

describe("Histórico de viagens do vanzeiro", () => {
  it("mostra as viagens passadas e as que terminaram hoje, e não as que estão em andamento", async () => {
    const { viagensFeitas } = await import("@/lib/viagens-encerradas-store");
    const { iniciarViagem } = await import("@/lib/viagem");
    const base = destinosExemplo[0]!;
    const foto = { nome: "A → B", saida: "06:00", volta: "Sem volta" };
    const passada = { vanzeiroId: "v", destinoId: "a", data: "2026-11-12", temVolta: false, foto, embarcaram: ["x"], naoEstavam: [], ficaram: [] };
    const andando = iniciarViagem({ ...base, id: "b", volta: null, vanzeiroId: "v" }, ["y"], "2026-11-13");
    const terminada = { ...iniciarViagem({ ...base, id: "c", volta: null, vanzeiroId: "v" }, ["z"], "2026-11-13"), fase: "encerrada" as const, embarcaram: ["z"] };
    const lista = viagensFeitas([passada], { b: andando, c: terminada });
    expect(lista.map((v) => v.destinoId)).toEqual(["a", "c"]);
    expect(lista[1]).toEqual({ vanzeiroId: "v", destinoId: "c", data: "2026-11-13", temVolta: false, foto: { nome: "Jacarezinho → Londrina", saida: "06:00", volta: "Sem volta" }, embarcaram: ["z"], naoEstavam: [], ficaram: [] });
  });
});
