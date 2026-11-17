import { describe, expect, it } from "vitest";
import {
  acharEndereco,
  cidadeDaRota,
  lugarDoPonto,
  nomeDaCidade,
  textoForaDaRota,
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
    const nada = async () => {};
    expect(
      await enderecoDoPonto(
        jacarezinho,
        async () => ({ address: { road: "Rua Paraná", house_number: "455" } }),
        nada,
      ),
    ).toBe("Rua Paraná, 455");
    expect(
      await enderecoDoPonto(jacarezinho, async () => Promise.reject(new Error("offline")), nada),
    ).toBe("");
  });

  it("rua sem nome no mapa: usa a rua grande mais perto e o bairro; sem nada disso, o bairro", async () => {
    const nada = async () => {};
    const respostas = (z18: object, z16: object) => async (url: string) =>
      url.includes("zoom=18") ? { address: z18 } : { address: z16 };
    expect(
      await enderecoDoPonto(
        jacarezinho,
        respostas({ suburb: "Vila Setti" }, { road: "Estrada do Jacu" }),
        nada,
      ),
    ).toBe("Perto de Estrada do Jacu (Vila Setti)");
    expect(
      await enderecoDoPonto(jacarezinho, respostas({}, { road: "Estrada do Jacu" }), nada),
    ).toBe("Perto de Estrada do Jacu");
    expect(
      await enderecoDoPonto(jacarezinho, respostas({ neighbourhood: "Jardim Europa" }, {}), nada),
    ).toBe("Jardim Europa");
    expect(await enderecoDoPonto(jacarezinho, respostas({}, {}), nada)).toBe("");
  });

  it("espera 1 segundo entre as duas buscas (regra do mapa gratuito)", async () => {
    const esperas: number[] = [];
    await enderecoDoPonto(
      jacarezinho,
      async () => ({ address: {} }),
      async (ms) => {
        esperas.push(ms);
      },
    );
    expect(esperas).toEqual([1100]);
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

  it("mesma cidade com ou sem o estado e os acentos", () => {
    expect(nomeDaCidade("Jacarezinho PR")).toBe("jacarezinho");
    expect(nomeDaCidade("Cambará - PR")).toBe("cambara");
    expect(nomeDaCidade("Santo Antônio da Platina")).toBe("santo antonio da platina");
  });

  it("GPS: marca sozinho a cidade da rota que o mapa diz; fora da rota, nenhuma", () => {
    const rota = [
      { nome: "Jacarezinho PR", ponto: jacarezinho },
      { nome: "Londrina PR", ponto: { lat: -23.3045, lng: -51.1696 } },
    ];
    const emJacarezinho = { lat: -23.17, lng: -49.97 };
    expect(cidadeDaRota(emJacarezinho, "Jacarezinho", rota, "")).toBe("Jacarezinho PR");
    // Chose Londrina but is in Jacarezinho: the city changes to Jacarezinho.
    expect(cidadeDaRota(emJacarezinho, "Jacarezinho", rota, "Londrina PR")).toBe("Jacarezinho PR");
    // Without the name from the map (tap on the map): the chosen city if the point is in it, else the closest.
    expect(cidadeDaRota(emJacarezinho, undefined, rota, "Jacarezinho PR")).toBe("Jacarezinho PR");
    expect(cidadeDaRota(emJacarezinho, undefined, rota, "Londrina PR")).toBe("Jacarezinho PR");
    // In Curitiba: no city of the route.
    expect(
      cidadeDaRota({ lat: -25.43, lng: -49.27 }, "Curitiba", rota, "Jacarezinho PR"),
    ).toBeNull();
    // The map does not know the cities yet: keeps the choice.
    expect(cidadeDaRota(emJacarezinho, undefined, [{ nome: "X" }], "X")).toBe("X");
    expect(textoForaDaRota(["Jacarezinho PR", "Londrina PR"])).toBe(
      "Esse ponto não fica em nenhuma cidade por onde a van passa (Jacarezinho PR, Londrina PR). Marque onde você espera a van.",
    );
  });

  it("o GPS também traz a cidade do mapa", async () => {
    const r = await lugarDoPonto(
      jacarezinho,
      async () => ({ address: { road: "Rua Paraná", city: "Jacarezinho" } }),
      async () => {},
    );
    expect(r).toEqual({ endereco: "Rua Paraná", cidade: "Jacarezinho" });
  });
});
