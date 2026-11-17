import { describe, expect, it } from "vitest";
import {
  acharEndereco,
  avisoDeLonge,
  enderecoDoPonto,
  erroDoGps,
  minhaLocalizacao,
  textoDoEndereco,
  urlDaBuscaDeEndereco,
} from "@/lib/ponto-de-embarque";

const jacarezinho = { lat: -23.1606, lng: -49.9692 };

describe("N1: capturar o ponto de embarque", () => {
  it("procura o endereço escrito só dentro da cidade escolhida, no Brasil", () => {
    const url = urlDaBuscaDeEndereco(" Rua Paraná, 455 ", "Jacarezinho", jacarezinho);
    expect(url).toContain("q=Rua%20Paran%C3%A1%2C%20455%2C%20Jacarezinho");
    expect(url).toContain("countrycodes=br");
    expect(url).toContain("bounded=1");
    expect(url).toContain("viewbox=-50.1692,-22.9606,-49.7692,-23.3606");
  });

  it("devolve o ponto achado, ou nada quando o mapa não conhece", async () => {
    expect(
      await acharEndereco("Rua Paraná, 455", "Jacarezinho", jacarezinho, async () => [
        { lat: "-23.16", lon: "-49.97" },
      ]),
    ).toEqual({
      lat: -23.16,
      lng: -49.97,
    });
    expect(
      await acharEndereco("Rua Inventada", "Jacarezinho", jacarezinho, async () => []),
    ).toBeNull();
  });

  it("sem internet, a busca avisa (erro) para a tela mostrar a mensagem", async () => {
    await expect(
      acharEndereco("Rua X", "Jacarezinho", jacarezinho, async () =>
        Promise.reject(new Error("offline")),
      ),
    ).rejects.toThrow();
  });

  it("monta o endereço com rua e número; sem rua, usa o bairro", () => {
    expect(textoDoEndereco({ road: "Rua Paraná", house_number: "455" })).toBe("Rua Paraná, 455");
    expect(textoDoEndereco({ road: "Rua Paraná" })).toBe("Rua Paraná");
    expect(textoDoEndereco({ suburb: "Vila Setti" })).toBe("Vila Setti");
    expect(textoDoEndereco(undefined)).toBe("");
  });

  it("o nome da rua do GPS nunca quebra a tela: sem internet volta vazio", async () => {
    expect(
      await enderecoDoPonto(jacarezinho, async () => ({
        address: { road: "Rua Paraná", house_number: "455" },
      })),
    ).toBe("Rua Paraná, 455");
    expect(
      await enderecoDoPonto(jacarezinho, async () => Promise.reject(new Error("offline"))),
    ).toBe("");
  });

  it("GPS: devolve o ponto; recusado ou sem GPS vira mensagem simples", async () => {
    const ok = await minhaLocalizacao({
      getCurrentPosition: (sucesso) =>
        sucesso({ coords: { latitude: -23.1, longitude: -49.9 } } as GeolocationPosition),
    });
    expect(ok).toEqual({ ok: true, ponto: { lat: -23.1, lng: -49.9 } });
    const negado = await minhaLocalizacao({
      getCurrentPosition: (_s, erro) => erro?.({ code: 1 } as GeolocationPositionError),
    });
    expect(negado).toEqual({ ok: false, erro: erroDoGps(1) });
    expect(erroDoGps(1)).toContain("Permita a localização");
    expect((await minhaLocalizacao(undefined)).ok).toBe(false);
  });

  it("avisa quando o ponto fica longe da cidade escolhida (mais de 30 km)", () => {
    expect(avisoDeLonge({ lat: -23.17, lng: -49.97 }, "Jacarezinho", jacarezinho)).toBeNull();
    expect(avisoDeLonge({ lat: -23.31, lng: -51.16 }, "Jacarezinho", jacarezinho)).toBe(
      "Esse ponto fica longe de Jacarezinho. Confira a cidade escolhida e o pino no mapa.",
    );
    expect(avisoDeLonge({ lat: -23.31, lng: -51.16 }, "Jacarezinho", undefined)).toBeNull();
  });
});
