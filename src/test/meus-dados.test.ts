import { describe, expect, it } from "vitest";
import { passageirosExemplo } from "@/data/exemplo";
import { atualizarMeusDados, meusDadosValidos, type MeusDados } from "@/lib/passageiros";

const juliana = passageirosExemplo.find((p) => p.id === "p-juliana")!;
const dados: MeusDados = {
  nome: " Juliana Alves Souza ",
  telefone: "(43) 98888-7777",
  enderecos: { "p-juliana": "Rua Nova, 1", "p-juliana-londrina": "Praça Nova" },
};

describe("Passageiro edita o próprio perfil", () => {
  it("changes name and phone in every destino of the person and each address in its destino", () => {
    const nova = atualizarMeusDados(passageirosExemplo, juliana, dados);
    const cambara = nova.find((p) => p.id === "p-juliana")!;
    const londrina = nova.find((p) => p.id === "p-juliana-londrina")!;
    expect(cambara).toMatchObject({ nome: "Juliana Alves Souza", telefone: "43988887777", endereco: "Rua Nova, 1" });
    expect(londrina).toMatchObject({ nome: "Juliana Alves Souza", telefone: "43988887777", endereco: "Praça Nova" });
  });

  it("keeps city, plan and value, and never touches other people", () => {
    const nova = atualizarMeusDados(passageirosExemplo, juliana, dados);
    const cambara = nova.find((p) => p.id === "p-juliana")!;
    expect(cambara).toMatchObject({ cidade: juliana.cidade, plano: juliana.plano, valor: juliana.valor });
    for (const p of passageirosExemplo.filter((x) => x.id !== "p-juliana" && x.id !== "p-juliana-londrina")) {
      expect(nova.find((x) => x.id === p.id)).toEqual(p);
    }
  });

  it("needs name, phone with DDD and every address", () => {
    expect(meusDadosValidos(dados)).toBe(true);
    expect(meusDadosValidos({ ...dados, nome: " " })).toBe(false);
    expect(meusDadosValidos({ ...dados, telefone: "9888-7777" })).toBe(false);
    expect(meusDadosValidos({ ...dados, enderecos: { ...dados.enderecos, "p-juliana": "" } })).toBe(false);
  });
});
