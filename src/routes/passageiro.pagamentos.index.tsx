import { createFileRoute } from "@tanstack/react-router";
import { ReceiptText } from "lucide-react";
import { CobrancaItem } from "@/components/app/CobrancaItem";
import { PassageiroHeader } from "@/components/app/passageiro/PassageiroHeader";
import { formatarReais } from "@/data/exemplo";
import { ordenarRecentes, totalDevido } from "@/lib/cobrancas";
import { useCobrancasDasMatriculas } from "@/lib/cobrancas-store";
import { useMinhasMatriculas } from "@/lib/sessao-passageiro";
import { useDestinos } from "@/lib/destinos-store";
import { nomeDestino } from "@/lib/destinos";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/passageiro/pagamentos/")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Meus pagamentos — O Vanzeiro" },
      { name: "description", content: "Quanto você deve e todas as suas cobranças da van." },
      { property: "og:title", content: "Meus pagamentos — O Vanzeiro" },
      { property: "og:description", content: "Quanto você deve e todas as suas cobranças da van." },
    ],
  }),
  component: MeusPagamentos,
});

function MeusPagamentos() {
  const matriculas = useMinhasMatriculas();
  const destinos = useDestinos();
  const cobrancas = useCobrancasDasMatriculas(matriculas.map((p) => p.id));
  const devido = matriculas.reduce((s, p) => s + totalDevido(cobrancas, p.id), 0);
  const lista = ordenarRecentes(cobrancas);
  const nomes = Object.fromEntries(destinos.map((d) => [d.id, nomeDestino(d)]));

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PassageiroHeader compacto titulo="Pagamentos" subtitulo="Suas cobranças da van." />
      <div className="relative z-10 -mt-4 shrink-0 px-5">
        <section className="rounded-3xl bg-card px-4 py-3 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Você deve</p>
          <p className={cn("font-display text-3xl font-bold leading-tight", devido > 0 ? "text-foreground" : "text-success")}>
            {formatarReais(devido)}
          </p>
          <p className="text-sm text-muted-foreground">{devido > 0 ? "Soma das cobranças ainda não pagas." : "Tudo pago. Obrigado!"}</p>
        </section>
      </div>
      {lista.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-8 py-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-primary-soft text-primary">
            <ReceiptText className="h-7 w-7" />
          </div>
          <p className="mt-3 font-semibold text-foreground">Nenhuma cobrança ainda.</p>
        </div>
      ) : (
        <ul className="min-h-0 flex-1 space-y-2.5 overflow-y-auto px-5 pb-4 pt-3">
          {lista.map((c) => (
            <li key={c.id}>
              <CobrancaItem c={c} para="passageiro" destino={nomes[c.destinoId]} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
