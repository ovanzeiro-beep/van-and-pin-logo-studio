import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarClock, Check, MapPin, Wallet, X } from "lucide-react";
import { InfoCard, StatusBadge } from "@/components/app/InfoCard";
import { ScreenHeader } from "@/components/app/ScreenHeader";
import { VanIcon } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { situacaoDaVan } from "@/lib/viagem";
import { formatarReais, passageiroExemplo as p } from "@/data/exemplo";

export const Route = createFileRoute("/passageiro/")({
  head: () => ({
    meta: [
      { title: "Início do passageiro — O Vanzeiro" },
      { name: "description", content: "Sua próxima viagem, a situação da van e o valor em aberto." },
      { property: "og:title", content: "Início do passageiro — O Vanzeiro" },
      { property: "og:description", content: "Sua próxima viagem, a situação da van e o valor em aberto." },
    ],
  }),
  component: InicioPassageiro,
});

const etapas = ["Saiu da garagem", "A caminho", "No seu ponto"];

function InicioPassageiro() {
  const [resposta, setResposta] = useState<"vou" | "nao" | null>(null);
  const van = situacaoDaVan(p.proximaViagem, p.van);

  return (
    <>
      <ScreenHeader compacto titulo="Início" nome={p.nome} subtitulo="Tudo sobre a sua próxima viagem." />
      <div className="relative z-10 -mt-4 space-y-2.5 px-5 pb-3">
        <InfoCard
          compacto
          icon={CalendarClock}
          label="Próxima viagem"
          value={p.proximaViagem.rota}
          detail={`${p.proximaViagem.data} · embarque às ${p.proximaViagem.embarque}`}
          aside={
            resposta === "vou" ? (
              <StatusBadge status="pago">Vou</StatusBadge>
            ) : resposta === "nao" ? (
              <StatusBadge status="deve">Não vou</StatusBadge>
            ) : (
              <StatusBadge status="pendente">Confirmar</StatusBadge>
            )
          }
        >
          <div className="flex items-center gap-2 rounded-2xl bg-surface px-3.5 py-1.5 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="truncate">{p.proximaViagem.ponto}</span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <Button
              variant={resposta === "vou" ? "success" : "cta"}
              onClick={() => setResposta("vou")}
              aria-pressed={resposta === "vou"}
            >
              <Check className="!h-5 !w-5" /> Vou
            </Button>
            <Button
              variant={resposta === "nao" ? "destructive" : "outline"}
              onClick={() => setResposta("nao")}
              aria-pressed={resposta === "nao"}
            >
              <X className="!h-5 !w-5" /> Não vou
            </Button>
          </div>
        </InfoCard>

        <InfoCard
          compacto
          icon={VanIcon}
          tone="success"
          label="Situação da van"
          value={van.situacao}
          detail={van.detalhe}
          aside={<StatusBadge status="info">{p.van.placa}</StatusBadge>}
        >
          <div className="flex items-center gap-2">
            {etapas.map((etapa, i) => (
              <div key={etapa} className="flex-1">
                <div className={cn("h-1.5 rounded-full", i <= van.etapa ? "bg-success" : "bg-muted")} />
                <p
                  className={cn(
                    "mt-1.5 text-[0.7rem] font-semibold",
                    i <= van.etapa ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {etapa}
                </p>
              </div>
            ))}
          </div>
        </InfoCard>

        <InfoCard
          compacto
          icon={Wallet}
          tone="warning"
          label="Valor em aberto"
          value={formatarReais(p.emAberto.valor)}
          detail={`${p.emAberto.referencia} · vence em ${p.emAberto.vencimento}`}
          aside={<StatusBadge status="pendente">Pendente</StatusBadge>}
        />
      </div>
    </>
  );
}
