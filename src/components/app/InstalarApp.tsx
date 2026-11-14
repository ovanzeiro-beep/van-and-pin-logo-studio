import { Download } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { instalar, useComoInstalar } from "@/lib/instalar";

const pilula =
  "relative inline-flex h-9 items-center gap-1.5 rounded-full bg-header-foreground/10 px-3.5 text-sm font-semibold text-header-foreground transition-colors hover:bg-header-foreground/20";

/** "Instalar o app" in the blue header: opens the install (Android) or explains how to add it (iPhone). */
export function InstalarApp() {
  const como = useComoInstalar();
  if (como === null) return null;
  if (como === "botao") {
    return (
      <button type="button" className={pilula} onClick={() => void instalar()}>
        <Download className="h-4 w-4" /> Instalar o app
      </button>
    );
  }
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button type="button" className={pilula}>
          <Download className="h-4 w-4" /> Instalar o app
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-[calc(100%-2.5rem)] rounded-3xl sm:max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Instalar no iPhone</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <ol className="list-decimal space-y-1 pl-5 text-left">
              <li>Toque em Compartilhar (o quadrado com a seta, na barra do Safari).</li>
              <li>Toque em "Adicionar à Tela de Início".</li>
              <li>Abra o app pelo ícone da van, na tela de início.</li>
            </ol>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction className={buttonVariants({ size: "lg" })}>Entendi</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
