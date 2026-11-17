import { describe, expect, it } from "vitest";
import { quandoVai } from "@/lib/avisos";

describe("'na' nos dias de semana, 'no' no fim de semana (dono, 17/11)", () => {
  it("hoje, na segunda a sexta, no sábado e domingo", () => {
    expect(quandoVai("2026-11-17", "2026-11-17")).toBe("hoje");
    expect(quandoVai("2026-11-18", "2026-11-17")).toBe("na quarta, 18 de nov");
    expect(quandoVai("2026-11-23", "2026-11-17")).toBe("na segunda, 23 de nov");
    expect(quandoVai("2026-11-20", "2026-11-17")).toBe("na sexta, 20 de nov");
    expect(quandoVai("2026-11-21", "2026-11-17")).toBe("no sábado, 21 de nov");
    expect(quandoVai("2026-11-22", "2026-11-17")).toBe("no domingo, 22 de nov");
  });
});
