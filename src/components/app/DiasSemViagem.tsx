import { useState } from "react";
import { CalendarX2, Undo2 } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import type { Destino } from "@/data/exemplo";
import { dataDeHoje } from "@/lib/agora";
import { formatarData } from "@/lib/destinos";
import { cancelarViagemDoDia, desfazerCancelamento, diasCanceladosFuturos, diasQuePodemSerCancelados, MOTIVO_MAX } from "@/lib/dias-sem-viagem";
import { useViagensDoDia } from "@/lib/viagem-store";
import { fazer } from "@/lib/acoes";

const rotuloDoDia = (data: string) => (data === dataDeHoje() ? `Hoje, ${formatarData(data).split(", ")[1] ?? ""}` : formatarData(data));

/** "Não vai ter viagem" on one day (feriado): asks which day and why, warns that there is no discount. */
export function CancelarViagemDoDia({ d, dataFixa, gatilho }: { d: Destino; dataFixa?: string; gatilho: React.ReactNode }) {
  useViagensDoDia();
  const opcoes = dataFixa ? [dataFixa] : diasQuePodemSerCancelados(d);
  const [data, setData] = useState(opcoes[0] ?? "");
  const [motivo, setMotivo] = useState("");
  if (opcoes.length === 0 || (dataFixa && !diasQuePodemSerCancelados(d).includes(dataFixa))) return null;
  const pode = data !== "" && motivo.trim() !== "" && motivo.trim().length <= MOTIVO_MAX;
  return (
    <AlertDialog
      onOpenChange={(aberto) => {
        if (aberto) {
          setData(opcoes[0] ?? "");
          setMotivo("");
        }
      }}
    >
      <AlertDialogTrigger asChild>{gatilho}</AlertDialogTrigger>
      <AlertDialogContent className="max-w-[calc(100%-2.5rem)] rounded-3xl sm:max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle>{dataFixa ? "Não vai ter viagem hoje?" : "Não vai ter viagem em qual dia?"}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 text-left">
              {!dataFixa && (
                <label className="block">
                  <span className="text-sm font-semibold text-foreground">Dia</span>
                  <select
                    className="mt-1 h-11 w-full rounded-xl border border-input bg-surface px-3 text-sm text-foreground"
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                  >
                    {opcoes.map((o) => (
                      <option key={o} value={o}>
                        {rotuloDoDia(o)}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <label className="block">
                <span className="text-sm font-semibold text-foreground">Motivo</span>
                <Input
                  className="mt-1 h-11 rounded-xl"
                  placeholder="Ex.: Feriado"
                  maxLength={MOTIVO_MAX}
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                />
              </label>
              <p>Os passageiros recebem um aviso. Quem paga por mês ou quinzena não ganha desconto.</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className={buttonVariants({ variant: "outline", size: "lg" })}>Voltar</AlertDialogCancel>
          <AlertDialogAction
            className={buttonVariants({ variant: "destructive", size: "lg" })}
            disabled={!pode}
            onClick={() => void fazer(() => cancelarViagemDoDia(d.id, data, motivo))}
          >
            Cancelar a viagem
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/** Destino page: the cancelled days still ahead (with "Desfazer") and the button to cancel one more. */
export function DiasSemViagem({ d }: { d: Destino }) {
  const futuros = diasCanceladosFuturos(d);
  const temDiaParaCancelar = diasQuePodemSerCancelados(d).length > 0;
  if (futuros.length === 0 && !temDiaParaCancelar) return null;
  return (
    <section className="rounded-3xl bg-card p-4 shadow-card">
      <div className="mb-3 flex items-center gap-2">
        <CalendarX2 className="h-4 w-4 text-muted-foreground" />
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Dias sem viagem</p>
      </div>
      {futuros.length > 0 && (
        <ul className="mb-3 space-y-2">
          {futuros.map((c) => (
            <li key={c.data} className="flex items-center gap-3 rounded-2xl bg-destructive-soft px-3.5 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="font-bold text-foreground">{rotuloDoDia(c.data)}</p>
                <p className="truncate text-sm text-muted-foreground">{c.motivo}</p>
              </div>
              <Button size="sm" variant="outline" className="shrink-0 rounded-xl" onClick={() => void fazer(() => desfazerCancelamento(d.id, c.data))}>
                <Undo2 className="!h-4 !w-4" /> Desfazer
              </Button>
            </li>
          ))}
        </ul>
      )}
      {temDiaParaCancelar && (
        <CancelarViagemDoDia
          d={d}
          gatilho={
            <Button size="lg" variant="outline" className="w-full">
              <CalendarX2 className="!h-5 !w-5" /> Cancelar a viagem de um dia
            </Button>
          }
        />
      )}
    </section>
  );
}
