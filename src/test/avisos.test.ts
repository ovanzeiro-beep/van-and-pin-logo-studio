import { describe, expect, it } from "vitest";
import { avisosExemplo } from "@/data/exemplo";
import { avisosDaPessoa, marcarTodosComoLido, obterAvisos, obterAvisosNaoLidos } from "@/lib/avisos-store";

describe("Avisos lidos", () => {
  it("todos os avisos da pessoa, mais novos primeiro, sem os de outras pessoas", () => {
    const daJuliana = avisosDaPessoa(obterAvisos(), "p-juliana");
    expect(daJuliana.length).toBeGreaterThan(0);
    expect(daJuliana.every((a) => a.paraVanzeiroOuPassageiroId === "p-juliana")).toBe(true);
    expect(daJuliana.map((a) => a.dataCriacao)).toEqual([...daJuliana.map((a) => a.dataCriacao)].sort().reverse());
  });

  it("abrir Notificações deixa os avisos da pessoa como lidos, numa lista nova, sem mexer nos de outros", () => {
    const antes = obterAvisos();
    const doVanzeiro = obterAvisosNaoLidos("vanzeiro-carlos").length;
    expect(obterAvisosNaoLidos("p-juliana").length).toBeGreaterThan(0);
    marcarTodosComoLido("p-juliana");
    expect(obterAvisosNaoLidos("p-juliana")).toEqual([]);
    expect(obterAvisos()).not.toBe(antes);
    expect(obterAvisosNaoLidos("vanzeiro-carlos").length).toBe(doVanzeiro);
    expect(avisosDaPessoa(obterAvisos(), "p-juliana").length).toBe(avisosDaPessoa(antes, "p-juliana").length);
  });

  it("os dados de exemplo não mudam (recarregar a página volta ao início)", () => {
    expect(avisosExemplo.some((a) => a.paraVanzeiroOuPassageiroId === "p-juliana" && !a.lido)).toBe(true);
  });
});
