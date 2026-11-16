import { describe, expect, it } from "vitest";
import { quandoFoi } from "@/components/app/ListaDeAvisos";
import {
  avisosDaPessoa,
  criarAvisoUmaVez,
  limparAvisosDaPessoa,
  obterAvisos,
  obterAvisosNaoLidos,
} from "@/lib/avisos-store";

const aviso = {
  vanzeiroId: "v",
  tipo: "cobranca_vencida" as const,
  paraVanzeiroOuPassageiroId: "v",
  destinoId: "d",
  chave: "cobranca_vencida_c1",
  dataCriacao: "2026-11-13",
  lido: false,
  textoResumido: "Ana está devendo",
};

describe("Sininho: Limpar", () => {
  it("os avisos saem da lista e do número do sininho, e o mesmo aviso não volta", () => {
    criarAvisoUmaVez(aviso);
    expect(avisosDaPessoa(obterAvisos(), "v")).toHaveLength(1);
    limparAvisosDaPessoa("v");
    expect(avisosDaPessoa(obterAvisos(), "v")).toEqual([]);
    expect(obterAvisosNaoLidos("v")).toEqual([]);
    criarAvisoUmaVez(aviso);
    expect(avisosDaPessoa(obterAvisos(), "v")).toEqual([]);
  });

  it("a data do aviso: Hoje, Ontem ou o dia", () => {
    expect(quandoFoi("2026-11-16", "2026-11-16")).toBe("Hoje");
    expect(quandoFoi("2026-11-15", "2026-11-16")).toBe("Ontem");
    expect(quandoFoi("2026-11-08", "2026-11-16")).toBe("08/11");
  });
});
