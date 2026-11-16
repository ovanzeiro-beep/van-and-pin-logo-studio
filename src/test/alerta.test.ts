import { describe, expect, it, vi } from "vitest";
import { tocarAlerta, VIBRACAO } from "@/lib/alerta";

describe("Alerta com o app aberto", () => {
  it("vibra (uma forte, depois devagar e aumentando) e não repete para a mesma novidade (3 s)", () => {
    const vibrar = vi.fn();
    Object.defineProperty(navigator, "vibrate", { value: vibrar, configurable: true });
    expect(tocarAlerta(10_000)).toBe(true);
    expect(vibrar).toHaveBeenCalledWith(VIBRACAO);
    // A strong one first, then the pulses grow.
    const pulsos = VIBRACAO.filter((_, i) => i % 2 === 0).slice(1);
    expect(pulsos).toEqual([...pulsos].sort((a, b) => a - b));
    expect(tocarAlerta(11_000)).toBe(false);
    expect(tocarAlerta(14_000)).toBe(true);
  });
});
