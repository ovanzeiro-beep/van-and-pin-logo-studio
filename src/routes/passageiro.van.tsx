import { useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Clock, MapPin, Navigation } from "lucide-react";
import { MapaDaVan } from "@/components/app/MapaDaVan";
import { PassageiroHeader } from "@/components/app/passageiro/PassageiroHeader";
import { buttonVariants } from "@/components/ui/button";
import { cidadesNoMapa, textoDaChegada, vanSimulada } from "@/lib/mapa";
import { caminhoCompleto, nomeDestino } from "@/lib/destinos";
import { useCoordenadas, useProcurarCidades } from "@/lib/coordenadas-store";
import { useSituacaoDaVan } from "@/lib/minha-viagem";
import { usePassageiros } from "@/lib/passageiros-store";
import { cn } from "@/lib/utils";
import { BotaoVoltar } from "@/components/app/PilulaDoCabecalho";

export const Route = createFileRoute("/passageiro/van")({
  head: () => ({
    meta: [
      { title: "Onde está a van — O Vanzeiro" },
      { name: "description", content: "A van no mapa e quanto falta para chegar no seu ponto." },
    ],
  }),
  component: OndeEstaAVan,
});

/** Simulated movement: the van crosses each stretch in about a minute (only while the pickup goes on). */
function useProgresso() {
  const [progresso, setProgresso] = useState(0.3);
  useEffect(() => {
    const t = setInterval(() => setProgresso(((Date.now() / 1000) % 60) / 60), 1000);
    return () => clearInterval(t);
  }, []);
  return progresso;
}

function OndeEstaAVan() {
  const { eu, destino, viagemDeHoje, van } = useSituacaoDaVan();
  const passageiros = usePassageiros();
  const progresso = useProgresso();

  useCoordenadas();
  useProcurarCidades(destino ? caminhoCompleto(destino) : []);
  const cidades = destino ? cidadesNoMapa(destino) : [];
  // Only a point the person marked: the city center is never shown as "seu ponto".
  const meuPonto = eu.ponto ?? null;
  const naVan = destino ? vanSimulada({ destino, viagem: viagemDeHoje, passageiros, euId: eu.id, progresso }) : null;
  const chegada = textoDaChegada(naVan?.minutosAteVoce ?? null);


  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PassageiroHeader compacto titulo="Onde está a van" subtitulo={destino ? nomeDestino(destino) : "Sua viagem."}>
        <BotaoVoltar senao="/passageiro" />
      </PassageiroHeader>

      <div className="flex min-h-0 flex-1 flex-col gap-3 px-5 pb-4 pt-4">
        <div className="relative min-h-0 flex-1">
          {cidades.length > 0 ? (
            <MapaDaVan cidades={cidades} meuPonto={meuPonto} van={naVan?.ponto ?? null} marcando={false} aoMarcar={() => undefined} />
          ) : (
            <div className="flex h-full items-center justify-center rounded-3xl bg-card p-6 text-center text-sm text-muted-foreground shadow-card">
              O mapa deste destino ainda não está disponível.
            </div>
          )}
        </div>

        <>
            <section className="shrink-0 rounded-3xl bg-card p-4 shadow-card">
              <p className={cn("font-display text-lg font-bold leading-tight", van.alerta ? "text-destructive" : "text-foreground")}>{van.situacao}</p>
              <p className="text-sm text-muted-foreground">{van.detalhe}</p>
              {naVan?.passandoPor && (
                <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Navigation className="h-4 w-4 shrink-0 text-primary" /> Está passando por {naVan.passandoPor}
                </p>
              )}
              {chegada && (
                <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Clock className="h-4 w-4 shrink-0 text-warning" /> {chegada}
                </p>
              )}
              {!eu.ponto && cidades.length > 0 && <p className="mt-2 text-sm font-semibold text-warning">Você ainda não marcou o seu ponto no mapa.</p>}
              <p className="mt-2 text-xs text-muted-foreground">Posição simulada. A posição de verdade, pelo GPS do vanzeiro, entra com o banco de dados.</p>
            </section>
            <Link to="/passageiro/embarque/$pid" params={{ pid: eu.id }} className={cn(buttonVariants({ size: "lg", variant: "outline" }), "w-full shrink-0")}>
              <MapPin className="!h-5 !w-5" /> {eu.ponto ? "Mudar onde embarco" : "Marcar meu ponto no mapa"}
            </Link>
        </>
      </div>
    </div>
  );
}
