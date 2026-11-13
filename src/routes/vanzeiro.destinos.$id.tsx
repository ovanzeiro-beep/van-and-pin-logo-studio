import { createFileRoute, Link } from "@tanstack/react-router";
import { AlarmClock, ArrowLeft, CalendarDays, Clock, Pause, Pencil, Play, Repeat, Route as RouteIcon, type LucideIcon } from "lucide-react";
import { CodigoConvite, PassageirosDoDestino, PedidosParaEntrar } from "@/components/app/PassageirosDoDestino";
import { StatusBadge } from "@/components/app/InfoCard";
import { CaminhoParadas } from "@/components/app/CaminhoParadas";
import { DestinoNaoEncontrado } from "@/components/app/DestinoNaoEncontrado";
import { ExcluirDestino } from "@/components/app/ExcluirDestino";
import { VanzeiroHeader } from "@/components/app/VanzeiroHeader";
import { Button } from "@/components/ui/button";
import { PRAZO_TEXTO, TIPO_ROTULO, caminhoCompleto, nomeDestino, quandoAcontece } from "@/lib/destinos";
import { alternarAtivo, useDestino } from "@/lib/destinos-store";

export const Route = createFileRoute("/vanzeiro/destinos/$id")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Detalhe do destino — O Vanzeiro" },
      { name: "description", content: "Dias, horários, caminho, código de convite e passageiros de um destino." },
      { property: "og:title", content: "Detalhe do destino — O Vanzeiro" },
      { property: "og:description", content: "Dias, horários, caminho, código de convite e passageiros de um destino." },
    ],
  }),
  component: DetalheDestino,
});

function DetalheDestino() {
  const { id } = Route.useParams();
  const d = useDestino(id);
  if (!d) return <DestinoNaoEncontrado />;

  return (
    <>
      <VanzeiroHeader compacto titulo={nomeDestino(d)}>
        <Link
          to="/vanzeiro/destinos"
          className="relative mt-3 inline-flex h-9 items-center gap-1.5 rounded-full bg-header-foreground/10 px-3.5 text-sm font-semibold transition-colors hover:bg-header-foreground/20"
        >
          <ArrowLeft className="h-4 w-4" /> Todos os destinos
        </Link>
      </VanzeiroHeader>

      <div className="relative z-10 -mt-4 space-y-3 px-5 pb-4">
        <section className="rounded-3xl bg-card p-4 shadow-card">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Como funciona</p>
            {d.ativo ? (
              <StatusBadge status="pago">Ativo</StatusBadge>
            ) : (
              <StatusBadge status="neutro">Pausado</StatusBadge>
            )}
          </div>
          <dl className="mt-3 space-y-2.5">
            <Linha icon={d.tipo === "fixa" ? Repeat : CalendarDays} rotulo="Tipo" valor={TIPO_ROTULO[d.tipo]} />
            <Linha icon={CalendarDays} rotulo={d.tipo === "fixa" ? "Dias" : "Data"} valor={quandoAcontece(d)} />
            <Linha icon={Clock} rotulo="Saída da ida" valor={d.saida} />
            <Linha icon={Clock} rotulo="Volta" valor={d.volta ?? "Sem volta"} />
            <Linha icon={AlarmClock} rotulo="Confirmar até" valor={PRAZO_TEXTO[d.prazo]} />
          </dl>
        </section>

        <section className="rounded-3xl bg-card p-4 shadow-card">
          <div className="mb-3 flex items-center gap-2">
            <RouteIcon className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Caminho</p>
          </div>
          <CaminhoParadas pontos={caminhoCompleto(d)} />
        </section>

        <CodigoConvite destino={d} />
        <PedidosParaEntrar destinoId={d.id} />
        <PassageirosDoDestino destinoId={d.id} />

        <div className="grid grid-cols-2 gap-3 pt-1">
          <Button asChild size="lg" variant="outline">
            <Link to="/vanzeiro/destinos/editar/$id" params={{ id: d.id }}>
              <Pencil className="!h-5 !w-5" /> Editar
            </Link>
          </Button>
          <Button size="lg" variant={d.ativo ? "outline" : "success"} onClick={() => alternarAtivo(d.id)}>
            {d.ativo ? <Pause className="!h-5 !w-5" /> : <Play className="!h-5 !w-5" />}
            {d.ativo ? "Pausar" : "Ativar"}
          </Button>
        </div>
        <ExcluirDestino d={d} />
      </div>
    </>
  );
}

function Linha({ icon: Icon, rotulo, valor }: { icon: LucideIcon; rotulo: string; valor: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-surface px-3.5 py-2.5">
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <dt className="flex-1 text-sm text-muted-foreground">{rotulo}</dt>
      <dd className="text-sm font-bold text-foreground">{valor}</dd>
    </div>
  );
}
