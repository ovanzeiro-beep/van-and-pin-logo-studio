import { createFileRoute, Outlet } from "@tanstack/react-router";
import { CalendarDays, Home, Receipt, User } from "lucide-react";
import { BottomNav, type NavItem } from "@/components/app/BottomNav";
import { MobileScreen } from "@/components/app/MobileScreen";

const itens: NavItem[] = [
  { to: "/passageiro", label: "Início", icon: Home, exact: true },
  { to: "/passageiro/viagens", label: "Viagens", icon: CalendarDays },
  { to: "/passageiro/pagamentos", label: "Pagamentos", icon: Receipt },
  { to: "/passageiro/perfil", label: "Perfil", icon: User },
];

export const Route = createFileRoute("/passageiro")({
  component: PainelPassageiro,
});

function PainelPassageiro() {
  return (
    <MobileScreen>
      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
      <BottomNav items={itens} />
    </MobileScreen>
  );
}
