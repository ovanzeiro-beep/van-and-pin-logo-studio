import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { fazer } from "@/lib/acoes";
import { aceitarTermosEContinuar, naoAceitarTermos, useAceitePendente } from "@/lib/conta";

/** First time with Google: the box of the Termos (LGPD), one tap, right after coming back from Google. */
export function AceiteDosTermos() {
  const pendente = useAceitePendente();
  const [aceitou, setAceitou] = useState(false);
  return (
    <AlertDialog open={pendente}>
      <AlertDialogContent className="max-w-[calc(100%-2.5rem)] rounded-3xl sm:max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Falta só um passo</AlertDialogTitle>
          <AlertDialogDescription>
            Para usar o app com sua conta do Google, aceite os Termos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex items-start gap-3">
          <Checkbox
            id="aceite-google"
            checked={aceitou}
            onCheckedChange={(v) => setAceitou(v === true)}
            className="mt-0.5 h-5 w-5 rounded-md"
          />
          <label htmlFor="aceite-google" className="text-sm leading-snug text-foreground">
            Li e aceito os{" "}
            <Link to="/termos" className="font-bold text-primary underline underline-offset-2">
              Termos de Uso
            </Link>{" "}
            e a{" "}
            <Link to="/privacidade" className="font-bold text-primary underline underline-offset-2">
              Política de Privacidade
            </Link>
          </label>
        </div>
        <AlertDialogFooter className="gap-2">
          <Button
            variant="cta"
            size="lg"
            className="w-full"
            disabled={!aceitou}
            onClick={() => void fazer(aceitarTermosEContinuar)}
          >
            Aceitar e continuar
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => void fazer(naoAceitarTermos)}
          >
            Agora não
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
