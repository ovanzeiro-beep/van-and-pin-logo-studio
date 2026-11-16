import type { ReactNode } from "react";
import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { destinosExemplo, passageirosExemplo } from "@/data/exemplo";
import { useCobrancas } from "@/lib/cobrancas-store";
import { salvarDestino, useDestinos } from "@/lib/destinos-store";
import { PainelDoVanzeiro } from "@/lib/painel";
import { salvarPassageiro, usePassageiros } from "@/lib/passageiros-store";
import { useViagensEncerradasComDetalhes } from "@/lib/viagens-encerradas-store";

// U3: inside the vanzeiro panel, each vanzeiro reads only what is theirs; the passenger panel is not filtered here.
const rosa = "vanzeiro-rosa";
const base = destinosExemplo.find((d) => d.id === "centro-unisul")!;
const pBase = passageirosExemplo.find((p) => p.id === "p-gabriel")!;
salvarDestino({ ...base, id: "destino-da-rosa", vanzeiroId: rosa, convite: "VAN-7171" });
salvarPassageiro({ ...pBase, id: "p-da-rosa", vanzeiroId: rosa, destinoId: "destino-da-rosa", telefone: "43911112222", nome: "Paulo da Rosa" });

const noPainelDe = (dono: string | null) => ({ wrapper: ({ children }: { children: ReactNode }) => <PainelDoVanzeiro.Provider value={dono}>{children}</PainelDoVanzeiro.Provider> });
const ler = (dono: string | null) => {
  const { result } = renderHook(
    () => ({ destinos: useDestinos(), passageiros: usePassageiros(), cobrancas: useCobrancas(), viagens: useViagensEncerradasComDetalhes() }),
    noPainelDe(dono),
  );
  return result.current;
};

describe("U3: cada vanzeiro só vê o que é dele", () => {
  it("no painel do Carlos: nada da Rosa", () => {
    const r = ler("vanzeiro-carlos");
    expect(r.destinos.map((d) => d.id)).not.toContain("destino-da-rosa");
    expect(r.destinos.length).toBe(destinosExemplo.length);
    expect(r.passageiros.map((p) => p.id)).not.toContain("p-da-rosa");
    expect([...r.destinos, ...r.passageiros, ...r.cobrancas, ...r.viagens].every((x) => x.vanzeiroId === "vanzeiro-carlos")).toBe(true);
    expect(r.cobrancas.length).toBeGreaterThan(0);
  });

  it("no painel da Rosa: só o destino e o passageiro dela", () => {
    const r = ler(rosa);
    expect(r.destinos.map((d) => d.id)).toEqual(["destino-da-rosa"]);
    expect(r.passageiros.map((p) => p.id)).toEqual(["p-da-rosa"]);
    expect(r.cobrancas.every((c) => c.vanzeiroId === rosa)).toBe(true);
    expect(r.viagens).toEqual([]);
  });

  it("fora do painel do vanzeiro (painel do passageiro), a leitura não é cortada aqui", () => {
    const r = ler(null);
    expect(r.destinos.map((d) => d.id)).toContain("destino-da-rosa");
    expect(r.destinos.map((d) => d.id)).toContain("centro-unisul");
    expect(r.passageiros.map((p) => p.id)).toContain("p-da-rosa");
  });
});
