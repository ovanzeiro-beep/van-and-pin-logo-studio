import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { CalendarDays, Home, User, Wallet } from "lucide-react";
import { BottomNav, type NavItem } from "@/components/app/BottomNav";
import { MobileScreen } from "@/components/app/MobileScreen";
import { EntrarNaVan } from "@/components/app/passageiro/EntrarNaVan";
import { useEmAbertoDeQuemSaiu, useMinhaSituacao } from "@/lib/sessao-passageiro";

const itens: NavItem[] = [
  { to: "/passageiro", label: "Início", icon: Home, exact: true },
  { to: "/passageiro/viagens", label: "Viagens", icon: CalendarDays },
  { to: "/passageiro/pagamentos", label: "Pagamentos", icon: Wallet },
  { to: "/passageiro/perfil", label: "Perfil", icon: User },
];

export const Route = createFileRoute("/passageiro")({
  component: PainelPassageiro,
});

/** Decision A3: someone with no destino left who still owes keeps the Pagamentos tab. */
const itensDeQuemSaiu = itens.filter((i) => i.to === "/passageiro" || i.to === "/passageiro/pagamentos");

function PainelPassageiro() {
  const situacao = useMinhaSituacao();
  const emAberto = useEmAbertoDeQuemSaiu();
  const caminho = useRouterState({ select: (s) => s.location.pathname });
  const membro = situacao.tipo === "membro";
  const emPagamentos = !!emAberto && caminho.startsWith("/passageiro/pagamentos");
  return (
    // Fixed-height shell: pages scroll inside <main>, so lists can scroll under a pinned header.
    <MobileScreen className="h-dvh md:h-[calc(100dvh-3rem)]">
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {/* Until the passenger is in a van, the panel is the "Entrar na van" screen. */}
        {membro || emPagamentos ? <Outlet /> : <EntrarNaVan />}
      </main>
      {membro ? <BottomNav items={itens} /> : emAberto && <BottomNav items={itensDeQuemSaiu} />}
    </MobileScreen>
  );
}
