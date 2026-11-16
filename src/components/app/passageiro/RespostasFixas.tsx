import { useState } from "react";
import { CalendarDays, CalendarX2, X } from "lucide-react";
import { CampoComIcone } from "@/components/app/CampoComIcone";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { Destino, Passageiro } from "@/data/exemplo";
import { dataDeHoje } from "@/lib/agora";
import { diaMes } from "@/lib/cobrancas";
import { nomeDestino } from "@/lib/destinos";
import { problemaDoPeriodo } from "@/lib/respostas-fixas";
import {
  ligarVouSempre,
  marcarNaoVouNoPeriodo,
  periodosDeNaoVou,
  tirarNaoVouDoPeriodo,
  useRespostasFixas,
  vouSempreLigado,
} from "@/lib/respostas-store";

/** T3: "Vou sempre" and "Não vou de… até…", one card per destino the person is in. */
export function RespostasFixas({ eu, destino }: { eu: Passageiro; destino: Destino }) {
  const fixas = useRespostasFixas();
  const ligado = vouSempreLigado(fixas, eu.id);
  const periodos = periodosDeNaoVou(fixas, eu.id, dataDeHoje());
  const idDoSwitch = `vou-sempre-${eu.id}`;
  return (
    <article className="rounded-3xl bg-card p-3.5 shadow-card">
      <p className="text-sm font-semibold text-foreground">{nomeDestino(destino)}</p>
      <div className="mt-2 flex items-center justify-between gap-3 rounded-2xl bg-surface px-3.5 py-2.5">
        <label htmlFor={idDoSwitch} className="min-w-0">
          <span className="block font-semibold text-foreground">Vou sempre</span>
          <span className="block text-sm text-muted-foreground">Todo dia de viagem já conta como "Vou". Se num dia não for, toque em "Não vou".</span>
        </label>
        <Switch id={idDoSwitch} checked={ligado} onCheckedChange={(v) => ligarVouSempre(eu.id, v)} />
      </div>
      {periodos.length > 0 && (
        <ul className="mt-2 space-y-1.5">
          {periodos.map((n) => (
            <li key={n.id} className="flex items-center justify-between gap-2 rounded-2xl bg-destructive-soft px-3.5 py-1.5">
              <span className="text-sm font-semibold text-destructive">
                Não vou de {diaMes(n.de)} até {diaMes(n.ate)}
              </span>
              <Button variant="ghost" size="sm" className="h-9 px-2.5 text-sm font-semibold" onClick={() => tirarNaoVouDoPeriodo(n.id)}>
                <X className="!h-4 !w-4" /> Tirar
              </Button>
            </li>
          ))}
        </ul>
      )}
      <NaoVouNoPeriodo passageiroId={eu.id} />
    </article>
  );
}

function NaoVouNoPeriodo({ passageiroId }: { passageiroId: string }) {
  const [aberto, setAberto] = useState(false);
  const [de, setDe] = useState("");
  const [ate, setAte] = useState("");
  const [tentou, setTentou] = useState(false);
  const problema = problemaDoPeriodo(de, ate, dataDeHoje());
  const abrir = (v: boolean) => {
    setAberto(v);
    if (v) {
      setDe("");
      setAte("");
      setTentou(false);
    }
  };
  const salvar = () => {
    setTentou(true);
    if (problema) return;
    marcarNaoVouNoPeriodo(passageiroId, de, ate);
    setAberto(false);
  };
  return (
    <AlertDialog open={aberto} onOpenChange={abrir}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="mt-2 h-11 w-full rounded-2xl font-semibold">
          <CalendarX2 className="!h-5 !w-5 text-destructive" /> Não vou de… até…
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-[calc(100%-2.5rem)] rounded-3xl sm:max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Não vou de… até…</AlertDialogTitle>
          <AlertDialogDescription>Férias, viagem, atestado: todos os dias de viagem nesse período já contam como "Não vou", avisado no prazo.</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <CampoComIcone id={`nv-de-${passageiroId}`} label="Primeiro dia" icon={CalendarDays} type="date" min={dataDeHoje()} value={de} onChange={(e) => setDe(e.target.value)} className="pl-11 pr-1 text-sm md:text-sm" />
          <CampoComIcone id={`nv-ate-${passageiroId}`} label="Último dia" icon={CalendarDays} type="date" min={de || dataDeHoje()} value={ate} onChange={(e) => setAte(e.target.value)} className="pl-11 pr-1 text-sm md:text-sm" />
        </div>
        {tentou && problema && <p className="text-sm font-medium text-destructive">{problema}</p>}
        <AlertDialogFooter className="gap-2">
          <Button size="lg" className="h-12 w-full" onClick={salvar}>
            Salvar
          </Button>
          <AlertDialogCancel className="m-0 h-12 w-full">Cancelar</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
