import { useEffect, useState } from "react";
import { createFileRoute, Link, useCanGoBack, useNavigate, useRouter } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays, Check, CircleCheck, Copy, Info, MapPin, MessageCircle, QrCode, ReceiptText, type LucideIcon } from "lucide-react";
import { BadgeSituacao } from "@/components/app/CobrancaItem";
import { ContaDasFaltas } from "@/components/app/ContaDasFaltas";
import { PassageiroHeader } from "@/components/app/passageiro/PassageiroHeader";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { dataDeHoje } from "@/lib/agora";
import { formatarReais } from "@/lib/dinheiro";
import { FORMA_ROTULO, diaMes, mensagemJaPaguei, situacao, valorFinal } from "@/lib/cobrancas";
import { useCobranca } from "@/lib/cobrancas-store";
import { nomeDestino } from "@/lib/destinos";
import { useDestino } from "@/lib/destinos-store";
import { linkWhatsApp } from "@/lib/passageiros";
import { useIdsDasMinhasCobrancas } from "@/lib/sessao-passageiro";
import { cn } from "@/lib/utils";
import { usePerfilVanzeiro } from "@/lib/vanzeiro-store";

export const Route = createFileRoute("/passageiro/pagamentos/$cid")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Minha cobrança — O Vanzeiro" },
      { name: "description", content: "Valor, vencimento e como pagar uma cobrança da van." },
      { property: "og:title", content: "Minha cobrança — O Vanzeiro" },
      { property: "og:description", content: "Valor, vencimento e como pagar uma cobrança da van." },
    ],
  }),
  component: MinhaCobranca,
});

function MinhaCobranca() {
  const { cid } = Route.useParams();
  const minhas = useIdsDasMinhasCobrancas();
  const encontrada = useCobranca(cid);
  // A passenger only sees their own charges.
  const c = encontrada && minhas.includes(encontrada.passageiroId) ? encontrada : undefined;
  const destino = useDestino(c?.destinoId ?? "");
  const vanzeiro = usePerfilVanzeiro();
  const router = useRouter();
  const podeVoltar = useCanGoBack();
  const navigate = useNavigate();
  const voltar = () => (podeVoltar ? router.history.back() : navigate({ to: "/passageiro/pagamentos" }));

  const botaoVoltar = (
    <button
      type="button"
      onClick={voltar}
      className="relative mt-3 inline-flex h-9 items-center gap-1.5 rounded-full bg-header-foreground/10 px-3.5 text-sm font-semibold transition-colors hover:bg-header-foreground/20"
    >
      <ArrowLeft className="h-4 w-4" /> Voltar
    </button>
  );

  if (!c) {
    return (
      <>
        <PassageiroHeader compacto titulo="Cobrança">{botaoVoltar}</PassageiroHeader>
        <div className="flex flex-1 flex-col items-center justify-center px-8 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary-soft text-primary">
            <ReceiptText className="h-8 w-8" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-foreground">Cobrança não encontrada</h2>
          <Link
            to="/passageiro/pagamentos"
            className="mt-6 inline-flex h-12 items-center rounded-xl bg-primary px-6 font-semibold text-primary-foreground"
          >
            Ver meus pagamentos
          </Link>
        </div>
      </>
    );
  }

  const s = situacao(c, dataDeHoje());
  const aberta = s === "pendente" || s === "devendo";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PassageiroHeader compacto titulo={c.referencia}>{botaoVoltar}</PassageiroHeader>
      <div className="relative z-10 -mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto px-5 pb-4">
        <section className={cn("rounded-3xl bg-card p-4 shadow-card", s === "cancelada" && "opacity-70")}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Valor</p>
              <p
                className={cn(
                  "font-display text-3xl font-bold leading-tight text-foreground",
                  s === "cancelada" && "text-muted-foreground line-through",
                )}
              >
                {formatarReais(valorFinal(c))}
              </p>
            </div>
            <BadgeSituacao s={s} />
          </div>
          <dl className="mt-3 space-y-2.5">
            {destino && <Linha icon={MapPin} rotulo="Destino" valor={nomeDestino(destino)} />}
            <Linha icon={CalendarDays} rotulo="Vencimento" valor={diaMes(c.vencimento)} />
            {c.pagamento && (
              <Linha
                icon={CircleCheck}
                rotulo="Pago em"
                valor={`${diaMes(c.pagamento.data)} · ${FORMA_ROTULO[c.pagamento.forma]}`}
                className="bg-success-soft"
              />
            )}
            {c.cancelamento && (
              <div className="rounded-2xl bg-muted px-3.5 py-2.5 text-sm">
                <p className="font-bold text-foreground">Cancelada em {diaMes(c.cancelamento.data)}</p>
                <p className="text-muted-foreground">Motivo: {c.cancelamento.motivo}</p>
              </div>
            )}
          </dl>
        </section>

        {c.periodoFaltas && <ContaDasFaltas c={c} />}

        {aberta && (
          <div className="space-y-3 pt-1">
            {vanzeiro.pix && <PagarComPix chave={vanzeiro.pix} nome={vanzeiro.nome} valor={valorFinal(c)} />}
            <Button asChild size="lg" variant="outline" className="w-full">
              <a href={linkWhatsApp(vanzeiro.telefone, mensagemJaPaguei(c, vanzeiro.nome))} target="_blank" rel="noreferrer">
                <MessageCircle className="!h-5 !w-5 text-success" /> Já paguei — avisar o vanzeiro
              </a>
            </Button>
            <p className="flex items-start gap-2 px-1 text-sm text-muted-foreground">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              Quem marca como pago é o vanzeiro, depois de conferir.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function PagarComPix({ chave, nome, valor }: { chave: string; nome: string; valor: number }) {
  const [copiado, setCopiado] = useState(false);
  useEffect(() => {
    if (!copiado) return;
    const t = setTimeout(() => setCopiado(false), 2000);
    return () => clearTimeout(t);
  }, [copiado]);
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(chave);
      setCopiado(true);
    } catch {
      setCopiado(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="lg" variant="cta" className="w-full">
          <QrCode className="!h-5 !w-5" /> Pagar com Pix
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-[calc(100%-2.5rem)] rounded-3xl sm:max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Pagar com Pix</AlertDialogTitle>
          <AlertDialogDescription>
            Copie a chave, pague {formatarReais(valor)} no app do seu banco e depois avise o vanzeiro.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="rounded-2xl bg-surface p-3.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Chave Pix de {nome}</p>
          <p className="mt-1 break-all font-display text-lg font-bold text-foreground">{chave}</p>
        </div>
        <Button size="lg" variant="outline" className="w-full" onClick={copiar} aria-live="polite">
          {copiado ? <Check className="!h-5 !w-5 text-success" /> : <Copy className="!h-5 !w-5" />}
          {copiado ? "Copiado" : "Copiar"}
        </Button>
        <AlertDialogFooter>
          <AlertDialogCancel className="h-12 w-full">Fechar</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function Linha({ icon: Icon, rotulo, valor, className }: { icon: LucideIcon; rotulo: string; valor: string; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 rounded-2xl bg-surface px-3.5 py-2.5", className)}>
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <dt className="flex-1 text-sm text-muted-foreground">{rotulo}</dt>
      <dd className="text-sm font-bold text-foreground">{valor}</dd>
    </div>
  );
}
