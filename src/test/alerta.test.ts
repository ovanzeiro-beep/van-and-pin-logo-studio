import { describe, expect, it, vi } from "vitest";
import { tocarAlerta } from "@/lib/alerta";

describe("Alerta com o app aberto", () => {
  it("vibra forte e não repete para a mesma novidade (3 s)", () => {
    const vibrar = vi.fn();
    Object.defineProperty(navigator, "vibrate", { value: vibrar, configurable: true });
    expect(tocarAlerta(10_000)).toBe(true);
    expect(vibrar).toHaveBeenCalledWith([400, 150, 400, 150, 400]);
    expect(tocarAlerta(11_000)).toBe(false);
    expect(tocarAlerta(14_000)).toBe(true);
  });
});
