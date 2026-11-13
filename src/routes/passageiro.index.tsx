import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bus, CalendarClock, Check, MapPin, Wallet, X } from "lucide-react";
import { InfoCard, StatusBadge } from "@/components/app/InfoCard";
import { ScreenHeader } from "@/components/app/ScreenHeader";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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

function InicioPassageiro() {
  const [resposta, setResposta] = useState<"vou" | "nao" | null>(null);

  return (
    <>
      <ScreenHeader titulo="Início" nome={p.nome} subtitulo="Tudo sobre a sua próxima viagem." />
      <div className="relative z-10 -mt-4 space-y-4 px-5 pb-6">
        <InfoCard
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
          <div className="flex items-center gap-2 rounded-2xl bg-surface px-4 py-3 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="truncate">{p.proximaViagem.ponto}</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Button
              size="lg"
              variant={resposta === "vou" ? "success" : "cta"}
              onClick={() => setResposta("vou")}
              aria-pressed={resposta === "vou"}
            >
              <Check className="!h-5 !w-5" /> Vou
            </Button>
            <Button
              size="lg"
              variant={resposta === "nao" ? "destructive" : "outline"}
              onClick={() => setResposta("nao")}
              aria-pressed={resposta === "nao"}
            >
              <X className="!h-5 !w-5" /> Não vou
            </Button>
          </div>
        </InfoCard>

        <InfoCard
          icon={Bus}
          tone="success"
          label="Situação da van"
          value={p.van.situacao}
          detail={p.van.detalhe}
          aside={<StatusBadge status="info">{p.van.placa}</StatusBadge>}
        >
          <div className="flex items-center gap-2">
            {["Saiu da garagem", "A caminho", "No seu ponto"].map((etapa, i) => (
              <div key={etapa} className="flex-1">
                <div className={cn("h-1.5 rounded-full", i <= 1 ? "bg-success" : "bg-muted")} />
                <p className={cn("mt-1.5 text-[0.7rem] font-semibold", i <= 1 ? "text-foreground" : "text-muted-foreground")}>
                  {etapa}
                </p>
              </div>
            ))}
          </div>
        </InfoCard>

        <InfoCard
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
