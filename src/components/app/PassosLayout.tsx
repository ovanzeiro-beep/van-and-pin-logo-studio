import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { VanzeiroHeader } from "@/components/app/VanzeiroHeader";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Shared shell of the 3-step forms: "Passo X de 3", progress bar, card, Voltar / Continuar or Salvar. Step 4 is the resumo. */
export function PassosLayout({
  titulo,
  subtitulo,
  passo,
  podeContinuar,
  onVoltar,
  onContinuar,
  onSalvar,
  rotuloSalvar,
  children,
}: {
  titulo: string;
  subtitulo: string;
  passo: number;
  podeContinuar: boolean;
  onVoltar: () => void;
  onContinuar: () => void;
  onSalvar: () => void;
  rotuloSalvar: string;
  children: ReactNode;
}) {
  const resumo = passo === 4;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <VanzeiroHeader compacto titulo={titulo} subtitulo={subtitulo}>
        <div className="relative mt-3">
          <p className="text-xs font-bold uppercase tracking-wider text-header-muted">
            {resumo ? "Resumo" : `Passo ${passo} de 3`}
          </p>
          <div className="mt-1.5 flex gap-1.5">
            {[1, 2, 3].map((i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 flex-1 rounded-full",
                  i <= passo ? "bg-header-foreground" : "bg-header-foreground/20",
                )}
              />
            ))}
          </div>
        </div>
      </VanzeiroHeader>

      <div className="relative z-10 -mt-4 min-h-0 flex-1 overflow-y-auto px-5 pb-2">
        <section className="space-y-4 rounded-3xl bg-card p-4 shadow-card [@media(max-height:700px)]:space-y-3 [@media(max-height:700px)]:p-3.5">
          {children}
        </section>
      </div>

      <div className="grid shrink-0 grid-cols-2 gap-3 px-5 pb-3 pt-2 [@media(max-height:700px)]:pt-1">
        <Button size="lg" variant="outline" onClick={onVoltar}>
          <ArrowLeft className="!h-5 !w-5" /> Voltar
        </Button>
        {resumo ? (
          <Button size="lg" variant="cta" onClick={onSalvar}>
            <Check className="!h-5 !w-5" /> {rotuloSalvar}
          </Button>
        ) : (
          <Button size="lg" variant="cta" disabled={!podeContinuar} onClick={onContinuar}>
            Continuar <ArrowRight className="!h-5 !w-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
