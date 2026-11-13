import { createFileRoute } from "@tanstack/react-router";
import { Wallet } from "lucide-react";
import { PlaceholderTab } from "@/components/app/PlaceholderTab";
import { passageiroExemplo } from "@/data/exemplo";

export const Route = createFileRoute("/passageiro/pagamentos")({
  head: () => ({
    meta: [
      { title: "Pagamentos — O Vanzeiro" },
      { name: "description", content: "Pagamentos no O Vanzeiro." },
      { property: "og:title", content: "Pagamentos — O Vanzeiro" },
      { property: "og:description", content: "Pagamentos no O Vanzeiro." },
    ],
  }),
  component: () => <PlaceholderTab titulo="Pagamentos" nome={passageiroExemplo.nome} icon={Wallet} />,
});
