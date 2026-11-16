import { useState } from "react";
import { Check, MessageCircle } from "lucide-react";
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
import { mensagemDosAtrasados, type Devedor } from "@/lib/cobrancas";
import { formatarReais } from "@/lib/dinheiro";
import { linkWhatsApp } from "@/lib/passageiros";
import { pixCopiaECola } from "@/lib/pix";
import { cn } from "@/lib/utils";

/**
 * T2: "Cobrar quem está devendo". One WhatsApp message per person, sent one by one by the vanzeiro
 * (the app never sends by itself). Each message lists what is overdue, the total and the Pix with the value.
 */
export function CobrarDevedores({
  lista,
  pix,
  nomeDoVanzeiro,
  nomeDoDestino,
  cidadeDoDestino,
}: {
  lista: Devedor[];
  pix: string;
  nomeDoVanzeiro: string;
  nomeDoDestino: (destinoId: string) => string;
  cidadeDoDestino: (destinoId: string) => string;
}) {
  const [enviados, setEnviados] = useState<string[]>([]);
  if (lista.length === 0) return null;
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="mt-3 h-11 w-full rounded-full font-semibold">
          <MessageCircle className="!h-5 !w-5 text-success" /> Cobrar quem está devendo (
          {lista.length})
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="flex max-h-[calc(100dvh-2.5rem)] max-w-[calc(100%-2.5rem)] flex-col rounded-3xl sm:max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Cobrar quem está devendo</AlertDialogTitle>
          <AlertDialogDescription>
            Toque em cada pessoa para abrir o WhatsApp com a mensagem pronta
            {pix ? ", já com o seu Pix" : ""}. Você envia uma por vez.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <ul className="-mx-1 min-h-0 flex-1 space-y-2 overflow-y-auto px-1">
          {lista.map((d) => {
            const enviado = enviados.includes(d.passageiroId);
            const copiaECola = pix
              ? pixCopiaECola({
                  chave: pix,
                  nome: nomeDoVanzeiro,
                  cidade: cidadeDoDestino(d.cobrancas[0]?.destinoId ?? ""),
                  centavos: d.total,
                })
              : null;
            return (
              <li key={d.passageiroId}>
                <a
                  href={linkWhatsApp(
                    d.telefone,
                    mensagemDosAtrasados(d, nomeDoDestino, { chave: pix, copiaECola }),
                  )}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() =>
                    setEnviados((e) => (e.includes(d.passageiroId) ? e : [...e, d.passageiroId]))
                  }
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border px-3.5 py-3 transition-colors",
                    enviado ? "border-success/30 bg-success/5" : "border-border bg-card",
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-foreground">{d.nome}</p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-bold text-destructive">{formatarReais(d.total)}</span> ·{" "}
                      {d.cobrancas.length > 1 ? `${d.cobrancas.length} cobranças` : "1 cobrança"}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-sm font-semibold",
                      enviado ? "text-success" : "bg-success text-success-foreground",
                    )}
                  >
                    {enviado ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <MessageCircle className="h-4 w-4" />
                    )}
                    {enviado ? "Enviado" : "Cobrar"}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
        <AlertDialogFooter>
          <AlertDialogCancel className="h-12 w-full">Fechar</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
