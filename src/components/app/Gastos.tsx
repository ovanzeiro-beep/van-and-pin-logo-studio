import { useState } from "react";
import { CalendarDays, PenLine, Plus, Trash2, Wallet } from "lucide-react";
import { CampoComIcone } from "@/components/app/CampoComIcone";
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
import { dataDeHoje } from "@/lib/agora";
import { diaMes } from "@/lib/cobrancas";
import { formatarReais } from "@/lib/dinheiro";
import { problemaDoGasto, rotuloDoGasto, sobrouNoMes, TIPOS_DE_GASTO, totalDosGastos, type Gasto, type TipoDeGasto } from "@/lib/gastos";
import { anotarGasto, apagarGasto } from "@/lib/gastos-store";
import { lerValor } from "@/lib/passageiros";
import { cn } from "@/lib/utils";

/** T6: the month's expenses on "Seu mês na van": the list (each one can be deleted) and "Anotar gasto". */
export function GastosDoMes({ gastos, mes }: { gastos: Gasto[]; mes: string }) {
  return (
    <section>
      <h2 className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Gastos da van{gastos.length > 0 ? ` · ${formatarReais(totalDosGastos(gastos))}` : ""}
      </h2>
      <ul className="mt-1.5 space-y-1.5">
        {gastos.map((g) => (
          <li key={g.id} className="flex items-center gap-3 rounded-2xl bg-card py-2 pl-4 pr-1.5 shadow-card">
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold text-foreground">{rotuloDoGasto(g)}</span>
              <span className="block text-xs text-muted-foreground">{diaMes(g.data)}</span>
            </span>
            <span className="font-display font-bold text-foreground">{formatarReais(g.valor)}</span>
            <ApagarGasto g={g} />
          </li>
        ))}
      </ul>
      {gastos.length === 0 && <p className="mt-1.5 rounded-2xl bg-card px-4 py-3 text-sm text-muted-foreground shadow-card">Nenhum gasto anotado neste mês.</p>}
      <AnotarGasto mes={mes} />
    </section>
  );
}

function ApagarGasto({ g }: { g: Gasto }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 text-muted-foreground" aria-label={`Apagar ${rotuloDoGasto(g)} de ${formatarReais(g.valor)}`}>
          <Trash2 className="!h-5 !w-5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-[calc(100%-2.5rem)] rounded-3xl sm:max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Apagar este gasto?</AlertDialogTitle>
          <AlertDialogDescription>
            {rotuloDoGasto(g)} de {formatarReais(g.valor)}, em {diaMes(g.data)}. Se anotou errado, apague e anote de novo.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className={buttonVariants({ variant: "outline", size: "lg" })}>Voltar</AlertDialogCancel>
          <AlertDialogAction className={buttonVariants({ variant: "destructive", size: "lg" })} onClick={() => apagarGasto(g.id)}>
            Apagar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function AnotarGasto({ mes }: { mes: string }) {
  const hoje = dataDeHoje();
  const diaInicial = hoje.startsWith(mes) ? hoje : `${mes}-01`;
  const [aberto, setAberto] = useState(false);
  const [tipo, setTipo] = useState<TipoDeGasto | null>(null);
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [data, setData] = useState(diaInicial);
  const [tentou, setTentou] = useState(false);
  const centavos = lerValor(valor);
  const problema = problemaDoGasto({ tipo, descricao, valor: centavos, data }, hoje);
  const abrir = (v: boolean) => {
    setAberto(v);
    if (v) {
      setTipo(null);
      setDescricao("");
      setValor("");
      setData(diaInicial);
      setTentou(false);
    }
  };
  const salvar = () => {
    setTentou(true);
    if (problema || !tipo || centavos === null) return;
    anotarGasto({ tipo, descricao, valor: centavos, data });
    setAberto(false);
  };
  return (
    <AlertDialog open={aberto} onOpenChange={abrir}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="mt-2 h-11 w-full rounded-2xl font-semibold">
          <Plus className="!h-5 !w-5" /> Anotar gasto
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-h-[calc(100dvh-2rem)] max-w-[calc(100%-2.5rem)] gap-3 overflow-y-auto rounded-3xl sm:max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Anotar gasto</AlertDialogTitle>
          <AlertDialogDescription>Combustível, manutenção, pedágio… Entra no mês e no "Sobrou".</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Tipo do gasto">
          {TIPOS_DE_GASTO.map((t) => (
            <button
              key={t.id}
              type="button"
              aria-pressed={tipo === t.id}
              onClick={() => setTipo(t.id)}
              className={cn(
                "h-10 rounded-full px-3.5 text-sm font-semibold transition-colors",
                tipo === t.id ? "bg-primary text-primary-foreground" : "border border-border bg-card text-foreground",
              )}
            >
              {t.rotulo}
            </button>
          ))}
        </div>
        {tipo === "outros" && (
          <CampoComIcone id="gasto-descricao" label="O que foi?" icon={PenLine} value={descricao} maxLength={40} placeholder="Ex.: lavagem" onChange={(e) => setDescricao(e.target.value)} />
        )}
        <div className="grid grid-cols-2 gap-3">
          <CampoComIcone id="gasto-valor" label="Valor (R$)" icon={Wallet} inputMode="decimal" placeholder="0,00" value={valor} onChange={(e) => setValor(e.target.value)} className="pl-11 pr-1" />
          <CampoComIcone id="gasto-dia" label="Dia" icon={CalendarDays} type="date" max={hoje} value={data} onChange={(e) => setData(e.target.value)} className="pl-11 pr-1 text-sm md:text-sm" />
        </div>
        {tentou && problema && <p className="text-sm font-medium text-destructive">{problema}</p>}
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className="m-0 h-12 w-full">Voltar</AlertDialogCancel>
          <Button size="lg" className="h-12 w-full" onClick={salvar}>
            Salvar
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/** "Sobrou R$ X" (green) or "Faltou R$ X" (red): what came in minus the expenses. */
export function Sobrou({ recebido, gastos }: { recebido: number; gastos: number }) {
  const resto = sobrouNoMes(recebido, gastos);
  return (
    <div className="rounded-2xl bg-card px-3.5 py-2.5 shadow-card">
      <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
        <Wallet className="h-4 w-4" /> {resto >= 0 ? "Sobrou" : "Faltou"}
      </p>
      <p className={cn("mt-0.5 font-display text-2xl font-bold leading-tight", resto >= 0 ? "text-success" : "text-destructive")}>{formatarReais(Math.abs(resto))}</p>
      <p className="text-xs text-muted-foreground">
        Recebido {formatarReais(recebido)} − gastos {formatarReais(gastos)}
      </p>
    </div>
  );
}
