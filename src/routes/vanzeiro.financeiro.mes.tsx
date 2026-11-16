import { createFileRoute, Link, useCanGoBack, useNavigate, useRouter } from "@tanstack/react-router";
import { ArrowLeft, ChevronLeft, ChevronRight, CircleCheck, Route as RouteIcon, Wallet } from "lucide-react";
import { GastosDoMes, Sobrou } from "@/components/app/Gastos";
import { StatusBadge } from "@/components/app/InfoCard";
import { VanzeiroHeader } from "@/components/app/VanzeiroHeader";
import { dataDeHoje } from "@/lib/agora";
import { useCobrancas } from "@/lib/cobrancas-store";
import { nomeDestino } from "@/lib/destinos";
import { useDestinos } from "@/lib/destinos-store";
import { formatarReais } from "@/lib/dinheiro";
import { gastosDoMes, totalDosGastos } from "@/lib/gastos";
import { useGastos } from "@/lib/gastos-store";
import { nomeDoMes } from "@/lib/datas";
import { mesesDisponiveis, seuMes, type PessoaNoMes } from "@/lib/seu-mes";
import { cn } from "@/lib/utils";
import { useViagensEncerradasComDetalhes } from "@/lib/viagens-encerradas-store";

export const Route = createFileRoute("/vanzeiro/financeiro/mes")({
  validateSearch: (search: Record<string, unknown>): { mes?: string } => {
    const m = search["mes"];
    return typeof m === "string" && /^\d{4}-\d{2}$/.test(m) ? { mes: m } : {};
  },
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Seu mês na van — O Vanzeiro" },
      { name: "description", content: "Quanto entrou, quanto falta receber, viagens feitas e quem paga em dia." },
      { property: "og:title", content: "Seu mês na van — O Vanzeiro" },
      { property: "og:description", content: "Quanto entrou, quanto falta receber, viagens feitas e quem paga em dia." },
    ],
  }),
  component: SeuMesNaVan,
});

function SeuMesNaVan() {
  const cobrancas = useCobrancas();
  const viagens = useViagensEncerradasComDetalhes();
  const todosOsGastos = useGastos();
  const meses = mesesDisponiveis(cobrancas, [...viagens, ...todosOsGastos], dataDeHoje());
  const pedido = Route.useSearch().mes;
  const mes = pedido && meses.includes(pedido) ? pedido : meses[meses.length - 1]!;
  const i = meses.indexOf(mes);
  const r = seuMes(cobrancas, viagens, mes, dataDeHoje());
  const gastos = gastosDoMes(todosOsGastos, mes);
  const decididos = r.emDia.length + r.atrasados.length + r.devendo.length;
  const destinos = useDestinos();
  const ondeVai = (p: PessoaNoMes) => {
    const d = destinos.find((x) => x.id === p.destinoId);
    return d ? nomeDestino(d) : "";
  };

  const router = useRouter();
  const podeVoltar = useCanGoBack();
  const navigate = useNavigate();
  const voltar = () => (podeVoltar ? router.history.back() : navigate({ to: "/vanzeiro/financeiro" }));

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <VanzeiroHeader compacto titulo="Seu mês na van" subtitulo="Quanto entrou, quanto gastou e quem paga em dia.">
        <button
          type="button"
          onClick={voltar}
          className="relative mt-3 inline-flex h-9 items-center gap-1.5 rounded-full bg-header-foreground/10 px-3.5 text-sm font-semibold transition-colors hover:bg-header-foreground/20"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>
      </VanzeiroHeader>

      <div className="relative z-10 -mt-4 shrink-0 px-5">
        <div className="flex items-center justify-between rounded-2xl bg-card px-2 py-1.5 shadow-card">
          <TrocarMes para={meses[i - 1]} rotulo="Mês anterior" icone={ChevronLeft} />
          <p className="font-display text-base font-bold text-foreground">{nomeDoMes(mes)}</p>
          <TrocarMes para={meses[i + 1]} rotulo="Próximo mês" icone={ChevronRight} />
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 pb-4 pt-3">
        <Sobrou recebido={r.recebido} gastos={totalDosGastos(gastos)} />
        <div className="grid grid-cols-2 gap-2">
          <Numero icone={Wallet} rotulo="Recebido" valor={formatarReais(r.recebido)} className="text-success" />
          <Numero icone={Wallet} rotulo="Falta receber" valor={formatarReais(r.faltaReceber)} className="text-foreground" />
          <Numero
            icone={RouteIcon}
            rotulo="Viagens feitas"
            valor={String(r.viagens)}
            detalhe={`${r.embarques} ${r.embarques === 1 ? "embarque" : "embarques"}`}
            className="text-foreground"
          />
          <Numero
            icone={CircleCheck}
            rotulo="Pagaram em dia"
            valor={decididos === 0 ? "—" : `${r.emDia.length} de ${decididos}`}
            className="text-success"
          />
        </div>

        <GastosDoMes key={mes} gastos={gastos} mes={mes} />

        <Grupo onde={ondeVai} titulo="Devendo" pessoas={r.devendo} badge={(p) => <StatusBadge status="deve">{formatarReais(p.falta)}</StatusBadge>} />
        <Grupo onde={ondeVai} titulo="Pagaram atrasado" pessoas={r.atrasados} badge={() => <StatusBadge status="pendente">Atrasado</StatusBadge>} />
        <Grupo onde={ondeVai} titulo="Pagaram em dia" pessoas={r.emDia} badge={() => <StatusBadge status="pago">Em dia</StatusBadge>} />
        <Grupo onde={ondeVai} titulo="Pendentes" pessoas={r.aVencer} badge={(p) => <StatusBadge status="pendente">{formatarReais(p.falta)}</StatusBadge>} />
        {r.devendo.length + r.atrasados.length + r.emDia.length + r.aVencer.length === 0 && (
          <p className="rounded-2xl bg-card px-4 py-3 text-sm text-muted-foreground shadow-card">Nenhuma cobrança neste mês.</p>
        )}
      </div>
    </div>
  );
}

function TrocarMes({ para, rotulo, icone: Icone }: { para: string | undefined; rotulo: string; icone: typeof ChevronLeft }) {
  const classe = "flex h-10 w-10 items-center justify-center rounded-full";
  if (!para) return <span className={cn(classe, "opacity-0")} aria-hidden />;
  return (
    <Link to="/vanzeiro/financeiro/mes" search={{ mes: para }} replace aria-label={rotulo} className={cn(classe, "text-foreground hover:bg-muted")}>
      <Icone className="h-5 w-5" />
    </Link>
  );
}

function Numero({ icone: Icone, rotulo, valor, detalhe, className }: { icone: typeof Wallet; rotulo: string; valor: string; detalhe?: string; className: string }) {
  return (
    <div className="rounded-2xl bg-card px-3 py-2.5 shadow-card">
      <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
        <Icone className="h-4 w-4" /> {rotulo}
      </p>
      <p className={cn("mt-0.5 font-display text-lg font-bold leading-tight", className)}>{valor}</p>
      {detalhe && <p className="text-xs text-muted-foreground">{detalhe}</p>}
    </div>
  );
}

function Grupo({ titulo, pessoas, badge, onde }: { titulo: string; pessoas: PessoaNoMes[]; badge: (p: PessoaNoMes) => React.ReactNode; onde: (p: PessoaNoMes) => string }) {
  if (pessoas.length === 0) return null;
  return (
    <section>
      <h2 className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {titulo} · {pessoas.length}
      </h2>
      <ul className="mt-1.5 space-y-1.5">
        {pessoas.map((p) => (
          <li key={p.passageiroId} className="flex items-center justify-between gap-3 rounded-2xl bg-card px-4 py-2.5 shadow-card">
            <span className="min-w-0">
              <span className="block truncate font-semibold text-foreground">{p.nome}</span>
              <span className="block truncate text-xs text-muted-foreground">{onde(p)}</span>
            </span>
            {badge(p)}
          </li>
        ))}
      </ul>
    </section>
  );
}
