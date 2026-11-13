import { createFileRoute } from "@tanstack/react-router";
import { EntrarNaVan } from "@/components/app/passageiro/EntrarNaVan";

export const Route = createFileRoute("/passageiro/entrar-destino")({
  head: () => ({ meta: [
    { title: "Entrar em outro destino — O Vanzeiro" },
    { name: "description", content: "Peça para entrar em outro destino usando o código do vanzeiro." },
    { property: "og:title", content: "Entrar em outro destino — O Vanzeiro" },
    { property: "og:description", content: "Peça para entrar em outro destino usando o código do vanzeiro." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <EntrarNaVan outro />,
});