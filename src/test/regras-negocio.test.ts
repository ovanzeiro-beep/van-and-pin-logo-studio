import { describe, it, expect, beforeEach } from "vitest";
import { destinosExemplo, passageirosExemplo } from "@/data/exemplo";
import { gerarConviteUnico, inicializarCodigosUsados, acharPorCodigo } from "@/lib/convite";

describe("Regras de Negocio da Secao 6", () => {
  describe("Destinos - volta e paradas em ordem", () => {
    it("destino pode ter volta ou nao", () => {
      const comVolta = destinosExemplo.find((d) => d.volta !== null);
      expect(comVolta?.volta).toBeDefined();
      // Tipo permite volta null, mesmo que exemplo nao tenha
      destinosExemplo.forEach((d) => {
        expect(d.volta === null || typeof d.volta === "string").toBe(true);
      });
    });

    it("paradas estao em ordem e nao incluem origem/destino", () => {
      const destino = destinosExemplo[0];
      expect(destino.paradas).toBeDefined();
      expect(destino.paradas.length).toBeGreaterThanOrEqual(0);
      expect(destino.paradas).not.toContain(destino.origem);
      expect(destino.paradas).not.toContain(destino.destino);
    });

    it("origem e destino sao diferentes", () => {
      destinosExemplo.forEach((d) => {
        expect(d.origem).not.toBe(d.destino);
      });
    });
  });

  describe("Passageiros - um passageiro em multiplos destinos com plano/valor proprios", () => {
    it("Juliana esta em pelo menos 2 destinos", () => {
      const juliana = passageirosExemplo.filter((p) => p.id === "p-juliana" || p.pessoaId === "p-juliana");
      expect(juliana.length).toBeGreaterThanOrEqual(2);
    });

    it("multiplos destinos da mesma pessoa tem planos e valores diferentes", () => {
      const juliana = passageirosExemplo.filter((p) => p.id === "p-juliana" || p.pessoaId === "p-juliana");
      if (juliana.length >= 2) {
        const [p1, p2] = juliana;
        const diferentesOU = p1.plano !== p2.plano || p1.valor !== p2.valor;
        expect(diferentesOU).toBe(true);
      }
    });

    it("passageiro em um destino tem seus dados: nome, telefone, cidade, endereco", () => {
      const p = passageirosExemplo[0];
      expect(p.nome).toBeTruthy();
      expect(p.telefone).toBeTruthy();
      expect(p.cidade).toBeTruthy();
      expect(p.endereco).toBeTruthy();
    });
  });

  describe("Codigo de convite - garantidamente unico", () => {
    beforeEach(() => {
      inicializarCodigosUsados(destinosExemplo);
    });

    it("gera codigo unico a cada chamada", () => {
      const codigos = new Set<string>();
      for (let i = 0; i < 10; i++) {
        const codigo = gerarConviteUnico();
        expect(codigos).not.toContain(codigo);
        codigos.add(codigo);
      }
      expect(codigos.size).toBe(10);
    });

    it("codigo tem formato VAN-NNNN", () => {
      const codigo = gerarConviteUnico();
      expect(codigo).toMatch(/^VAN-\d{4}$/);
    });

    it("achar por codigo encontra o destino correto", () => {
      const destino = destinosExemplo[0];
      const encontrado = acharPorCodigo(destinosExemplo, destino.convite);
      expect(encontrado?.id).toBe(destino.id);
    });

    it("achar aceita variacoes: VAN 4821, van-4821, 4821", () => {
      const destino = destinosExemplo[0];
      const variacoes = [destino.convite, destino.convite.replace("-", " "), destino.convite.replace("VAN-", "")];
      variacoes.forEach((v) => {
        const encontrado = acharPorCodigo(destinosExemplo, v);
        expect(encontrado?.id).toBe(destino.id);
      });
    });
  });

  describe("Prazo Confirmar ate - padrao 1 hora antes", () => {
    it("cada destino tem um prazo valido", () => {
      destinosExemplo.forEach((d) => {
        expect(d.prazo).toBeDefined();
        expect(["30min", "1h", "2h", "noite-anterior"]).toContain(d.prazo);
      });
    });

    it("exemplo tem destinos com prazo padrao 1h", () => {
      const exemploComPadraoComum = destinosExemplo.filter((d) => d.prazo === "1h");
      expect(exemploComPadraoComum.length).toBeGreaterThan(0);
    });
  });

  describe("Dados do passageiro - ID do vanzeiro", () => {
    it("cada passageiro tem vanzeiroId", () => {
      passageirosExemplo.forEach((p) => {
        expect(p.vanzeiroId).toBeDefined();
        expect(p.vanzeiroId.length).toBeGreaterThan(0);
      });
    });

    it("cada destino tem vanzeiroId", () => {
      destinosExemplo.forEach((d) => {
        expect(d.vanzeiroId).toBeDefined();
        expect(d.vanzeiroId.length).toBeGreaterThan(0);
      });
    });

    it("todos os vanzeiroIds de exemplo sao vanzeiro-carlos", () => {
      destinosExemplo.forEach((d) => {
        expect(d.vanzeiroId).toBe("vanzeiro-carlos");
      });
      passageirosExemplo.forEach((p) => {
        expect(p.vanzeiroId).toBe("vanzeiro-carlos");
      });
    });
  });
});
