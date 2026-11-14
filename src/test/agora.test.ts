import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { agora, dataDeHoje, horaDeAgora } from "@/lib/agora";

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
