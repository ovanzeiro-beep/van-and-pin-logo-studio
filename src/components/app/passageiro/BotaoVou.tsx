import { useState } from "react";
import {
  AlarmClock,
  AlertTriangle,
  Armchair,
  CalendarDays,
  Check,
  Clock,
  MapPin,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import type { Destino, RespostaViagem } from "@/data/exemplo";
import { agora } from "@/lib/agora";
import { formatarData } from "@/lib/datas";
import { nomeDestino, prazoDaViagem, prazoPassou } from "@/lib/destinos";
import { useDestinos } from "@/lib/destinos-store";
import { useVanLotadaPara } from "@/lib/respostas-store";
import { aconteceEm } from "@/lib/viagem";
import { fazer } from "@/lib/acoes";
import { responderNoBanco } from "@/lib/banco/respostas";

/** "Qua, 18 de nov" → "Quarta, 18 de nov"; today → "Hoje, 18 de nov". */
const NOME_DO_DIA: Record<string, string> = {
  Dom: "Domingo",
  Seg: "Segunda",
  Ter: "Terça",
  Qua: "Quarta",
  Qui: "Quinta",
  Sex: "Sexta",
  Sáb: "Sábado",
};
export function diaPorExtenso(data: string, hoje: string) {
  const [semana = "", resto = ""] = formatarData(data).split(", ");
  return `${data === hoje ? "Hoje" : (NOME_DO_DIA[semana] ?? semana)}, ${resto}`;
}

/**
 * Owner (17/11/2026): "Vou" first shows the trip it is for (day, route, departure and deadline), so nobody confirms
 * the wrong day. When today's deadline already closed, it says so and makes clear the confirmation is for the next trip.
 */
export function textoDaConfirmacao(
  d: Pick<Destino, "saida" | "prazo" | "ativo" | "tipo" | "dias" | "data" | "diasCancelados">,
  data: string,
  momento: { data: string; hora: string },
) {
  const prazo = prazoDaViagem(d, data);
  const ate =
    prazo.data === data
      ? `até as ${prazo.hora}`
      : `até ${diaPorExtenso(prazo.data, momento.data).toLowerCase()}, às ${prazo.hora}`;
  const hojeFechou =
    data !== momento.data && aconteceEm(d, momento.data) && prazoPassou(d, momento.data, momento);
  const prazoDeHoje = prazoDaViagem(d, momento.data);
  return {
    dia: diaPorExtenso(data, momento.data),
    saida: `Saída às ${d.saida}`,
    prazo: `Pode desistir no app ${ate}`,
    aviso: hojeFechou
      ? `O prazo da viagem de hoje encerrou às ${prazoDeHoje.hora}. Esta confirmação é para ${diaPorExtenso(data, momento.data).toLowerCase()}.`
      : null,
  };
}

/** "Vou", or "Van lotada" (disabled) when every seat of this trip is already taken. */
export function BotaoVou({
  passageiroId,
  destinoId,
  data,
  resposta,
}: {
  passageiroId: string;
  destinoId: string;
  data: string;
  resposta: RespostaViagem | undefined;
}) {
  const lotada = useVanLotadaPara(passageiroId, destinoId, data);
  const destino = useDestinos().find((d) => d.id === destinoId);
  const [aberto, setAberto] = useState(false);
  if (lotada) {
    return (
      <Button variant="outline" disabled aria-disabled>
        <Armchair className="!h-5 !w-5" /> Van lotada
      </Button>
    );
  }
  const confirmar = async () => {
    const r = await fazer(() => responderNoBanco(passageiroId, data, "vai"));
    if (r.ok) setAberto(false);
  };
  const t = destino ? textoDaConfirmacao(destino, data, agora()) : null;
  return (
    <>
      <Button
        variant={resposta === "vai" ? "success" : "cta"}
        onClick={() => (resposta === "vai" || !t ? void confirmar() : setAberto(true))}
        aria-pressed={resposta === "vai"}
      >
        <Check className="!h-5 !w-5" /> Vou
      </Button>
      {t && destino && (
        <AlertDialog open={aberto} onOpenChange={setAberto}>
          <AlertDialogContent className="max-w-[calc(100%-2.5rem)] rounded-3xl sm:max-w-sm">
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar presença</AlertDialogTitle>
              <AlertDialogDescription>Confira a viagem antes de confirmar.</AlertDialogDescription>
            </AlertDialogHeader>
            {t.aviso && (
              <p
                className="flex gap-2 rounded-2xl bg-warning-soft px-3.5 py-2.5 text-sm font-semibold text-warning"
                role="status"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {t.aviso}
              </p>
            )}
            <dl className="space-y-2 rounded-2xl bg-surface p-3.5 text-sm">
              <div className="flex items-center gap-2.5">
                <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
                <dd className="font-display text-base font-bold text-foreground">{t.dia}</dd>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                <dd className="font-semibold text-foreground">{nomeDestino(destino)}</dd>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
                <dd className="font-semibold text-foreground">{t.saida}</dd>
              </div>
              <div className="flex items-center gap-2.5">
                <AlarmClock className="h-4 w-4 shrink-0 text-muted-foreground" />
                <dd className="text-muted-foreground">{t.prazo}</dd>
              </div>
            </dl>
            <AlertDialogFooter className="gap-2">
              <AlertDialogCancel className={buttonVariants({ variant: "outline", size: "lg" })}>
                Voltar
              </AlertDialogCancel>
              <Button size="lg" variant="cta" onClick={() => void confirmar()}>
                <Check className="!h-5 !w-5" /> Confirmar que vou
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
