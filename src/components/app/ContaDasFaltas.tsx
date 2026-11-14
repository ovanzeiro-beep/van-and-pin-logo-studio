import { formatarReais } from "@/lib/dinheiro";
import { contaDoDesconto, diaMes, valorFinal, type Cobranca } from "@/lib/cobrancas";

/** The faltas discount math of a charge, shown the same way to the vanzeiro and the passenger. */
export function ContaDasFaltas({ c }: { c: Cobranca }) {
  const conta = contaDoDesconto(c);
  const periodo = c.periodoFaltas;
  return (
    <section className="rounded-3xl bg-card p-4 shadow-card">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Desconto de faltas</p>
      {conta ? (
        <>
          <dl className="mt-3 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{c.tipo === "mensal" ? "Mensalidade" : "Quinzena"}</dt>
              <dd className="font-semibold text-foreground">{formatarReais(c.valorBase)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">
                {c.faltas} {c.faltas === 1 ? "falta" : "faltas"} × {formatarReais(c.valorFalta)}
              </dt>
              <dd className="font-semibold text-destructive">− {formatarReais(c.faltas * c.valorFalta)}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-1.5">
              <dt className="font-bold text-foreground">Total</dt>
              <dd className="font-bold text-foreground">{formatarReais(valorFinal(c))}</dd>
            </div>
          </dl>
          <p className="mt-3 rounded-2xl bg-surface px-3.5 py-2.5 text-sm font-semibold text-foreground">{conta}</p>
        </>
      ) : (
        <p className="mt-2 text-sm text-foreground">Nenhuma falta neste período.</p>
      )}
      {periodo && (
        <p className="mt-2 text-xs text-muted-foreground">
          Faltas contadas de {diaMes(periodo.de)} a {diaMes(periodo.ate)}.
        </p>
      )}
    </section>
  );
}
