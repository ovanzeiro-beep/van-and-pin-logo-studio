import { beforeEach, describe, expect, it, vi } from "vitest";

const falso = vi.hoisted(() => ({ rpc: vi.fn() }));
vi.mock("@/lib/supabase", () => ({ USA_BANCO: { conta: true }, supabase: () => falso }));
vi.mock("@/lib/destinos-store", () => ({ obterDestinos: () => [] }));

import { procurarPorCodigo } from "@/lib/convite";

beforeEach(() => falso.rpc.mockReset());

describe("Busca do convite da conta real", () => {
  it("VAN-6187 consulta o serviço e conserva o destino e o vanzeiro retornados, mesmo com a lista local vazia", async () => {
    falso.rpc.mockResolvedValue({ data: [{ id: "destino-outro", origem: "Cambará", destino: "Jacarezinho", paradas: [], saida: "06:00", vanzeiro_nome: "Vanzeiro do convite" }], error: null });
    const resultado = await procurarPorCodigo("van 6187");
    expect(falso.rpc).toHaveBeenCalledWith("destino_pelo_convite", { codigo: "VAN-6187" });
    expect(resultado?.id).toBe("destino-outro");
    expect(resultado?.vanzeiroNome).toBe("Vanzeiro do convite");
  });

  it("convite inexistente não retorna nenhum vanzeiro de exemplo", async () => {
    falso.rpc.mockResolvedValue({ data: [], error: null });
    expect(await procurarPorCodigo("VAN-6187")).toBeNull();
  });

  it("falha de consulta não é tratada como código inexistente", async () => {
    falso.rpc.mockResolvedValue({ data: null, error: { message: "permission denied" } });
    await expect(procurarPorCodigo("VAN-6187")).rejects.toThrow();
  });
});