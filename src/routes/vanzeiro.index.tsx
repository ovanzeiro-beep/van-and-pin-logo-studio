import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Clock, MapPinPlus, Route as RouteIcon, Users, Wallet } from "lucide-react";
import { InfoCard, StatusBadge } from "@/components/app/InfoCard";
import { VanzeiroHeader } from "@/components/app/VanzeiroHeader";
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
  const { confirmados, total, semResposta, naoVao } = v.passageiros;
  const pct = Math.round((confirmados / total) * 100);

  return (
    <>
      <VanzeiroHeader compacto titulo="Início" subtitulo="Veja como está o seu dia." />
      <div className="relative z-10 -mt-4 space-y-2.5 px-5 pb-3">
        <InfoCard
          compacto
          icon={RouteIcon}
          label="Viagem de hoje"
          value={v.viagemHoje.rota}
          detail={v.viagemHoje.van}
          aside={<StatusBadge status="pendente">Às {v.viagemHoje.saida}</StatusBadge>}
        >
          <div className="flex items-center gap-3 rounded-2xl bg-surface px-3.5 py-1.5 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Saída</span>
            <span className="font-bold text-foreground">{v.viagemHoje.saida}</span>
            <span className="mx-1 h-4 w-px bg-border" />
            <span className="text-muted-foreground">Chegada</span>
            <span className="font-bold text-foreground">{v.viagemHoje.chegadaPrevista}</span>
          </div>
        </InfoCard>

        <InfoCard
          compacto
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
          <div className="mt-2 flex flex-wrap gap-1.5">
            <StatusBadge status="pago">{confirmados} confirmados</StatusBadge>
            <StatusBadge status="pendente">{semResposta} sem resposta</StatusBadge>
            <StatusBadge status="deve">{naoVao} não vão</StatusBadge>
          </div>
        </InfoCard>

        <InfoCard
          compacto
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
          to="/vanzeiro/destinos/novo"
          className="flex h-11 items-center gap-3 rounded-2xl bg-accent px-4 text-accent-foreground shadow-cta transition-transform active:scale-[0.98]"
        >
          <MapPinPlus className="h-5 w-5 shrink-0" />
          <span className="flex-1 font-display text-base font-bold">Novo destino</span>
          <ChevronRight className="h-5 w-5 shrink-0" />
        </Link>
      </div>
    </>
  );
}

function Resumo({ valor, rotulo, className }: { valor: number; rotulo: string; className: string }) {
  return (
    <div className={`rounded-2xl px-2 py-1.5 ${className}`}>
      <p className="font-display text-base font-bold leading-none">{valor}</p>
      <p className="mt-1 text-[0.7rem] font-semibold">{rotulo}</p>
    </div>
  );
}
