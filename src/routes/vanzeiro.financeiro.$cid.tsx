import { useState } from "react";
import { createFileRoute, Link, useCanGoBack, useNavigate, useRouter } from "@tanstack/react-router";
import {
  ArrowLeft,
  Banknote,
  CalendarDays,
  CircleCheck,
  MapPin,
  MessageCircle,
  QrCode,
  ReceiptText,
  User,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { BadgeSituacao } from "@/components/app/CobrancaItem";
import { ContaDasFaltas } from "@/components/app/ContaDasFaltas";
import { VanzeiroHeader } from "@/components/app/VanzeiroHeader";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type FormaPagamento } from "@/data/exemplo";
import { dataDeHoje } from "@/lib/agora";
import { formatarReais } from "@/lib/dinheiro";
import {
  FORMA_ROTULO,
  contaDoDesconto,
  diaMes,
  mensagemCobranca,
  situacao,
  valorFinal,
  type Cobranca,
} from "@/lib/cobrancas";
import { cancelarCobranca, marcarComoPago, useCobranca } from "@/lib/cobrancas-store";
import { nomeDestino } from "@/lib/destinos";
import { useDestino } from "@/lib/destinos-store";
import { linkWhatsApp } from "@/lib/passageiros";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/vanzeiro/financeiro/$cid")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Cobrança — O Vanzeiro" },
      { name: "description", content: "Valor, vencimento, desconto de faltas e situação de uma cobrança." },
      { property: "og:title", content: "Cobrança — O Vanzeiro" },
      { property: "og:description", content: "Valor, vencimento, desconto de faltas e situação de uma cobrança." },
    ],
  }),
  component: DetalheCobranca,
});

function DetalheCobranca() {
  const { cid } = Route.useParams();
  const c = useCobranca(cid);
  const destino = useDestino(c?.destinoId ?? "");
  const router = useRouter();
  const podeVoltar = useCanGoBack();
  const navigate = useNavigate();
  const voltar = () => (podeVoltar ? router.history.back() : navigate({ to: "/vanzeiro/financeiro" }));

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
        <VanzeiroHeader compacto titulo="Cobrança">{botaoVoltar}</VanzeiroHeader>
        <div className="flex flex-1 flex-col items-center justify-center px-8 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary-soft text-primary">
            <ReceiptText className="h-8 w-8" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-foreground">Cobrança não encontrada</h2>
          <Link
            to="/vanzeiro/financeiro"
            className="mt-6 inline-flex h-12 items-center rounded-xl bg-primary px-6 font-semibold text-primary-foreground"
          >
            Ver o Financeiro
          </Link>
        </div>
      </>
    );
  }

  const s = situacao(c, dataDeHoje());
  const aberta = s === "pendente" || s === "devendo";
  const nomeDoDestino = destino ? nomeDestino(destino) : "";

  return (
    <>
      <VanzeiroHeader compacto titulo={c.referencia}>{botaoVoltar}</VanzeiroHeader>

      <div className="relative z-10 -mt-4 space-y-3 px-5 pb-4">
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
            <Linha icon={User} rotulo="Passageiro" valor={c.nome} />
            {nomeDoDestino && <Linha icon={MapPin} rotulo="Destino" valor={nomeDoDestino} />}
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
            <MarcarComoPago c={c} />
            <Button asChild size="lg" variant="outline" className="w-full">
              <a
                href={linkWhatsApp(c.telefone, mensagemCobranca(c, nomeDoDestino, dataDeHoje()))}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle className="!h-5 !w-5 text-success" /> Cobrar no WhatsApp
              </a>
            </Button>
            <CancelarCobranca c={c} />
          </div>
        )}
      </div>
    </>
  );
}

function MarcarComoPago({ c }: { c: Cobranca }) {
  const [forma, setForma] = useState<FormaPagamento | null>(null);
  return (
    <AlertDialog onOpenChange={(aberto) => !aberto && setForma(null)}>
      <AlertDialogTrigger asChild>
        <Button size="lg" variant="success" className="w-full">
          <CircleCheck className="!h-5 !w-5" /> Marcar como pago
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-[calc(100%-2.5rem)] rounded-3xl sm:max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Como foi pago?</AlertDialogTitle>
          <AlertDialogDescription>
            {formatarReais(valorFinal(c))} de {c.nome}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <OpcaoForma icon={Banknote} rotulo="Dinheiro" ativo={forma === "dinheiro"} onClick={() => setForma("dinheiro")} />
          <OpcaoForma icon={QrCode} rotulo="Pix" ativo={forma === "pix"} onClick={() => setForma("pix")} />
        </div>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className={buttonVariants({ variant: "outline", size: "lg" })}>Voltar</AlertDialogCancel>
          <AlertDialogAction
            className={buttonVariants({ variant: "success", size: "lg" })}
            disabled={!forma}
            onClick={() => forma && marcarComoPago(c.id, forma)}
          >
            Confirmar pagamento
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function OpcaoForma({
  icon: Icon,
  rotulo,
  ativo,
  onClick,
}: {
  icon: LucideIcon;
  rotulo: string;
  ativo: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      className={cn(
        "flex h-20 flex-col items-center justify-center gap-1.5 rounded-2xl border-2 font-display font-bold text-foreground transition-colors",
        ativo ? "border-primary bg-primary-soft" : "border-border bg-surface",
      )}
    >
      <Icon className={cn("h-6 w-6", ativo ? "text-primary" : "text-muted-foreground")} />
      {rotulo}
    </button>
  );
}

function CancelarCobranca({ c }: { c: Cobranca }) {
  const [motivo, setMotivo] = useState("");
  return (
    <AlertDialog onOpenChange={(aberto) => !aberto && setMotivo("")}>
      <AlertDialogTrigger asChild>
        <Button size="lg" variant="ghost" className="w-full text-destructive">
          <XCircle className="!h-5 !w-5" /> Cancelar cobrança
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-[calc(100%-2.5rem)] rounded-3xl sm:max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Cancelar esta cobrança?</AlertDialogTitle>
          <AlertDialogDescription>Ela sai das contas, mas continua no histórico.</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2">
          <label htmlFor="motivo" className="text-sm font-semibold text-foreground">
            Motivo
          </label>
          <Input
            id="motivo"
            maxLength={60}
            placeholder="Ex.: Lançada por engano"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            className="h-12 rounded-xl border-input bg-surface text-base shadow-none md:text-base"
          />
        </div>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className={buttonVariants({ variant: "outline", size: "lg" })}>Voltar</AlertDialogCancel>
          <AlertDialogAction
            className={buttonVariants({ variant: "destructive", size: "lg" })}
            disabled={!motivo.trim()}
            onClick={() => cancelarCobranca(c.id, motivo)}
          >
            Cancelar cobrança
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function Linha({
  icon: Icon,
  rotulo,
  valor,
  className,
}: {
  icon: LucideIcon;
  rotulo: string;
  valor: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3 rounded-2xl bg-surface px-3.5 py-2.5", className)}>
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <dt className="flex-1 text-sm text-muted-foreground">{rotulo}</dt>
      <dd className="min-w-0 text-right text-sm font-bold text-foreground">{valor}</dd>
    </div>
  );
}
