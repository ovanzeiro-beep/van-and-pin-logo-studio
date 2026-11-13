import { createFileRoute } from "@tanstack/react-router";
import { AlarmClock, Check, Clock, X } from "lucide-react";
import { StatusBadge } from "@/components/app/InfoCard";
import { PassageiroHeader } from "@/components/app/passageiro/PassageiroHeader";
import { Button } from "@/components/ui/button";
import { DATA_DE_HOJE, embarquesExemplo, faltasExemplo } from "@/data/exemplo";
import { nomeDestino } from "@/lib/destinos";
import { rotuloDoDia, useMinhasViagens, type MinhaProximaViagem } from "@/lib/minha-viagem";
import { responder } from "@/lib/respostas-store";
import { cn } from "@/lib/utils";
import { historicoDoPassageiro } from "@/lib/viagem";

export const Route = createFileRoute("/passageiro/viagens")({
  head: () => ({
    meta: [
      { title: "Minhas viagens — O Vanzeiro" },
      { name: "description", content: "Confirme as viagens dos próximos 7 dias e veja o seu histórico." },
      { property: "og:title", content: "Minhas viagens — O Vanzeiro" },
      { property: "og:description", content: "Confirme as viagens dos próximos 7 dias e veja o seu histórico." },
    ],
  }),
  component: MinhasViagens,
});

function MinhasViagens() {
  const { eu, destino, proximas, proximaDistante, viagemDeHoje } = useMinhasViagens();
  const historico = destino
    ? historicoDoPassageiro(eu, destino, DATA_DE_HOJE, { embarques: embarquesExemplo, faltas: faltasExemplo }, viagemDeHoje)
    : [];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PassageiroHeader compacto titulo="Viagens" subtitulo={destino ? nomeDestino(destino) : "Suas viagens."} />
      <div className="relative z-10 -mt-4 min-h-0 flex-1 space-y-4 overflow-y-auto px-5 pb-4">
        <section>
          <h2 className="px-1 pt-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Próximos 7 dias</h2>
          <div className="mt-1.5 space-y-2.5">
            {proximas.length === 0 ? (
              <p className="rounded-3xl bg-card p-4 text-sm text-muted-foreground shadow-card">
                Nenhuma viagem nos próximos 7 dias.
                {proximaDistante && ` A próxima é ${rotuloDoDia(proximaDistante).toLowerCase()}.`}
              </p>
            ) : (
              proximas.map((v) => <ProximaViagem key={v.data} v={v} saida={destino?.saida ?? ""} passageiroId={eu.id} />)
            )}
          </div>
        </section>

        <section>
          <h2 className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Histórico</h2>
          <div className="mt-1.5 space-y-2">
            {historico.length === 0 ? (
              <p className="rounded-2xl bg-card px-4 py-3 text-sm text-muted-foreground shadow-card">Nenhuma viagem ainda.</p>
            ) : (
              historico.map((h) => (
                <div key={h.data} className="flex items-center justify-between gap-3 rounded-2xl bg-card px-4 py-3 shadow-card">
                  <p className="font-semibold text-foreground">{rotuloDoDia(h.data)}</p>
                  {h.embarcou ? <StatusBadge status="pago">Embarcou</StatusBadge> : <StatusBadge status="deve">Faltou</StatusBadge>}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function ProximaViagem({ v, saida, passageiroId }: { v: MinhaProximaViagem; saida: string; passageiroId: string }) {
  return (
    <article className="rounded-3xl bg-card p-3.5 shadow-card">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-display text-lg font-bold leading-tight text-foreground">{rotuloDoDia(v.data)}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" /> Saída {saida}
          </p>
        </div>
        {v.resposta === "vai" ? (
          <StatusBadge status="pago">Vou</StatusBadge>
        ) : v.resposta === "nao-vai" ? (
          <StatusBadge status="deve">Não vou</StatusBadge>
        ) : (
          <StatusBadge status="pendente">Confirmar</StatusBadge>
        )}
      </div>
      <p
        className={cn(
          "mt-2 flex items-center gap-2 rounded-2xl px-3 py-1.5 text-sm",
          v.aberta
            ? v.resposta
              ? "bg-surface text-muted-foreground"
              : "bg-warning-soft font-bold text-warning"
            : v.resposta
              ? "bg-surface text-muted-foreground"
              : "bg-destructive-soft font-bold text-destructive",
        )}
      >
        <AlarmClock className="h-4 w-4 shrink-0" />
        {v.aberta
          ? `Confirme até ${v.prazo}`
          : v.emAndamento
            ? v.resposta === "vai"
              ? "A viagem já começou."
              : "Prazo encerrado — a van não vai passar"
            : v.resposta
              ? "Prazo encerrado."
              : "Prazo encerrado — a van não vai passar"}
      </p>
      {v.aberta && (
        <div className="mt-2 grid grid-cols-2 gap-2.5">
          <Button
            variant={v.resposta === "vai" ? "success" : "cta"}
            onClick={() => responder(passageiroId, v.data, "vai")}
            aria-pressed={v.resposta === "vai"}
          >
            <Check className="!h-5 !w-5" /> Vou
          </Button>
          <Button
            variant={v.resposta === "nao-vai" ? "destructive" : "outline"}
            onClick={() => responder(passageiroId, v.data, "nao-vai")}
            aria-pressed={v.resposta === "nao-vai"}
          >
            <X className="!h-5 !w-5" /> Não vou
          </Button>
        </div>
      )}
    </article>
  );
}
