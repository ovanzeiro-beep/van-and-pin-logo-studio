import { createFileRoute } from "@tanstack/react-router";
import { User } from "lucide-react";
import { PlaceholderTab } from "@/components/app/PlaceholderTab";
import { vanzeiroExemplo } from "@/data/exemplo";
import { useAbrirPedidos } from "@/components/app/VanzeiroHeader";
import { useAvisosVanzeiro } from "@/lib/passageiros-store";

export const Route = createFileRoute("/vanzeiro/perfil")({
  head: () => ({
    meta: [
      { title: "Perfil — O Vanzeiro" },
      { name: "description", content: "Perfil no O Vanzeiro." },
      { property: "og:title", content: "Perfil — O Vanzeiro" },
      { property: "og:description", content: "Perfil no O Vanzeiro." },
    ],
  }),
  component: AbaPerfil,
});

function AbaPerfil() {
  const avisos = useAvisosVanzeiro();
  const abrirPedidos = useAbrirPedidos();
  return <PlaceholderTab titulo="Perfil" nome={vanzeiroExemplo.nome} icon={User} avisos={avisos} aoTocarAvisos={abrirPedidos} />;
}
