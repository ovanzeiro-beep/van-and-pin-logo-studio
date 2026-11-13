import { createFileRoute } from "@tanstack/react-router";
import { Wallet } from "lucide-react";
import { PlaceholderTab } from "@/components/app/PlaceholderTab";
import { vanzeiroExemplo } from "@/data/exemplo";
import { useAbrirPedidos } from "@/components/app/VanzeiroHeader";
import { useAvisosVanzeiro } from "@/lib/passageiros-store";

export const Route = createFileRoute("/vanzeiro/financeiro")({
  head: () => ({
    meta: [
      { title: "Financeiro — O Vanzeiro" },
      { name: "description", content: "Financeiro no O Vanzeiro." },
      { property: "og:title", content: "Financeiro — O Vanzeiro" },
      { property: "og:description", content: "Financeiro no O Vanzeiro." },
    ],
  }),
  component: AbaFinanceiro,
});

function AbaFinanceiro() {
  const avisos = useAvisosVanzeiro();
  const abrirPedidos = useAbrirPedidos();
  return <PlaceholderTab titulo="Financeiro" nome={vanzeiroExemplo.nome} icon={Wallet} avisos={avisos} aoTocarAvisos={abrirPedidos} />;
}
