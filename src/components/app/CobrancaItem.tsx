import { Link } from "@tanstack/react-router";
import { CalendarDays, ChevronRight } from "lucide-react";
import { StatusBadge } from "@/components/app/InfoCard";
import { DATA_DE_HOJE, formatarReais } from "@/data/exemplo";
import { FORMA_ROTULO, SITUACAO_ROTULO, diaMes, situacao, valorFinal, type Cobranca, type Situacao } from "@/lib/cobrancas";
import { cn } from "@/lib/utils";

export const BADGE_DA_SITUACAO = {
  pendente: "pendente",
  devendo: "deve",
  pago: "pago",
  cancelada: "neutro",
} as const satisfies Record<Situacao, string>;

export function BadgeSituacao({ s }: { s: Situacao }) {
  return <StatusBadge status={BADGE_DA_SITUACAO[s]}>{SITUACAO_ROTULO[s]}</StatusBadge>;
}

/** "Vence em 20/11", "Venceu em 05/11", "Vencimento 10/11 · Pago em 10/11 · Pix". */
export function linhaDaData(c: Cobranca, hoje = DATA_DE_HOJE) {
  const s = situacao(c, hoje);
  if (s === "pago" && c.pagamento)
    return `Vencimento ${diaMes(c.vencimento)} · Pago em ${diaMes(c.pagamento.data)} · ${FORMA_ROTULO[c.pagamento.forma]}`;
  if (s === "cancelada" && c.cancelamento) return `Vencimento ${diaMes(c.vencimento)} · Cancelada em ${diaMes(c.cancelamento.data)}`;
  if (s === "devendo") return `Venceu em ${diaMes(c.vencimento)}`;
  return c.vencimento === hoje ? "Vence hoje" : `Vence em ${diaMes(c.vencimento)}`;
}

/** One charge in a list. `compacto` is the lighter row used inside a card (passenger detail). */
export function CobrancaItem({ c, destino, compacto = false }: { c: Cobranca; destino?: string | undefined; compacto?: boolean }) {
  const s = situacao(c, DATA_DE_HOJE);
  return (
    <Link
      to="/vanzeiro/financeiro/$cid"
      params={{ cid: c.id }}
      className={cn(
        "block transition-transform active:scale-[0.98]",
        compacto ? "rounded-2xl bg-surface px-3 py-2.5" : "rounded-3xl bg-card p-3.5 shadow-card",
        s === "cancelada" && "opacity-60",
      )}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          {!compacto && <p className="truncate font-bold leading-snug text-foreground">{c.nome}</p>}
          {destino && <p className="truncate text-xs text-muted-foreground">{destino}</p>}
          <p className={cn("text-sm text-foreground", compacto ? "font-semibold" : "mt-1")}>{c.referencia}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <p
            className={cn(
              "font-display text-base font-bold leading-tight text-foreground",
              s === "cancelada" && "text-muted-foreground line-through",
            )}
          >
            {formatarReais(valorFinal(c))}
          </p>
          <BadgeSituacao s={s} />
        </div>
        {compacto && <ChevronRight className="mt-1 h-4 w-4 shrink-0 self-center text-muted-foreground" />}
      </div>
      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
        <CalendarDays className="h-3.5 w-3.5 shrink-0" />
        {linhaDaData(c)}
      </p>
    </Link>
  );
}
