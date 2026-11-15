import { describe, expect, it } from "vitest";
import { obterCoordenadas, procurarCidades, type Ponto } from "@/lib/coordenadas-store";
import { cidadesNoMapa } from "@/lib/mapa";

const ourinhos = { lat: -22.9789, lng: -49.8708 };

describe("Etapa P3: o mapa aprende cidades novas", () => {
  it("procura só o que não conhece, perto da primeira cidade conhecida (a origem)", async () => {
    const pedidas: { nome: string; perto?: Ponto | undefined }[] = [];
    await procurarCidades(["Jacarezinho", "Ourinhos"], async (nome, perto) => {
      pedidas.push({ nome, perto });
      return ourinhos;
    }, 0);
    expect(pedidas).toEqual([{ nome: "Ourinhos", perto: { lat: -23.1606, lng: -49.9692 } }]);
    expect(obterCoordenadas()["Ourinhos"]).toEqual(ourinhos);
    expect(cidadesNoMapa({ origem: "Jacarezinho", destino: "Ourinhos", paradas: [] }).map((c) => c.nome)).toEqual(["Jacarezinho", "Ourinhos"]);
  });

  it("cidade não achada (erro de digitação) não é procurada de novo", async () => {
    let vezes = 0;
    const nenhuma = async () => {
      vezes++;
      return null;
    };
    await procurarCidades(["Jacarezinhoo"], nenhuma, 0);
    await procurarCidades(["Jacarezinhoo"], nenhuma, 0);
    expect(vezes).toBe(1);
    expect(obterCoordenadas()["Jacarezinhoo"]).toBeUndefined();
  });

  it("sem internet: nada se perde e tenta de novo depois", async () => {
    await procurarCidades(["Bandeirantes"], async () => {
      throw new Error("sem internet");
    }, 0);
    expect(obterCoordenadas()["Bandeirantes"]).toBeUndefined();
    await procurarCidades(["Bandeirantes"], async () => ({ lat: -23.11, lng: -50.37 }), 0);
    expect(obterCoordenadas()["Bandeirantes"]).toEqual({ lat: -23.11, lng: -50.37 });
  });

  it("espera entre uma busca e outra (o serviço gratuito pede no máximo uma por segundo)", async () => {
    const horas: number[] = [];
    await procurarCidades(["Cidade A", "Cidade B"], async () => {
      horas.push(Date.now());
      return { lat: -23, lng: -50 };
    }, 120);
    expect(horas[1]! - horas[0]!).toBeGreaterThanOrEqual(110);
  });
});
