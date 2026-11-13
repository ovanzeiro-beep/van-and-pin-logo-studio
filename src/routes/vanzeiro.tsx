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
    <MobileScreen>
      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
      <BottomNav items={itens} />
    </MobileScreen>
  );
}
