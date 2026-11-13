import type { ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeftRight, ChevronRight, FileText, LogOut, ShieldCheck } from "lucide-react";
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
import { Button, buttonVariants, type ButtonProps } from "@/components/ui/button";

/** Profile options shared by both panels: switch role, Termos, Política and "Sair" with confirmation. */
export function OpcoesDaConta({
  trocarPara,
  varianteSair = "outline",
}: {
  trocarPara: "passageiro" | "vanzeiro";
  varianteSair?: ButtonProps["variant"];
}) {
  const navigate = useNavigate();
  return (
    <>
      <section className="overflow-hidden rounded-3xl bg-card shadow-card">
        <LinhaLink to="/como-vai-usar" icon={<ArrowLeftRight className="h-5 w-5" />}>
          Trocar para {trocarPara}
        </LinhaLink>
        <LinhaLink to="/termos" icon={<FileText className="h-5 w-5" />}>
          Termos de Uso
        </LinhaLink>
        <LinhaLink to="/privacidade" icon={<ShieldCheck className="h-5 w-5" />}>
          Política de Privacidade
        </LinhaLink>
      </section>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="lg" variant={varianteSair} className="w-full">
            <LogOut className="!h-5 !w-5" /> Sair
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="max-w-[calc(100%-2.5rem)] rounded-3xl sm:max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Quer mesmo sair?</AlertDialogTitle>
            <AlertDialogDescription>Você volta para a tela Entrar.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className={buttonVariants({ variant: "outline", size: "lg" })}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: "destructive", size: "lg" })}
              onClick={() => navigate({ to: "/entrar" })}
            >
              Sair
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function LinhaLink({
  to,
  icon,
  children,
}: {
  to: "/como-vai-usar" | "/termos" | "/privacidade";
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <Link
      to={to}
      className="flex min-h-14 items-center gap-3 border-b border-border px-4 py-3 text-[0.95rem] font-semibold text-foreground transition-colors last:border-b-0 hover:bg-muted"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">{icon}</span>
      <span className="flex-1">{children}</span>
      <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </Link>
  );
}
