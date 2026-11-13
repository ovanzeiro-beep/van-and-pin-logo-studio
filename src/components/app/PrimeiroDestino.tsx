import { Link } from "@tanstack/react-router";
import { ChevronRight, MapPinPlus } from "lucide-react";
import { VanIcon } from "@/components/brand/Logo";

const PASSOS = [
  { titulo: "Crie um destino", texto: "A rota ou a viagem que a sua van faz." },
  { titulo: "Convide os passageiros", texto: "Envie o código de convite pelo WhatsApp." },
  { titulo: "Faça a viagem", texto: "Busque cada um na ordem e confira quem está na van." },
];

/** First use of a new vanzeiro (no destinos yet): a 3-step help and a single path, "Crie seu primeiro destino". */
export function PrimeiroDestino() {
  return (
    <div className="relative z-10 -mt-4 space-y-3 px-5 pb-3">
      <section className="rounded-3xl bg-card p-4 shadow-card">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
            <VanIcon className="h-6 w-6" />
          </div>
          <p className="font-display text-lg font-bold leading-tight text-foreground">Você ainda não tem destinos.</p>
        </div>
        <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Como funciona</p>
        <ol className="mt-2 space-y-2">
          {PASSOS.map((p, i) => (
            <li key={p.titulo} className="flex items-start gap-3 rounded-2xl bg-surface px-3.5 py-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-soft font-display text-sm font-bold text-primary">
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="font-bold leading-snug text-foreground">{p.titulo}</p>
                <p className="text-sm leading-snug text-muted-foreground">{p.texto}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
      <Link
        to="/vanzeiro/destinos/novo"
        className="flex h-14 items-center gap-3 rounded-2xl bg-accent px-4 text-accent-foreground shadow-cta transition-transform active:scale-[0.98]"
      >
        <MapPinPlus className="h-5 w-5 shrink-0" />
        <span className="flex-1 font-display text-base font-bold">Crie seu primeiro destino</span>
        <ChevronRight className="h-5 w-5 shrink-0" />
      </Link>
    </div>
  );
}
