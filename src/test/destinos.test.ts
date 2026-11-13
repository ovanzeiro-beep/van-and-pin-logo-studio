import { describe, expect, it } from "vitest";
import {
  destinoDeRascunho,
  formatarData,
  formatarDias,
  moverItem,
  passoCompleto,
  rascunhoVazio,
} from "@/lib/destinos";

describe("Dias e datas dos destinos", () => {
  it("shows monday to friday as 'Seg a sex'", () => {
    expect(formatarDias(["seg", "ter", "qua", "qui", "sex"])).toBe("Seg a sex");
  });
  it("lists friday, saturday and sunday", () => {
    expect(formatarDias(["dom", "sex", "sab"])).toBe("Sex, sáb e dom");
  });
  it("formats a one-time trip date", () => {
    expect(formatarData("2026-11-28")).toBe("Sáb, 28 de nov");
  });
});

describe("Passos do cadastro", () => {
  it("step 1 needs origem, destino and tipo", () => {
    const r = { ...rascunhoVazio(), origem: "Jacarezinho", destino: "Londrina" };
    expect(passoCompleto(1, r)).toBe(false);
    expect(passoCompleto(1, { ...r, tipo: "fixa" })).toBe(true);
  });
  it("step 2 of a rota fixa needs at least one weekday", () => {
    const r = { ...rascunhoVazio(), tipo: "fixa" as const, saida: "06:00", temVolta: false };
    expect(passoCompleto(2, r)).toBe(false);
    expect(passoCompleto(2, { ...r, dias: ["sex" as const] })).toBe(true);
  });
  it("step 2 of a viagem avulsa needs a date", () => {
    const r = { ...rascunhoVazio(), tipo: "avulsa" as const, saida: "06:00", temVolta: false };
    expect(passoCompleto(2, r)).toBe(false);
    expect(passoCompleto(2, { ...r, data: "2026-11-28" })).toBe(true);
  });
  it("step 2 needs the return time when there is a volta", () => {
    const r = { ...rascunhoVazio(), tipo: "fixa" as const, dias: ["seg" as const], saida: "06:00", temVolta: true };
    expect(passoCompleto(2, r)).toBe(false);
    expect(passoCompleto(2, { ...r, volta: "18:00" })).toBe(true);
  });
});

describe("Salvar destino", () => {
  it("a trip without volta is saved with no return time", () => {
    const d = destinoDeRascunho({
      ...rascunhoVazio(),
      origem: "A",
      destino: "B",
      tipo: "fixa",
      dias: ["seg"],
      saida: "06:00",
      temVolta: false,
      volta: "18:00",
    });
    expect(d.volta).toBeNull();
    expect(d.ativo).toBe(true);
  });
  it("moves a stop up in the path", () => {
    expect(moverItem(["Platina", "Cornélio"], 1, 0)).toEqual(["Cornélio", "Platina"]);
  });
});
