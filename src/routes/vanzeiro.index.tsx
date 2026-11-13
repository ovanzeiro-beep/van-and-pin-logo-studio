import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Clock, MapPinPlus, Route as RouteIcon, Users, Wallet } from "lucide-react";
import { InfoCard, StatusBadge } from "@/components/app/InfoCard";
import { PrimeiroDestino } from "@/components/app/PrimeiroDestino";
import { VanzeiroHeader } from "@/components/app/VanzeiroHeader";
import { formatarReais } from "@/data/exemplo";
import { formatarData, nomeDestino } from "@/lib/destinos";
import { useDestinos } from "@/lib/destinos-store";
import { presencaDaViagem } from "@/lib/passageiros";
import { usePassageiros } from "@/lib/passageiros-store";
import { DATA_DE_HOJE } from "@/data/exemplo";
import { resumoDoMes } from "@/lib/cobrancas";
import { useCobrancas } from "@/lib/cobrancas-store";
import { useViagensDoDia } from "@/lib/viagem-store";
import { proximaViagem, viagemDeHoje } from "@/lib/viagem";
import { useRespostasDoDia } from "@/lib/respostas-store";
import { textoDaVan, usePerfilVanzeiro } from "@/lib/vanzeiro-store";

export const Route = createFileRoute("/vanzeiro/")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Início do vanzeiro — O Vanzeiro" },
      { name: "description", content: "Resumo do dia: viagem, passageiros e valores a receber." },
      { property: "og:title", content: "Início do vanzeiro — O Vanzeiro" },
      { property: "og:description", content: "Resumo do dia: viagem, passageiros e valores a receber." },
    ],
  }),
  component: InicioVanzeiro,
});

function InicioVanzeiro() {
  // Same trip the Viagem tab has chosen, so both screens always talk about the same one.
  const { escolhida } = useViagensDoDia();
  const destinos = useDestinos();
  const destino = viagemDeHoje(destinos, escolhida, DATA_DE_HOJE);
  const passageiros = usePassageiros();
  const { vao: confirmados, total, semResposta, naoVao } = presencaDaViagem(passageiros, destino?.id ?? "", useRespostasDoDia(DATA_DE_HOJE));
  const perfil = usePerfilVanzeiro();
  const pct = total > 0 ? Math.round((confirmados / total) * 100) : 0;
  const saida = destino?.saida ?? "--:--";
  const financeiro = resumoDoMes(useCobrancas(), DATA_DE_HOJE);
  const semDestinos = destinos.length === 0;
  const proxima = destino ? null : proximaViagem(destinos, DATA_DE_HOJE);

  if (semDestinos) {
    return (
      <>
        <VanzeiroHeader compacto titulo="Início" subtitulo="Veja como está o seu dia." />
        <PrimeiroDestino />
      </>
    );
  }

  return (
    <>
      <VanzeiroHeader compacto titulo="Início" subtitulo="Veja como está o seu dia." />
      <div className="relative z-10 -mt-4 space-y-2.5 px-5 pb-3">
        <Link to="/vanzeiro/viagem" className="block rounded-3xl transition-transform active:scale-[0.98]">
        {destino ? (
        <InfoCard
          compacto
          icon={RouteIcon}
          label="Viagem de hoje"
          value={destino ? nomeDestino(destino) : "Sem viagem hoje"}
          detail={textoDaVan(perfil)}
          aside={<StatusBadge status="pendente">Às {saida}</StatusBadge>}
        >
          <div className="flex items-center gap-3 rounded-2xl bg-surface px-3.5 py-1.5 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Saída</span>
            <span className="font-bold text-foreground">{saida}</span>
            <span className="mx-1 h-4 w-px bg-border" />
            <span className="text-muted-foreground">Volta</span>
            <span className="font-bold text-foreground">{destino?.volta ?? "Sem volta"}</span>
          </div>
        </InfoCard>
        ) : (
          <InfoCard
            compacto
            icon={RouteIcon}
            label="Viagem de hoje"
            value="Nenhuma viagem hoje"
            detail={proxima ? `Próxima: ${formatarData(proxima.data)}, ${nomeDestino(proxima.destino)}` : "Nenhuma viagem marcada."}
          />
        )}
        </Link>

        {destino && total === 0 && (
          <Link to="/vanzeiro/destinos/$id" params={{ id: destino.id }} className="block rounded-3xl transition-transform active:scale-[0.98]">
            <InfoCard
              compacto
              icon={Users}
              tone="success"
              label="Passageiros confirmados"
              value="Nenhum passageiro ainda"
              detail="Toque para convidar pelo código de convite."
            />
          </Link>
        )}

        {destino && total > 0 && (
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
        )}

        <Link to="/vanzeiro/financeiro" className="block rounded-3xl transition-transform active:scale-[0.98]">
          <InfoCard
            compacto
            icon={Wallet}
            tone="warning"
            label="Valores a receber"
            value={formatarReais(financeiro.aReceber)}
            detail="Total a receber"
          >
            <div className="grid grid-cols-3 gap-2 text-center">
              <Resumo valor={financeiro.pagos} rotulo="Pagos" className="bg-success-soft text-success" />
              <Resumo valor={financeiro.pendentes} rotulo="Pendentes" className="bg-warning-soft text-warning" />
              <Resumo valor={financeiro.devendoQtd} rotulo="Devendo" className="bg-destructive-soft text-destructive" />
            </div>
          </InfoCard>
        </Link>

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
