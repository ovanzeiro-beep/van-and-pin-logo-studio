import { createFileRoute, Outlet } from "@tanstack/react-router";
import { CalendarDays, Home, User, Wallet } from "lucide-react";
import { BottomNav, type NavItem } from "@/components/app/BottomNav";
import { MobileScreen } from "@/components/app/MobileScreen";
import { EntrarNaVan } from "@/components/app/passageiro/EntrarNaVan";
import { useMinhaSituacao } from "@/lib/sessao-passageiro";

const itens: NavItem[] = [
  { to: "/passageiro", label: "Início", icon: Home, exact: true },
  { to: "/passageiro/viagens", label: "Viagens", icon: CalendarDays },
  { to: "/passageiro/pagamentos", label: "Pagamentos", icon: Wallet },
  { to: "/passageiro/perfil", label: "Perfil", icon: User },
];

export const Route = createFileRoute("/passageiro")({
  component: PainelPassageiro,
});

function PainelPassageiro() {
  const situacao = useMinhaSituacao();
  return (
    // Fixed-height shell: pages scroll inside <main>, so lists can scroll under a pinned header.
    <MobileScreen className="h-dvh md:h-[calc(100dvh-3rem)]">
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {/* Until the passenger is in a van, the panel is the "Entrar na van" screen. */}
        {situacao.tipo === "membro" ? <Outlet /> : <EntrarNaVan />}
      </main>
      {situacao.tipo === "membro" && <BottomNav items={itens} />}
    </MobileScreen>
  );
}
