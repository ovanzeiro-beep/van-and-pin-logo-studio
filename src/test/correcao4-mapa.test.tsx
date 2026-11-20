import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { destinosExemplo } from "@/data/exemplo";
import { MapaDaVan } from "@/components/app/MapaDaVan";
import { PainelDoMapa } from "@/components/app/passageiro/PainelDoMapa";
import { situacaoComEmbarque, type EmbarqueDaViagem } from "@/lib/embarque";
import { cidadesNoMapa } from "@/lib/mapa";
import { AVISO_DA_POSICAO, estadoDoMapa, rotuloDoMapa, TEXTO_DO_MAPA } from "@/lib/painel-do-mapa";
import {
  embarcou,
  iniciarViagem,
  naoEstava,
  situacaoParaPassageiro,
  type ViagemDoDia,
} from "@/lib/viagem";

// CORREÇÃO 4 (20/11/2026): o mapa do passageiro só mostra dados reais. Sem van simulada, sem "chega em N min" e sem
// "Você é o próximo" quando o celular não tem a ordem real da busca.

const cambara = destinosExemplo.find((d) => d.id === "centro-unisul")!;
const londrina = destinosExemplo.find((d) => d.id === "jacarezinho-londrina")!;
const HOJE = "2026-11-13";

const situacao = (viagem: ViagemDoDia | undefined, id = "p-juliana") =>
  situacaoParaPassageiro({
    passageiroId: id,
    destino: cambara,
    hoje: HOJE,
    proximaData: HOJE,
    viagem,
    resposta: "vai",
    aberta: false,
  });

/** The passenger's own view with the database (src/lib/banco/viagem.ts, viagemDoPassageiro). */
const vistaDoPassageiro = (v: ViagemDoDia, id: string): ViagemDoDia => ({
  ...v,
  ordem: v.ordem.includes(id) ? [id] : [],
  embarcaram: v.embarcaram.includes(id) ? [id] : [],
  naoEstavam: v.naoEstavam.includes(id) ? [id] : [],
  parcial: true,
});

const embarque = (faltamAntes: number | null, euEmbarquei = false): EmbarqueDaViagem => ({
  total: 4,
  embarcaram: 1,
  iniciais: ["G. R."],
  posicao: faltamAntes === null ? null : faltamAntes + 2,
  faltamAntes,
  euEmbarquei,
});

const PROIBIDO = /chega(rá)? (no seu ponto )?em|passando por|simulad|minutos? para chegar/i;

function painel(van: ReturnType<typeof situacao>, e: EmbarqueDaViagem | null = null) {
  return render(
    <PainelDoMapa van={situacaoComEmbarque(van, e)} embarque={e} cafe={null} semPonto={false} />,
  );
}

describe("Correção 4: situações da viagem no mapa (só dados reais)", () => {
  it("viagem não iniciada: aguardando a saída, com o horário", () => {
    expect(situacao(undefined)).toMatchObject({
      situacao: "Aguardando a saída",
      detalhe: `A van sai às ${cambara.saida}`,
    });
  });

  it("viagem em andamento, ordem completa (vanzeiro/exemplos): quantos faltam e 'você é o próximo' vêm da ordem real", () => {
    let v = iniciarViagem(cambara, ["p-gabriel", "p-fernanda", "p-juliana"], HOJE);
    expect(situacao(v)).toMatchObject({
      situacao: "Viagem começou",
      detalhe: "Faltam 2 pessoas antes de você",
    });
    v = naoEstava(embarcou(v, "p-gabriel"), "p-fernanda");
    expect(situacao(v)).toMatchObject({ situacao: "Você é o próximo" });
  });

  it("com o banco, sem a ordem real (consulta do embarque falhou): não inventa a posição na fila", () => {
    const v = vistaDoPassageiro(
      iniciarViagem(cambara, ["p-gabriel", "p-fernanda", "p-juliana"], HOJE),
      "p-juliana",
    );
    const van = situacaoComEmbarque(situacao(v), null);
    expect(van).toMatchObject({
      situacao: "Viagem começou",
      detalhe: "A van está buscando os passageiros",
    });
    expect(`${van.situacao} ${van.detalhe}`).not.toMatch(/próximo|antes de você/);
  });

  it("com o banco e a ordem real do servidor: 'Faltam 2' e depois 'Você é o próximo'", () => {
    const v = vistaDoPassageiro(
      iniciarViagem(cambara, ["p-gabriel", "p-fernanda", "p-juliana"], HOJE),
      "p-juliana",
    );
    expect(situacaoComEmbarque(situacao(v), embarque(2))).toMatchObject({
      detalhe: "Faltam 2 pessoas antes de você",
    });
    expect(situacaoComEmbarque(situacao(v), embarque(0))).toMatchObject({
      situacao: "Você é o próximo",
    });
  });

  it("passageiro já embarcado: na van", () => {
    const v = embarcou(iniciarViagem(cambara, ["p-juliana"], HOJE), "p-juliana");
    expect(situacao(v)).toMatchObject({ situacao: "Na van" });
    expect(situacao(vistaDoPassageiro(v, "p-juliana"))).toMatchObject({ situacao: "Na van" });
  });

  it("não estava no ponto: aviso em vermelho", () => {
    const v = naoEstava(iniciarViagem(cambara, ["p-juliana"], HOJE), "p-juliana");
    expect(situacao(vistaDoPassageiro(v, "p-juliana"))).toMatchObject({
      situacao: "Você não estava no ponto",
      alerta: true,
    });
  });

  it("viagem finalizada: encerrada", () => {
    const v: ViagemDoDia = {
      ...embarcou(iniciarViagem(cambara, ["p-juliana"], HOJE), "p-juliana"),
      fase: "encerrada",
    };
    expect(situacao(v)).toMatchObject({ situacao: "Viagem encerrada" });
    expect(situacao(vistaDoPassageiro(v, "p-juliana"))).toMatchObject({
      situacao: "Viagem encerrada",
    });
  });
});

describe("Correção 4: estados do mapa", () => {
  it("rota com coordenadas: mostra o mapa", () => {
    expect(
      estadoDoMapa({
        temDestino: true,
        cidadesNoMapa: cidadesNoMapa(cambara).length,
        procurando: false,
      }),
    ).toBe("pronto");
  });

  it("rota sem coordenadas: 'carregando' enquanto procura; depois, aviso honesto (sem internet ou não achou)", () => {
    expect(estadoDoMapa({ temDestino: true, cidadesNoMapa: 0, procurando: true })).toBe(
      "carregando",
    );
    expect(estadoDoMapa({ temDestino: true, cidadesNoMapa: 0, procurando: false })).toBe(
      "indisponivel",
    );
    expect(TEXTO_DO_MAPA.carregando).toBe("Carregando o mapa…");
    expect(TEXTO_DO_MAPA.indisponivel).toMatch(/internet/);
  });

  it("sem dados (passageiro sem destino): explica o que fazer", () => {
    expect(estadoDoMapa({ temDestino: false, cidadesNoMapa: 0, procurando: false })).toBe(
      "sem-destino",
    );
    expect(TEXTO_DO_MAPA["sem-destino"]).toMatch(/código do vanzeiro/);
  });

  it("mudança de destino: o mapa e a descrição seguem o destino escolhido", () => {
    expect(cidadesNoMapa(cambara).map((c) => c.nome)).not.toEqual(
      cidadesNoMapa(londrina).map((c) => c.nome),
    );
    expect(rotuloDoMapa("Cambará → UENP Jacarezinho", true)).toBe(
      "Mapa da rota Cambará → UENP Jacarezinho, com o seu ponto de embarque",
    );
    expect(rotuloDoMapa("Jacarezinho → Londrina", false)).toBe(
      "Mapa da rota Jacarezinho → Londrina",
    );
  });
});

describe("Correção 4: painel do mapa", () => {
  it("mostra a situação real, o embarque e o aviso de que a posição da van não está no mapa", () => {
    const v = vistaDoPassageiro(
      iniciarViagem(cambara, ["p-gabriel", "p-fernanda", "p-juliana"], HOJE),
      "p-juliana",
    );
    painel(situacao(v), embarque(2));
    expect(screen.getByRole("status", { name: "Situação da viagem" })).toBeTruthy();
    expect(screen.getByText("Faltam 2 pessoas antes de você")).toBeTruthy();
    expect(screen.getByText("1 de 4 já embarcou")).toBeTruthy();
    // a posição aparece uma vez só (no título do cartão), sem repetir na caixa do embarque
    expect(screen.queryByText("Faltam 2 antes de você")).toBeNull();
    expect(screen.getByText(AVISO_DA_POSICAO)).toBeTruthy();
  });

  it("nunca mostra localização ou previsão fictícias, em nenhuma situação", () => {
    const base = iniciarViagem(cambara, ["p-gabriel", "p-juliana"], HOJE);
    const casos: [ViagemDoDia | undefined, EmbarqueDaViagem | null][] = [
      [undefined, null],
      [base, null],
      [vistaDoPassageiro(base, "p-juliana"), null],
      [vistaDoPassageiro(base, "p-juliana"), embarque(1)],
      [vistaDoPassageiro(base, "p-juliana"), embarque(0)],
      [embarcou(embarcou(base, "p-gabriel"), "p-juliana"), embarque(null, true)],
      [{ ...embarcou(base, "p-juliana"), fase: "encerrada" }, null],
    ];
    for (const [v, e] of casos) {
      const { container, unmount } = painel(situacao(v), e);
      expect(container.textContent).not.toMatch(PROIBIDO);
      unmount();
    }
  });
});

// O jsdom não desenha linhas (sem SVG/canvas de verdade): aqui só o ciclo de abrir e fechar, com o pino do passageiro.
// O desenho da rota e o fechamento durante zoom animado são testados no Chromium: scripts/laboratorio-mapa/.
describe("Correção 4: o componente do mapa abre e fecha sem erro", () => {
  const cidades: { nome: string; ponto: { lat: number; lng: number } }[] = [];

  it("fechamento rápido (antes de o mapa terminar de carregar) e abertura repetida", async () => {
    const erros: unknown[] = [];
    const ouvir = (e: ErrorEvent) => erros.push(e.error);
    window.addEventListener("error", ouvir);
    for (let i = 0; i < 10; i++) {
      const r = render(
        <MapaDaVan
          cidades={cidades}
          meuPonto={{ lat: -23.16, lng: -49.97 }}
          marcando={false}
          aoMarcar={() => undefined}
        />,
      );
      if (i % 2 === 1) await act(() => new Promise((ok) => setTimeout(ok, 30)));
      r.unmount();
    }
    const r = render(
      <MapaDaVan
        cidades={cidades}
        meuPonto={{ lat: -23.16, lng: -49.97 }}
        marcando={false}
        aoMarcar={() => undefined}
        rotulo="Mapa da rota X"
      />,
    );
    await act(() => new Promise((ok) => setTimeout(ok, 50)));
    expect(screen.getByRole("application", { name: "Mapa da rota X" })).toBeTruthy();
    // Nenhum desenho de van no mapa (só a rota, as cidades e o pino do passageiro).
    expect(document.querySelector('[title="Van"]')).toBeNull();
    r.unmount();
    await act(() => new Promise((ok) => setTimeout(ok, 300)));
    window.removeEventListener("error", ouvir);
    expect(erros).toEqual([]);
  });
});
