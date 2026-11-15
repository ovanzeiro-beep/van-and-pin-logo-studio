import { useEffect, useState } from "react";
import { createFileRoute, useCanGoBack, useNavigate, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Check, Clock, MapPin, Navigation, X } from "lucide-react";
import { MapaDaVan } from "@/components/app/MapaDaVan";
import { PassageiroHeader } from "@/components/app/passageiro/PassageiroHeader";
import { Button } from "@/components/ui/button";
import type { Ponto } from "@/lib/mapa";
import { cidadesNoMapa, pontoDoPassageiro, textoDaChegada, vanSimulada } from "@/lib/mapa";
import { nomeDestino } from "@/lib/destinos";
import { useSituacaoDaVan } from "@/lib/minha-viagem";
import { salvarPontoDeEmbarque, usePassageiros } from "@/lib/passageiros-store";
import { cn } from "@/lib/utils";

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
  const [marcando, setMarcando] = useState(false);
  const [novoPonto, setNovoPonto] = useState<Ponto | null>(null);
  const router = useRouter();
  const podeVoltar = useCanGoBack();
  const navigate = useNavigate();
  const voltar = () => (podeVoltar ? router.history.back() : navigate({ to: "/passageiro" }));

  const cidades = destino ? cidadesNoMapa(destino) : [];
  const meuPonto = novoPonto ?? pontoDoPassageiro(eu);
  const naVan = destino ? vanSimulada({ destino, viagem: viagemDeHoje, passageiros, euId: eu.id, progresso }) : null;
  const chegada = textoDaChegada(naVan?.minutosAteVoce ?? null);

  const salvarPonto = () => {
    if (novoPonto) salvarPontoDeEmbarque(eu.id, novoPonto);
    setNovoPonto(null);
    setMarcando(false);
  };
  const cancelar = () => {
    setNovoPonto(null);
    setMarcando(false);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PassageiroHeader compacto titulo="Onde está a van" subtitulo={destino ? nomeDestino(destino) : "Sua viagem."}>
        <button
          type="button"
          onClick={voltar}
          className="relative mt-3 inline-flex h-9 items-center gap-1.5 rounded-full bg-header-foreground/10 px-3.5 text-sm font-semibold transition-colors hover:bg-header-foreground/20"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>
      </PassageiroHeader>

      <div className="flex min-h-0 flex-1 flex-col gap-3 px-5 pb-4 pt-4">
        <div className="relative min-h-0 flex-1">
          {cidades.length > 0 ? (
            <MapaDaVan cidades={cidades} meuPonto={meuPonto} van={naVan?.ponto ?? null} marcando={marcando} aoMarcar={setNovoPonto} />
          ) : (
            <div className="flex h-full items-center justify-center rounded-3xl bg-card p-6 text-center text-sm text-muted-foreground shadow-card">
              O mapa deste destino ainda não está disponível.
            </div>
          )}
          {marcando && (
            <p className="pointer-events-none absolute inset-x-3 top-3 z-[500] rounded-2xl bg-card px-3 py-2 text-center text-sm font-semibold text-foreground shadow-card">
              Toque no mapa onde você espera a van.
            </p>
          )}
        </div>

        {marcando ? (
          <div className="grid shrink-0 grid-cols-2 gap-3">
            <Button size="lg" variant="outline" onClick={cancelar}>
              <X className="!h-5 !w-5" /> Cancelar
            </Button>
            <Button size="lg" variant="cta" disabled={!novoPonto} onClick={salvarPonto}>
              <Check className="!h-5 !w-5" /> Salvar ponto
            </Button>
          </div>
        ) : (
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
              <p className="mt-2 text-xs text-muted-foreground">Posição simulada. A posição de verdade, pelo GPS do vanzeiro, entra com o banco de dados.</p>
            </section>
            {cidades.length > 0 && (
              <Button size="lg" variant="outline" className="w-full shrink-0" onClick={() => setMarcando(true)}>
                <MapPin className="!h-5 !w-5" /> Marcar meu ponto no mapa
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
