import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, List, MapPin, ReceiptText } from "lucide-react";
import { CobrancaItem } from "@/components/app/CobrancaItem";
import { CobrarDevedores } from "@/components/app/CobrarDevedores";
import { PrimeiroDestino } from "@/components/app/PrimeiroDestino";
import { TelaVazia } from "@/components/app/TelaVazia";
import { buttonVariants } from "@/components/ui/button";
import { VanzeiroHeader } from "@/components/app/VanzeiroHeader";
import { dataDeHoje } from "@/lib/agora";
import { nomeDoMesDe } from "@/lib/datas";
import { formatarReais } from "@/lib/dinheiro";
import { confirmadosSemCobranca, devedores, filtrarCobrancas, resumoDoMes, type Filtro } from "@/lib/cobrancas";
import { usePassageiros } from "@/lib/passageiros-store";
import { useRespostasDoDia } from "@/lib/respostas-store";
import { useViagensDoDia } from "@/lib/viagem-store";
import { aconteceEm } from "@/lib/viagem";
import { CheckCircle2 } from "lucide-react";
import { useCobrancas } from "@/lib/cobrancas-store";
import { nomeDestino } from "@/lib/destinos";
import { useDestinos } from "@/lib/destinos-store";
import { cn } from "@/lib/utils";
import { usePerfilVanzeiro } from "@/lib/vanzeiro-store";
import { PilulaDoCabecalho } from "@/components/app/PilulaDoCabecalho";

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

export const Route = createFileRoute("/vanzeiro/financeiro/")({
  validateSearch: (search: Record<string, unknown>): { filtro?: Filtro } => {
    const f = search["filtro"];
    return f === "pendentes" || f === "devendo" || f === "pagas" ? { filtro: f } : {};
  },
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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
  const resumo = resumoDoMes(cobrancas, dataDeHoje());
  const lista = filtrarCobrancas(cobrancas, filtro, dataDeHoje());
  // Who confirmed "Vou" today (Por viagem and Diário): pending already, until "Embarcou" creates the charge (as in Início).
  const confirmados = confirmadosSemCobranca(
    usePassageiros(),
    destinos.filter((d) => aconteceEm(d, dataDeHoje())).map((d) => d.id),
    useRespostasDoDia(dataDeHoje()),
    useViagensDoDia().viagens,
  );
  const previstos = filtro === "todas" || filtro === "pendentes" ? confirmados : [];
  const valorPrevisto = confirmados.reduce((s, p) => s + (p.valor ?? 0), 0);
  const mes = nomeDoMesDe(dataDeHoje());
  const nomeDoDestino = (id: string) => {
    const d = destinos.find((x) => x.id === id);
    return d ? nomeDestino(d) : undefined;
  };
  const perfil = usePerfilVanzeiro();
  const quemDeve = devedores(cobrancas, dataDeHoje());

  if (destinos.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <VanzeiroHeader compacto titulo="Financeiro" subtitulo={`Resumo de ${mes}.`} />
        <PrimeiroDestino />
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <VanzeiroHeader compacto titulo="Financeiro" subtitulo={`Resumo de ${mes}.`}>
        {/* T5: "Seu mês na van", the month in numbers (this one and the ones before). */}
        <PilulaDoCabecalho asChild>
          <Link to="/vanzeiro/financeiro/mes">
            <CalendarDays className="h-4 w-4" /> Seu mês na van
          </Link>
        </PilulaDoCabecalho>
      </VanzeiroHeader>

      <div className="relative z-10 -mt-4 shrink-0 px-5">
        <div className="grid grid-cols-3 gap-2">
          <CardResumo rotulo="A receber" valor={resumo.aReceber + valorPrevisto} className="text-foreground" />
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
        <CobrarDevedores
          lista={quemDeve}
          pix={perfil.pix}
          nomeDoVanzeiro={perfil.nome}
          nomeDoDestino={(id) => nomeDoDestino(id) ?? ""}
          cidadeDoDestino={(id) => destinos.find((x) => x.id === id)?.origem ?? ""}
        />
      </div>

      {lista.length === 0 && previstos.length === 0 ? (
        <TelaVazia
          icon={ReceiptText}
          titulo={VAZIO[filtro]}
          texto={filtro === "todas" ? "O app cria as cobranças sozinho, pelo plano de cada passageiro." : undefined}
          botao={
            filtro === "todas" ? (
              <Link to="/vanzeiro/destinos" className={cn(buttonVariants({ size: "lg" }), "w-full")}>
                <MapPin className="!h-5 !w-5" /> Ver destinos
              </Link>
            ) : (
              <Link to="/vanzeiro/financeiro" search={{}} replace className={cn(buttonVariants({ size: "lg" }), "w-full")}>
                <List className="!h-5 !w-5" /> Ver todas
              </Link>
            )
          }
        />
      ) : (
        <ul className="min-h-0 flex-1 space-y-2.5 overflow-y-auto px-5 pb-4 pt-3">
          {previstos.map((p) => (
            <li key={`vou-${p.id}`} className="flex items-center gap-3 rounded-3xl border-2 border-warning/40 bg-card p-3.5 shadow-card">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-warning-soft text-warning">
                <CheckCircle2 className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-foreground">{p.nome}</p>
                <p className="truncate text-sm text-muted-foreground">{nomeDoDestino(p.destinoId)}</p>
                <p className="text-xs font-semibold text-warning">Confirmou "Vou" hoje · vira cobrança quando embarcar</p>
              </div>
              <p className="shrink-0 font-display text-lg font-bold text-foreground">{formatarReais(p.valor ?? 0)}</p>
            </li>
          ))}
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
