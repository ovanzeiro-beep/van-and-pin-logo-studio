import type { ReactNode } from "react";
import { MapPin, Navigation } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import type { Passageiro } from "@/data/exemplo";
import { nomeDestino } from "@/lib/destinos";
import { cn } from "@/lib/utils";
import { linkDoMapa } from "@/lib/viagem";

/** Who is next: name, address and city, with "Abrir no mapa". */
export function PassageiroDaVez({ rotulo, p, posicao }: { rotulo: string; p: Passageiro | undefined; posicao: string }) {
  return (
    <section className="rounded-3xl bg-card p-3.5 shadow-card">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{rotulo}</p>
        <span className="rounded-full bg-primary-soft px-2.5 py-1 text-[0.7rem] font-bold text-primary">{posicao}</span>
      </div>
      <p className="mt-1 font-display text-[1.4rem] font-bold leading-tight text-foreground">{p?.nome ?? "Passageiro removido"}</p>
      {p && (
        <div className="mt-2 flex items-start gap-2 text-foreground">
          <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div className="min-w-0">
            <p className="font-semibold leading-snug">{p.endereco}</p>
            <p className="text-sm text-muted-foreground">{p.cidade}</p>
          </div>
        </div>
      )}
      {p && (
        <a
          href={linkDoMapa(p)}
          target="_blank"
          rel="noreferrer"
          className={cn(buttonVariants({ variant: "outline" }), "mt-2.5 w-full rounded-2xl font-bold")}
        >
          <Navigation className="h-5 w-5" /> Abrir no mapa
        </a>
      )}
    </section>
  );
}

/** "3 de 6 embarcados" with a progress bar. */
export function Progresso({ feitos, total, texto, extra }: { feitos: number; total: number; texto: string; extra?: ReactNode }) {
  const pct = total > 0 ? Math.round((feitos / total) * 100) : 100;
  return (
    <section className="rounded-3xl bg-card px-4 py-2.5 shadow-card">
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-display text-lg font-bold text-foreground">
          {feitos} de {total} <span className="text-base font-semibold text-muted-foreground">{texto}</span>
        </p>
        {extra}
      </div>
      <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-success transition-all" style={{ width: `${pct}%` }} />
      </div>
    </section>
  );
}

/** Choice between the trips of the day, when there is more than one. */
export function EscolhaDaViagem({
  viagens,
  escolhida,
  feitas,
  aoEscolher,
}: {
  viagens: { id: string; origem: string; destino: string; saida: string }[];
  escolhida: string;
  feitas: string[];
  aoEscolher: (id: string) => void;
}) {
  if (viagens.length < 2) return null;
  return (
    <div role="group" aria-label="Escolha a viagem" className="grid grid-cols-2 gap-2">
      {viagens.map((d) => {
        const ativa = d.id === escolhida;
        return (
          <button
            key={d.id}
            type="button"
            aria-pressed={ativa}
            onClick={() => aoEscolher(d.id)}
            className={cn(
              "min-w-0 rounded-2xl px-3 py-2 text-left shadow-card transition-transform active:scale-[0.98]",
              ativa ? "bg-primary text-primary-foreground" : "bg-card text-foreground",
            )}
          >
            <p className="flex items-center gap-1.5 font-display text-base font-bold leading-tight">
              {d.saida}
              {feitas.includes(d.id) && (
                <span className={cn("rounded-full px-1.5 py-0.5 text-[0.65rem] font-bold", ativa ? "bg-primary-foreground/20" : "bg-success-soft text-success")}>
                  Feita
                </span>
              )}
            </p>
            <p className={cn("truncate text-xs font-semibold", ativa ? "text-primary-foreground/80" : "text-muted-foreground")}>
              {nomeDestino(d)}
            </p>
          </button>
        );
      })}
    </div>
  );
}

export function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{titulo}</h2>
      <div className="mt-1.5 space-y-2">{children}</div>
    </section>
  );
}

/** One passenger row in a list. */
export function LinhaPassageiro({
  p,
  inicio,
  fim,
  className,
}: {
  p: Passageiro | undefined;
  inicio?: ReactNode;
  fim?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3 rounded-2xl bg-card px-3.5 py-2.5 shadow-card", className)}>
      {inicio}
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-foreground">{p?.nome ?? "Passageiro removido"}</p>
        {p && <p className="truncate text-sm text-muted-foreground">{p.cidade} · {p.endereco}</p>}
      </div>
      {fim}
    </div>
  );
}
