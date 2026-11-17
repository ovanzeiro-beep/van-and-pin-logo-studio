import {
  AlertCircle,
  Bell,
  CalendarCheck,
  CalendarX2,
  CheckCircle2,
  Clock,
  MapPin,
  MessageCircle,
  Trash2,
  UserPlus,
  Wallet,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import type { Aviso } from "@/data/exemplo";
import { VanIcon } from "@/components/brand/Logo";
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
import { somarDias } from "@/lib/datas";

/** The icon of each notice, on a soft circle with the color of the situation (green, red, amber or blue). */
const ICONE: Record<string, { icone: LucideIcon | "van"; fundo: string }> = {
  pedido_novo: { icone: UserPlus, fundo: "bg-primary-soft text-primary" },
  resposta_passageiro: { icone: MessageCircle, fundo: "bg-primary-soft text-primary" },
  cobranca_vencida: { icone: Wallet, fundo: "bg-destructive-soft text-destructive" },
  cobranca_vencendo: { icone: Wallet, fundo: "bg-warning-soft text-warning" },
  prazo_chegando: { icone: Clock, fundo: "bg-warning-soft text-warning" },
  van_saiu: { icone: "van", fundo: "bg-primary-soft text-primary" },
  pedido_aceito: { icone: CheckCircle2, fundo: "bg-success-soft text-success" },
  pedido_recusado: { icone: XCircle, fundo: "bg-destructive-soft text-destructive" },
  endereco_aceito: { icone: MapPin, fundo: "bg-success-soft text-success" },
  endereco_recusado: { icone: MapPin, fundo: "bg-destructive-soft text-destructive" },
  viagem_cancelada: { icone: CalendarX2, fundo: "bg-destructive-soft text-destructive" },
  viagem_de_volta: { icone: CalendarCheck, fundo: "bg-success-soft text-success" },
  destino_excluido: { icone: CalendarX2, fundo: "bg-destructive-soft text-destructive" },
  presenca_confirmada: { icone: CheckCircle2, fundo: "bg-success-soft text-success" },
  ausencia_registrada: { icone: CalendarX2, fundo: "bg-destructive-soft text-destructive" },
  proxima_parada: { icone: "van", fundo: "bg-warning-soft text-warning" },
  boa_viagem: { icone: "van", fundo: "bg-success-soft text-success" },
};

/** "Hoje", "Ontem" or "16/11". */
export function quandoFoi(data: string, hoje: string) {
  if (data === hoje) return "Hoje";
  if (data === somarDias(hoje, -1)) return "Ontem";
  return diaMes(data);
}

/** The notices of one person, newest first, with "Novo" on the ones not seen before; "Limpar" takes them all away. */
export function ListaDeAvisos({
  avisos,
  novos,
  tipos,
  onLimpar,
}: {
  avisos: Aviso[];
  novos: Set<string>;
  tipos: Record<string, { label: string; cor: string }>;
  onLimpar: () => void;
}) {
  const hoje = dataDeHoje();
  return (
    <section>
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Avisos
        </h2>
        <LimparAvisos quantos={avisos.length} onLimpar={onLimpar} />
      </div>
      <ul className="mt-1.5 space-y-2.5">
        {avisos.map((aviso) => {
          const visual = ICONE[aviso.tipo] ?? {
            icone: Bell,
            fundo: "bg-surface text-muted-foreground",
          };
          const Icone = visual.icone;
          const novo = novos.has(aviso.id);
          return (
            <li
              key={aviso.id}
              className={`flex gap-3 rounded-3xl p-3.5 shadow-card ${novo ? "bg-primary-soft/60" : "bg-card"}`}
            >
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${visual.fundo}`}
              >
                {Icone === "van" ? <VanIcon className="h-6 w-6" /> : <Icone className="h-5 w-5" />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p
                    className={`truncate text-xs font-semibold uppercase tracking-wider ${tipos[aviso.tipo]?.cor || "text-muted-foreground"}`}
                  >
                    {tipos[aviso.tipo]?.label || aviso.tipo}
                  </p>
                  <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                    {novo && <span className="h-2 w-2 rounded-full bg-primary" aria-label="Novo" />}
                    {quandoFoi(aviso.dataCriacao, hoje)}
                  </span>
                </div>
                <p className="mt-0.5 text-[0.95rem] font-semibold leading-snug text-foreground">
                  {aviso.textoResumido}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function LimparAvisos({ quantos, onLimpar }: { quantos: number; onLimpar: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 gap-1.5 px-2.5 text-sm font-semibold text-muted-foreground"
        >
          <Trash2 className="!h-4 !w-4" /> Limpar
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-[calc(100%-2.5rem)] rounded-3xl sm:max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Limpar os avisos?</AlertDialogTitle>
          <AlertDialogDescription>
            {quantos === 1 ? "O aviso sai" : `Os ${quantos} avisos saem`} da lista. Não dá para
            desfazer. Os avisos novos continuam chegando.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className={buttonVariants({ variant: "outline", size: "lg" })}>
            Voltar
          </AlertDialogCancel>
          <AlertDialogAction
            className={buttonVariants({ variant: "destructive", size: "lg" })}
            onClick={onLimpar}
          >
            <Trash2 className="!h-5 !w-5" /> Limpar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
