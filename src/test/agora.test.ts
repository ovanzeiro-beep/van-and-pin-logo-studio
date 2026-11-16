import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { agora, dataDeHoje, emBrasilia, FUSO_DO_APP, horaDeAgora } from "@/lib/agora";

const SRC = join(__dirname, "..");

function arquivos(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const c = join(dir, n);
    if (statSync(c).isDirectory()) return arquivos(c);
    return /\.(ts|tsx)$/.test(n) ? [c] : [];
  });
}

const doApp = arquivos(SRC)
  .map((c) => relative(SRC, c).replaceAll("\\", "/"))
  .filter((c) => !c.startsWith("test/") && !c.startsWith("data/") && c !== "lib/agora.ts");

describe("Data e hora de um lugar só", () => {
  it("hoje é 13/11/2026, 05:10 nos exemplos", () => {
    expect(dataDeHoje()).toBe("2026-11-13");
    expect(horaDeAgora()).toBe("05:10");
    expect(agora()).toEqual({ data: "2026-11-13", hora: "05:10" });
  });

  it("nenhum arquivo do app lê a data ou a hora de exemplo direto", () => {
    const fora = doApp.filter((c) => /\b(DATA_DE_HOJE|HORA_DE_AGORA)\b/.test(readFileSync(join(SRC, c), "utf8")));
    expect(fora).toEqual([]);
  });

  it("nenhum arquivo do app lê o relógio do celular para mostrar hora", () => {
    const fora = doApp.filter((c) => /new Date\(\)|getHours\(\)/.test(readFileSync(join(SRC, c), "utf8")));
    expect(fora).toEqual([]);
  });
});

describe("Q4: sempre no horário de Brasília", () => {
  it("à noite, o horário do mundo (UTC) já é o dia seguinte; Brasília ainda não", () => {
    expect(emBrasilia(new Date("2026-11-16T23:30:00Z"))).toEqual({ data: "2026-11-16", hora: "20:30" });
    expect(emBrasilia(new Date("2026-11-17T01:30:00Z"))).toEqual({ data: "2026-11-16", hora: "22:30" });
    expect(emBrasilia(new Date("2026-11-17T02:59:00Z"))).toEqual({ data: "2026-11-16", hora: "23:59" });
    expect(emBrasilia(new Date("2026-11-17T03:00:00Z"))).toEqual({ data: "2026-11-17", hora: "00:00" });
  });

  it("de manhã cedo (a hora das vans) e na virada do mês e do ano", () => {
    expect(emBrasilia(new Date("2026-11-13T08:10:00Z"))).toEqual({ data: "2026-11-13", hora: "05:10" });
    expect(emBrasilia(new Date("2026-12-01T02:00:00Z"))).toEqual({ data: "2026-11-30", hora: "23:00" });
    expect(emBrasilia(new Date("2027-01-01T02:30:00Z"))).toEqual({ data: "2026-12-31", hora: "23:30" });
  });

  it("o fuso do app é o de Brasília", () => {
    expect(FUSO_DO_APP).toBe("America/Sao_Paulo");
  });
});
