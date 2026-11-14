import { describe, expect, it } from "vitest";
import { avisosExemplo, destinosExemplo } from "@/data/exemplo";
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

  it("os avisos da Juliana são encontrados pela identidade dela", () => {
    const eu = obterMinhasMatriculas()[0]!;
    expect(avisosExemplo.filter((a) => a.paraVanzeiroOuPassageiroId === identidadePassageiro(eu)).length).toBeGreaterThan(0);
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
