import { describe, expect, it } from "vitest";
import { destinoDeRascunho, rascunhoDeDestino, rascunhoVazio } from "@/lib/destinos";
import { pontosDeEmbarque } from "@/lib/passageiros";
import {
  fazerParada,
  minutosAte,
  retomarViagem,
  somarMinutos,
  type ViagemDoDia,
} from "@/lib/viagem";

const rota = {
  origem: "Jacarezinho PR",
  paradas: ["Assis posto tocuman", "Ourinhos"],
  destino: "Iepê SP",
};

describe("Parada do café", () => {
  it("a parada do café não é cidade de embarque", () => {
    expect(
      pontosDeEmbarque({ ...rota, cafe: { parada: "Assis posto tocuman", minutos: 20 } }),
    ).toEqual(["Jacarezinho PR", "Ourinhos", "Iepê SP"]);
    expect(pontosDeEmbarque(rota)).toHaveLength(4);
  });

  it("o destino guarda a parada do café e os minutos; sem a parada, não há café", () => {
    const r = {
      ...rascunhoVazio(),
      ...rota,
      tipo: "fixa" as const,
      dias: ["seg" as const],
      saida: "06:00",
      temVolta: false,
      cafe: "Assis posto tocuman",
      cafeMinutos: 30,
    };
    const d = destinoDeRascunho(r);
    expect(d.cafe).toEqual({ parada: "Assis Posto Tocuman", minutos: 30 });
    expect(rascunhoDeDestino(d).cafe).toBe("Assis Posto Tocuman");
    expect(destinoDeRascunho({ ...r, cafe: "Outra" }).cafe).toBeNull();
    expect(destinoDeRascunho({ ...r, cafe: "" }).cafe).toBeNull();
  });

  it("o café marca até que horas; retomar a viagem limpa o relógio e vai para a conferência", () => {
    const v = {
      fase: "busca",
      ordem: ["a"],
      embarcaram: ["a"],
      naoEstavam: [],
      ficaram: [],
      naVolta: [],
      desceram: [],
      paradasIda: 0,
      paradasVolta: 0,
      conferencia: {},
      peloCelular: [],
    } as unknown as ViagemDoDia;
    const parada = fazerParada(v, "10:40");
    expect(parada).toMatchObject({ fase: "parada", voltaAs: "10:40", paradasIda: 1 });
    expect(fazerParada(v).voltaAs).toBeUndefined();
    const depois = retomarViagem(parada);
    expect(depois.fase).toBe("conferencia");
    expect(depois.voltaAs).toBeUndefined();
  });

  it("relógio: soma os minutos e conta quanto falta", () => {
    expect(somarMinutos("10:25", 20)).toBe("10:45");
    expect(somarMinutos("23:50", 20)).toBe("00:10");
    expect(minutosAte("10:45", "10:30")).toBe(15);
    expect(minutosAte("10:45", "10:50")).toBe(0);
    expect(minutosAte("00:10", "23:55")).toBe(15);
  });
});
