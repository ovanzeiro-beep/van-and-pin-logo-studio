import { createFileRoute } from "@tanstack/react-router";
import { Route as RouteIcon } from "lucide-react";
import { PlaceholderTab } from "@/components/app/PlaceholderTab";
import { vanzeiroExemplo } from "@/data/exemplo";
import { useAbrirPedidos } from "@/components/app/VanzeiroHeader";
import { useAvisosVanzeiro } from "@/lib/passageiros-store";

export const Route = createFileRoute("/vanzeiro/viagem")({
  head: () => ({
    meta: [
      { title: "Viagem — O Vanzeiro" },
      { name: "description", content: "Viagem no O Vanzeiro." },
      { property: "og:title", content: "Viagem — O Vanzeiro" },
      { property: "og:description", content: "Viagem no O Vanzeiro." },
    ],
  }),
  component: AbaViagem,
});

function AbaViagem() {
  const avisos = useAvisosVanzeiro();
  const abrirPedidos = useAbrirPedidos();
  return <PlaceholderTab titulo="Viagem" nome={vanzeiroExemplo.nome} icon={RouteIcon} avisos={avisos} aoTocarAvisos={abrirPedidos} />;
}
