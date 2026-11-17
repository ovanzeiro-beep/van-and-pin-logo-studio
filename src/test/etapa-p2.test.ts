import { describe, expect, it } from "vitest";
import { linkDoMapa } from "@/lib/viagem";

describe("Etapa P2: Ir até lá navega até o ponto marcado", () => {
  it("com ponto: abre nas coordenadas; sem ponto: pelo endereço escrito", () => {
    expect(linkDoMapa({ endereco: "Rua Paraná, 210", cidade: "Jacarezinho", ponto: { lat: -23.1638, lng: -49.9721 } })).toBe(
      "https://www.google.com/maps/dir/?api=1&destination=-23.1638%2C-49.9721&travelmode=driving&dir_action=navigate",
    );
    expect(linkDoMapa({ endereco: "Rua Paraná, 210", cidade: "Jacarezinho" })).toBe(
      "https://www.google.com/maps/dir/?api=1&destination=Rua%20Paran%C3%A1%2C%20210%2C%20Jacarezinho&travelmode=driving&dir_action=navigate",
    );
  });
});
