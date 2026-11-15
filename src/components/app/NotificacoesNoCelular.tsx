import { Bell, BellOff, BellRing } from "lucide-react";
import { StatusBadge } from "@/components/app/InfoCard";
import { Button } from "@/components/ui/button";
import { useNotificacoesNoCelular } from "@/lib/notificacoes";

/** Perfil card: turns on the avisos as phone notifications (decision A2). Hidden where the phone can't do it. */
export function NotificacoesNoCelular() {
  const { permissao, ativar } = useNotificacoesNoCelular();
  if (permissao === "sem-suporte") return null;
  const Icone = permissao === "ativada" ? BellRing : permissao === "bloqueada" ? BellOff : Bell;
  return (
    <section className="rounded-3xl bg-card p-4 shadow-card">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
          <Icone className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notificações no celular</p>
          <p className="text-sm text-foreground">
            {permissao === "ativada"
              ? "Os avisos do sininho chegam no celular."
              : permissao === "bloqueada"
                ? "Bloqueadas. Para ativar, libere nas configurações do celular."
                : "Receba os avisos do sininho no celular."}
          </p>
        </div>
        {permissao === "ativada" && <StatusBadge status="pago">Ativadas</StatusBadge>}
      </div>
      {permissao === "nao-pedida" && (
        <Button size="lg" className="mt-3 w-full" onClick={() => void ativar()}>
          <Bell className="!h-5 !w-5" /> Ativar
        </Button>
      )}
    </section>
  );
}
