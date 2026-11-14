import type { ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
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
import { buttonVariants } from "@/components/ui/button";
import { sair } from "@/lib/acesso";

/** "Sair" with the "Quer mesmo sair?" confirmation; `children` is the button that opens it. */
export function ConfirmarSair({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent className="max-w-[calc(100%-2.5rem)] rounded-3xl sm:max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Quer mesmo sair?</AlertDialogTitle>
          <AlertDialogDescription>Você volta para a tela Entrar.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className={buttonVariants({ variant: "outline", size: "lg" })}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            className={buttonVariants({ variant: "destructive", size: "lg" })}
            onClick={() => {
              sair();
              navigate({ to: "/entrar" });
            }}
          >
            Sair
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
