import { describe, expect, it } from "vitest";
import { destinoCheio, textoDaOcupacao, VAN_CHEIA } from "@/lib/lugares";
import { obterPassageiros, salvarPassageiro } from "@/lib/passageiros-store";
import { obterPerfilDoVanzeiro, salvarPerfilVanzeiro } from "@/lib/vanzeiro-store";

describe("E1: os lugares da van valem para quem está no destino", () => {
  it("texto e van cheia", () => {
    expect(textoDaOcupacao(1, 15)).toBe("1 de 15 lugares ocupados");
    expect(textoDaOcupacao(2, null)).toBe("2 passageiros");
    expect(destinoCheio(14, 15)).toBe(false);
    expect(destinoCheio(15, 15)).toBe(true);
    expect(destinoCheio(99, null)).toBe(false);
  });

  it("com todos os lugares ocupados, ninguém novo entra; quem já está continua podendo ser editado", () => {
    const noDestino = obterPassageiros().filter((p) => p.destinoId === "centro-unisul");
    const perfil = obterPerfilDoVanzeiro("vanzeiro-carlos");
    salvarPerfilVanzeiro({ ...perfil, van: { ...perfil.van, lugares: noDestino.length } });
    const novo = {
      ...noDestino[0]!,
      id: "p-novo-cheio",
      nome: "Novo",
      telefone: "43999990999",
      pessoaId: undefined,
    };
    expect(salvarPassageiro(novo)).toEqual({ ok: false, motivo: VAN_CHEIA });
    expect(salvarPassageiro({ ...noDestino[0]!, valor: noDestino[0]!.valor + 100 })).toEqual({
      ok: true,
    });
    salvarPerfilVanzeiro({ ...perfil, van: { ...perfil.van, lugares: noDestino.length + 1 } });
    expect(salvarPassageiro(novo)).toEqual({ ok: true });
  });
});
