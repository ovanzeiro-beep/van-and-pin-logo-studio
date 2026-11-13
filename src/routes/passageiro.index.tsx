import { createFileRoute } from "@tanstack/react-router";
import { AlarmClock, CalendarClock, Check, CircleCheck, MessageCircle, UserCheck, Wallet, X } from "lucide-react";
import { InfoCard, StatusBadge } from "@/components/app/InfoCard";
import { BadgeSituacao } from "@/components/app/CobrancaItem";
import { PassageiroHeader } from "@/components/app/passageiro/PassageiroHeader";
import { VanIcon } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { DATA_DE_HOJE, formatarReais, type RespostaViagem } from "@/data/exemplo";
import { diaMes, situacao, totalDevido } from "@/lib/cobrancas";
import { useCobrancasDasMatriculas } from "@/lib/cobrancas-store";
import { nomeDestino } from "@/lib/destinos";
import { rotuloDoDia, useMinhasViagens, type MinhaProximaViagem } from "@/lib/minha-viagem";
import { useIdsDasMinhasCobrancas } from "@/lib/sessao-passageiro";
import { linkWhatsApp } from "@/lib/passageiros";
import { responder } from "@/lib/respostas-store";
import { cn } from "@/lib/utils";
import { conferenciaDoPassageiro, situacaoParaPassageiro } from "@/lib/viagem";
import { confirmarNaVan } from "@/lib/viagem-store";
import { usePerfilVanzeiro } from "@/lib/vanzeiro-store";

export const Route = createFileRoute("/passageiro/")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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
  const { eu, destino, proximas, proximaDistante, viagemDeHoje, respostaDeHoje } = useMinhasViagens();
  const vanzeiro = usePerfilVanzeiro();
  const idsDasCobrancas = useIdsDasMinhasCobrancas();
  const cobrancas = useCobrancasDasMatriculas(idsDasCobrancas);
  const prox = proximas[0];
  const hojeAberta = proximas.find((v) => v.data === DATA_DE_HOJE)?.aberta ?? false;
  const van = destino
    ? situacaoParaPassageiro({
        passageiroId: eu.id,
        destino,
        hoje: DATA_DE_HOJE,
        proximaData: prox?.data ?? proximaDistante,
        viagem: viagemDeHoje,
        resposta: respostaDeHoje,
        aberta: hojeAberta,
      })
    : { situacao: "Aguardando o dia da viagem", detalhe: "Nenhuma viagem marcada", etapa: -1, alerta: false };

  const devido = idsDasCobrancas.reduce((s, id) => s + totalDevido(cobrancas, id), 0);
  const [aberta] = cobrancas
    .filter((c) => !c.pagamento && !c.cancelamento)
    .sort((a, b) => a.vencimento.localeCompare(b.vencimento));
  const sAberta = aberta ? situacao(aberta, DATA_DE_HOJE) : null;
  const conferencia = conferenciaDoPassageiro(viagemDeHoje, eu.id);

  return (
    <>
      <PassageiroHeader compacto titulo="Início" subtitulo="Tudo sobre a sua próxima viagem." />
      <div className="relative z-10 -mt-4 space-y-2.5 px-5 pb-2">
        {conferencia === "perguntar" ? (
          <AvisoConferencia onConfirmar={() => confirmarNaVan(eu.id)} />
        ) : conferencia === "confirmado" ? (
          <section className="flex items-center gap-3 rounded-3xl border-2 border-success bg-success-soft p-4 shadow-card" role="status">
            <CircleCheck className="h-8 w-8 shrink-0 text-success" />
            <p className="font-display text-lg font-bold leading-tight text-success">Confirmado — boa viagem!</p>
          </section>
        ) : (
        <InfoCard
          compacto
          icon={CalendarClock}
          label="Próxima viagem"
          value={prox ? nomeDestino(prox.destino) : destino ? nomeDestino(destino) : "Sem viagem"}
          detail={
            prox && destino
              ? `${rotuloDoDia(prox.data)} · saída ${prox.destino.saida}`
              : proximaDistante
                ? rotuloDoDia(proximaDistante)
                : "Nenhuma viagem marcada"
          }
          aside={<BadgeResposta resposta={prox?.resposta} />}
        >
          {prox && <Prazo v={prox} />}
          {prox?.aberta && (
            <div className="mt-2 grid grid-cols-2 gap-3">
              <Button
                variant={prox.resposta === "vai" ? "success" : "cta"}
                onClick={() => responder(prox.eu.id, prox.data, "vai")}
                aria-pressed={prox.resposta === "vai"}
              >
                <Check className="!h-5 !w-5" /> Vou
              </Button>
              <Button
                variant={prox.resposta === "nao-vai" ? "destructive" : "outline"}
                onClick={() => responder(prox.eu.id, prox.data, "nao-vai")}
                aria-pressed={prox.resposta === "nao-vai"}
              >
                <X className="!h-5 !w-5" /> Não vou
              </Button>
            </div>
          )}
          {prox && !prox.aberta && !prox.resposta && (
            <Button asChild variant="outline" className="mt-2 w-full">
              <a href={linkWhatsApp(vanzeiro.telefone)} target="_blank" rel="noreferrer">
                <MessageCircle className="!h-5 !w-5 text-success" /> Falar com o vanzeiro
              </a>
            </Button>
          )}
        </InfoCard>
        )}

        <InfoCard
          compacto
          icon={VanIcon}
          tone={van.alerta ? "danger" : "success"}
          label="Situação da van"
          value={van.situacao}
          detail={van.detalhe}
          aside={<StatusBadge status="info">{vanzeiro.van.placa}</StatusBadge>}
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
          tone={devido > 0 ? "warning" : "success"}
          label="Valor em aberto"
          value={formatarReais(devido)}
          detail={
            aberta
              ? `${aberta.referencia} · ${sAberta === "devendo" ? "venceu" : "vence"} em ${diaMes(aberta.vencimento)}`
              : "Tudo pago. Obrigado!"
          }
          aside={sAberta ? <BadgeSituacao s={sAberta} /> : <BadgeSituacao s="pago" />}
        />
      </div>
    </>
  );
}

/** Shown while the vanzeiro checks who is in the van: the passenger answers on their own phone. */
function AvisoConferencia({ onConfirmar }: { onConfirmar: () => void }) {
  return (
    <section className="rounded-3xl border-2 border-warning bg-card p-4 shadow-card" role="alert">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-warning-soft text-warning">
          <AlarmClock className="h-6 w-6" />
        </div>
        <p className="font-display text-lg font-bold leading-tight text-foreground">Conferência da van — você está na van?</p>
      </div>
      <Button variant="success" size="xl" className="mt-3 h-[3.25rem] w-full rounded-2xl font-display text-base font-bold" onClick={onConfirmar}>
        <UserCheck className="!h-6 !w-6" /> Estou na van
      </Button>
    </section>
  );
}

function BadgeResposta({ resposta }: { resposta: RespostaViagem | undefined }) {
  if (resposta === "vai") return <StatusBadge status="pago">Vou</StatusBadge>;
  if (resposta === "nao-vai") return <StatusBadge status="deve">Não vou</StatusBadge>;
  return <StatusBadge status="pendente">Confirmar</StatusBadge>;
}

/** The deadline, always in sight: open, closed with an answer, or closed without one. */
function Prazo({ v }: { v: MinhaProximaViagem }) {
  const base = "flex items-center gap-2 rounded-2xl px-3.5 py-1.5 text-sm";
  if (v.emAndamento && v.resposta === "vai")
    return <p className={cn(base, "bg-surface text-muted-foreground")}><AlarmClock className="h-4 w-4 shrink-0" />A viagem já começou.</p>;
  if (!v.aberta && !v.resposta)
    return (
      <p className={cn(base, "bg-destructive-soft font-bold text-destructive")}>
        <AlarmClock className="h-4 w-4 shrink-0" />
        Prazo encerrado — a van não vai passar
      </p>
    );
  if (!v.aberta)
    return (
      <p className={cn(base, "bg-surface text-muted-foreground")}>
        <AlarmClock className="h-4 w-4 shrink-0" />
        Prazo encerrado. Você respondeu: <span className="font-bold text-foreground">{v.resposta === "vai" ? "Vou" : "Não vou"}</span>
      </p>
    );
  if (v.resposta)
    return (
      <p className={cn(base, "bg-surface text-muted-foreground")}>
        <AlarmClock className="h-4 w-4 shrink-0" />
        Dá para mudar até <span className="font-bold text-foreground">{v.prazo}</span>
      </p>
    );
  return (
    <p className={cn(base, "bg-warning-soft font-bold text-warning")}>
      <AlarmClock className="h-4 w-4 shrink-0" />
      Confirme até {v.prazo}
    </p>
  );
}
