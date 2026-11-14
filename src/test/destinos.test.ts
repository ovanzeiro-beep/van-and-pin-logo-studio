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

describe("Volta em outro dia", () => {
  const excursao = { tipo: "avulsa" as const, data: "2026-11-28", saida: "04:30", volta: "19:00", voltaData: "2026-11-29" };
  const noturna = { tipo: "fixa" as const, data: null, saida: "22:00", volta: "06:00", voltaData: null };
  const faculdade = { tipo: "fixa" as const, data: null, saida: "06:40", volta: "17:50", voltaData: null };

  it("viagem avulsa: volta na data escolhida", async () => {
    const { dataDaVolta, textoDaVolta } = await import("@/lib/destinos");
    expect(dataDaVolta(excursao, "2026-11-28")).toBe("2026-11-29");
    expect(textoDaVolta(excursao)).toBe("29/11, 19:00");
    expect(textoDaVolta({ ...excursao, voltaData: null })).toBe("19:00");
  });

  it("rota fixa: volta mais cedo que a saída é no dia seguinte; senão, no mesmo dia", async () => {
    const { dataDaVolta, textoDaVolta, voltaNoDiaSeguinte } = await import("@/lib/destinos");
    expect(voltaNoDiaSeguinte(noturna)).toBe(true);
    expect(dataDaVolta(noturna, "2026-11-13")).toBe("2026-11-14");
    expect(textoDaVolta(noturna)).toBe("06:00 do dia seguinte");
    expect(dataDaVolta(faculdade, "2026-11-13")).toBe("2026-11-13");
    expect(textoDaVolta(faculdade)).toBe("17:50");
    expect(textoDaVolta({ ...faculdade, volta: null })).toBe("Sem volta");
  });

  it("cadastro: 'Em outro dia' pede a data da volta depois da data da ida, e ela fica guardada", () => {
    const r = { ...rascunhoVazio(), origem: "A", destino: "B", tipo: "avulsa" as const, data: "2026-11-28", saida: "04:30", temVolta: true, volta: "19:00", voltaOutroDia: true };
    expect(passoCompleto(2, { ...r, dataVolta: "" })).toBe(false);
    expect(passoCompleto(2, { ...r, dataVolta: "2026-11-28" })).toBe(false);
    expect(passoCompleto(2, { ...r, dataVolta: "2026-11-29" })).toBe(true);
    expect(destinoDeRascunho({ ...r, dataVolta: "2026-11-29" }).voltaData).toBe("2026-11-29");
    expect(destinoDeRascunho({ ...r, voltaOutroDia: false, dataVolta: "2026-11-29" }).voltaData).toBeNull();
    expect(destinoDeRascunho({ ...r, tipo: "fixa", dias: ["seg"], dataVolta: "2026-11-29" }).voltaData).toBeNull();
  });
});
