import { createFileRoute, Link } from "@tanstack/react-router";
import { ReceiptText } from "lucide-react";
import { CobrancaItem } from "@/components/app/CobrancaItem";
import { VanzeiroHeader } from "@/components/app/VanzeiroHeader";
import { DATA_DE_HOJE, formatarReais } from "@/data/exemplo";
import { filtrarCobrancas, resumoDoMes, type Filtro } from "@/lib/cobrancas";
import { useCobrancas } from "@/lib/cobrancas-store";
import { nomeDestino } from "@/lib/destinos";
import { useDestinos } from "@/lib/destinos-store";
import { cn } from "@/lib/utils";

const FILTROS: { id: Filtro; rotulo: string }[] = [
  { id: "todas", rotulo: "Todas" },
  { id: "pendentes", rotulo: "Pendentes" },
  { id: "devendo", rotulo: "Devendo" },
  { id: "pagas", rotulo: "Pagas" },
];

const VAZIO: Record<Filtro, string> = {
  todas: "Nenhuma cobrança ainda.",
  pendentes: "Nenhuma cobrança pendente.",
  devendo: "Ninguém devendo. Muito bem!",
  pagas: "Nenhuma cobrança paga ainda.",
};

const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

export const Route = createFileRoute("/vanzeiro/financeiro/")({
  validateSearch: (search: Record<string, unknown>): { filtro?: Filtro } => {
    const f = search["filtro"];
    return f === "pendentes" || f === "devendo" || f === "pagas" ? { filtro: f } : {};
  },
  head: () => ({
    meta: [
      { title: "Financeiro — O Vanzeiro" },
      { name: "description", content: "Resumo do mês e todas as cobranças dos seus passageiros." },
      { property: "og:title", content: "Financeiro — O Vanzeiro" },
      { property: "og:description", content: "Resumo do mês e todas as cobranças dos seus passageiros." },
    ],
  }),
  component: Financeiro,
});

function Financeiro() {
  const { filtro = "todas" } = Route.useSearch();
  const cobrancas = useCobrancas();
  const destinos = useDestinos();
  const resumo = resumoDoMes(cobrancas, DATA_DE_HOJE);
  const lista = filtrarCobrancas(cobrancas, filtro, DATA_DE_HOJE);
  const mes = MESES[Number(DATA_DE_HOJE.slice(5, 7)) - 1] ?? "";
  const nomeDoDestino = (id: string) => {
    const d = destinos.find((x) => x.id === id);
    return d ? nomeDestino(d) : undefined;
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <VanzeiroHeader compacto titulo="Financeiro" subtitulo={`Resumo de ${mes}.`} />

      <div className="relative z-10 -mt-4 shrink-0 px-5">
        <div className="grid grid-cols-3 gap-2">
          <CardResumo rotulo="A receber" valor={resumo.aReceber} className="text-foreground" />
          <CardResumo rotulo="Recebido" valor={resumo.recebido} className="text-success" />
          <CardResumo rotulo="Devendo" valor={resumo.devendo} className="text-destructive" />
        </div>
        <div className="mt-3 grid grid-cols-4 gap-1.5" role="group" aria-label="Filtrar cobranças">
          {FILTROS.map((f) => {
            const ativo = f.id === filtro;
            return (
              <Link
                key={f.id}
                to="/vanzeiro/financeiro"
                search={f.id === "todas" ? {} : { filtro: f.id }}
                replace
                aria-pressed={ativo}
                className={cn(
                  "flex h-10 items-center justify-center rounded-full px-1 text-sm font-semibold transition-colors",
                  ativo ? "bg-primary text-primary-foreground" : "border border-border bg-card text-foreground",
                )}
              >
                {f.rotulo}
              </Link>
            );
          })}
        </div>
      </div>

      {lista.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-8 py-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-primary-soft text-primary">
            <ReceiptText className="h-7 w-7" />
          </div>
          <p className="mt-3 font-semibold text-foreground">{VAZIO[filtro]}</p>
        </div>
      ) : (
        <ul className="min-h-0 flex-1 space-y-2.5 overflow-y-auto px-5 pb-4 pt-3">
          {lista.map((c) => (
            <li key={c.id}>
              <CobrancaItem c={c} destino={nomeDoDestino(c.destinoId)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CardResumo({ rotulo, valor, className }: { rotulo: string; valor: number; className: string }) {
  return (
    <div className="rounded-2xl bg-card px-2.5 py-2.5 shadow-card">
      <p className="text-[0.7rem] font-semibold text-muted-foreground">{rotulo}</p>
      <p className={cn("mt-0.5 font-display text-[0.95rem] font-bold leading-tight", className)}>{formatarReais(valor)}</p>
    </div>
  );
}
