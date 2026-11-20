import { textoDoCafe } from "@/lib/destinos";
import { Link, createFileRoute } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { MapaDaVan } from "@/components/app/MapaDaVan";
import { PainelDoMapa } from "@/components/app/passageiro/PainelDoMapa";
import { PassageiroHeader } from "@/components/app/passageiro/PassageiroHeader";
import { buttonVariants } from "@/components/ui/button";
import { cidadesNoMapa } from "@/lib/mapa";
import { caminhoCompleto, nomeDestino } from "@/lib/destinos";
import { useCoordenadas, useProcurandoAlguma, useProcurarCidades } from "@/lib/coordenadas-store";
import { useEmbarqueDaViagem } from "@/lib/banco/embarque";
import { situacaoComEmbarque } from "@/lib/embarque";
import { useSituacaoDaVan } from "@/lib/minha-viagem";
import { estadoDoMapa, rotuloDoMapa, TEXTO_DO_MAPA } from "@/lib/painel-do-mapa";
import { cn } from "@/lib/utils";
import { BotaoVoltar } from "@/components/app/PilulaDoCabecalho";

export const Route = createFileRoute("/passageiro/van")({
  head: () => ({
    meta: [
      { title: "Situação da van — O Vanzeiro" },
      {
        name: "description",
        content: "A rota da viagem, o seu ponto de embarque e a situação da van.",
      },
    ],
  }),
  component: SituacaoDaVanNoMapa,
});

/**
 * CORREÇÃO 4 (20/11/2026): only real data. The route and the person's point on the map; under it, the same "Situação
 * da van" as the Início (with the real boarding from the database). No van on the map and no "chega em N min": there
 * is no real GPS yet, and the old simulated van looked real.
 */
function SituacaoDaVanNoMapa() {
  const { eu, destino, van: situacao } = useSituacaoDaVan();
  // The place in line ("Você é o próximo", "Faltam 2 antes de você") comes only from the real boarding (REV-09).
  const embarque = useEmbarqueDaViagem(eu.id, destino?.id ?? "");
  const van = situacaoComEmbarque(situacao, embarque);

  useCoordenadas();
  const caminho = destino ? caminhoCompleto(destino) : [];
  useProcurarCidades(caminho);
  const procurando = useProcurandoAlguma(caminho);
  const cidades = destino ? cidadesNoMapa(destino) : [];
  const estado = estadoDoMapa({
    temDestino: Boolean(destino),
    cidadesNoMapa: cidades.length,
    procurando,
  });
  // Only a point the person marked: the city center is never shown as "seu ponto".
  const meuPonto = eu.ponto ?? null;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PassageiroHeader
        compacto
        titulo="Situação da van"
        subtitulo={destino ? nomeDestino(destino) : "Sua viagem."}
      >
        <BotaoVoltar senao="/passageiro" />
      </PassageiroHeader>

      <div className="flex min-h-0 flex-1 flex-col gap-3 px-5 pb-4 pt-4">
        <div className="relative min-h-0 flex-1">
          {estado === "pronto" && destino ? (
            <MapaDaVan
              cidades={cidades}
              meuPonto={meuPonto}
              marcando={false}
              aoMarcar={() => undefined}
              rotulo={rotuloDoMapa(nomeDestino(destino), meuPonto !== null)}
            />
          ) : (
            <div
              className="flex h-full items-center justify-center rounded-3xl bg-card p-6 text-center text-sm text-muted-foreground shadow-card"
              aria-busy={estado === "carregando"}
            >
              {TEXTO_DO_MAPA[estado === "pronto" ? "indisponivel" : estado]}
            </div>
          )}
        </div>

        {estado === "pronto" && (
          <ul
            className="flex shrink-0 items-center gap-4 px-1 text-xs font-semibold text-muted-foreground"
            aria-label="Legenda do mapa"
          >
            <li className="flex items-center gap-1.5">
              <span
                className="inline-block w-5 border-t-[3px] border-dashed border-primary"
                aria-hidden="true"
              />{" "}
              Rota da viagem
            </li>
            {meuPonto && (
              <li className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-warning" aria-hidden="true" /> Seu ponto
              </li>
            )}
          </ul>
        )}

        {destino && (
          <>
            <PainelDoMapa
              van={van}
              embarque={embarque}
              cafe={
                destino.cafe
                  ? `Parada do café: ${textoDoCafe(destino.cafe)} (${destino.cafe.minutos} min)`
                  : null
              }
              semPonto={!eu.ponto && estado === "pronto"}
            />
            <Link
              to="/passageiro/embarque/$pid"
              params={{ pid: eu.id }}
              className={cn(buttonVariants({ size: "lg", variant: "outline" }), "w-full shrink-0")}
            >
              <MapPin className="!h-5 !w-5" />{" "}
              {eu.ponto ? "Mudar onde embarco" : "Marcar meu ponto no mapa"}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
