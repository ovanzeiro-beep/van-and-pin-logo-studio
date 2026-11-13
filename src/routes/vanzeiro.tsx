import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Home, MapPin, Route as RouteIcon, User, Wallet } from "lucide-react";
import { BottomNav, type NavItem } from "@/components/app/BottomNav";
import { MobileScreen } from "@/components/app/MobileScreen";

const itens: NavItem[] = [
  { to: "/vanzeiro", label: "Início", icon: Home, exact: true },
  { to: "/vanzeiro/destinos", label: "Destinos", icon: MapPin },
  { to: "/vanzeiro/viagem", label: "Viagem", icon: RouteIcon },
  { to: "/vanzeiro/financeiro", label: "Financeiro", icon: Wallet },
  { to: "/vanzeiro/perfil", label: "Perfil", icon: User },
];

export const Route = createFileRoute("/vanzeiro")({
  component: PainelVanzeiro,
});

function PainelVanzeiro() {
  return (
    // Fixed-height shell: pages scroll inside <main>, so screens like Destinos can pin their header.
    <MobileScreen className="h-dvh md:h-[calc(100dvh-3rem)]">
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <Outlet />
      </main>
      <BottomNav items={itens} />
    </MobileScreen>
  );
}
