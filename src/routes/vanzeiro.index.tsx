import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Clock, MapPinPlus, Route as RouteIcon, Users, Wallet } from "lucide-react";
import { InfoCard, StatusBadge } from "@/components/app/InfoCard";
import { ScreenHeader } from "@/components/app/ScreenHeader";
import { formatarReais, vanzeiroExemplo as v } from "@/data/exemplo";

export const Route = createFileRoute("/vanzeiro/")({
  head: () => ({
    meta: [
      { title: "Início do vanzeiro — O Vanzeiro" },
      { name: "description", content: "Resumo do dia: viagem, passageiros e valores a receber." },
      { property: "og:title", content: "Início do vanzeiro — O Vanzeiro" },
      { property: "og:description", content: "Resumo do dia: viagem, passageiros e valores a receber." },
    ],
  }),
  component: InicioVanzeiro,
});

function InicioVanzeiro() {
  const { confirmados, total, pendentes, faltando } = v.passageiros;
  const pct = Math.round((confirmados / total) * 100);

  return (
    <>
      <ScreenHeader titulo="Início" nome={v.nome} subtitulo="Veja como está o seu dia." />
      <div className="relative z-10 -mt-4 space-y-4 px-5 pb-6">
        <InfoCard
          icon={RouteIcon}
          label="Viagem de hoje"
          value={v.viagemHoje.rota}
          detail={v.viagemHoje.van}
          aside={<StatusBadge status="pendente">Às {v.viagemHoje.saida}</StatusBadge>}
        >
          <div className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-3 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Saída</span>
            <span className="font-bold text-foreground">{v.viagemHoje.saida}</span>
            <span className="mx-1 h-4 w-px bg-border" />
            <span className="text-muted-foreground">Chegada</span>
            <span className="font-bold text-foreground">{v.viagemHoje.chegadaPrevista}</span>
          </div>
        </InfoCard>

        <InfoCard
          icon={Users}
          tone="success"
          label="Passageiros confirmados"
          value={
            <>
              {confirmados}
              <span className="text-base font-semibold text-muted-foreground"> de {total}</span>
            </>
          }
        >
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-success" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <StatusBadge status="pago">{confirmados} confirmados</StatusBadge>
            <StatusBadge status="pendente">{pendentes} pendentes</StatusBadge>
            <StatusBadge status="deve">{faltando} faltando</StatusBadge>
          </div>
        </InfoCard>

        <InfoCard
          icon={Wallet}
          tone="warning"
          label="Valores a receber"
          value={formatarReais(v.financeiro.aReceber)}
          detail="Referente a este mês"
        >
          <div className="grid grid-cols-3 gap-2 text-center">
            <Resumo valor={v.financeiro.pagos} rotulo="Pagos" className="bg-success-soft text-success" />
            <Resumo valor={v.financeiro.pendentes} rotulo="Pendentes" className="bg-warning-soft text-warning" />
            <Resumo valor={v.financeiro.atrasados} rotulo="Devendo" className="bg-destructive-soft text-destructive" />
          </div>
        </InfoCard>

        <Link
          to="/vanzeiro/destinos"
          className="flex items-center gap-3.5 rounded-3xl bg-accent p-4 text-accent-foreground shadow-cta transition-transform active:scale-[0.98]"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-foreground/10">
            <MapPinPlus className="h-6 w-6" />
          </span>
          <span className="flex-1">
            <span className="block font-display text-lg font-bold">Novo destino</span>
            <span className="block text-sm opacity-80">Cadastre um novo ponto de chegada</span>
          </span>
          <ChevronRight className="h-5 w-5" />
        </Link>
      </div>
    </>
  );
}

function Resumo({ valor, rotulo, className }: { valor: number; rotulo: string; className: string }) {
  return (
    <div className={`rounded-2xl px-2 py-2.5 ${className}`}>
      <p className="font-display text-lg font-bold leading-none">{valor}</p>
      <p className="mt-1 text-[0.7rem] font-semibold">{rotulo}</p>
    </div>
  );
}
