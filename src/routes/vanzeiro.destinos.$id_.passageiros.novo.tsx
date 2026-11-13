import { createFileRoute } from "@tanstack/react-router";
import { DestinoNaoEncontrado } from "@/components/app/DestinoNaoEncontrado";
import { PassageiroWizard } from "@/components/app/PassageiroWizard";
import { useDestino } from "@/lib/destinos-store";
import { usePedido } from "@/lib/passageiros-store";

export const Route = createFileRoute("/vanzeiro/destinos/$id_/passageiros/novo")({
  validateSearch: (search: Record<string, unknown>): { pedido?: string } =>
    typeof search["pedido"] === "string" ? { pedido: search["pedido"] } : {},
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Adicionar passageiro — O Vanzeiro" },
      { name: "description", content: "Cadastre um passageiro em 3 passos: contato, embarque e plano de pagamento." },
      { property: "og:title", content: "Adicionar passageiro — O Vanzeiro" },
      { property: "og:description", content: "Cadastre um passageiro em 3 passos: contato, embarque e plano de pagamento." },
    ],
  }),
  component: NovoPassageiro,
});

function NovoPassageiro() {
  const { id } = Route.useParams();
  const { pedido: pedidoId } = Route.useSearch();
  const destino = useDestino(id);
  const pedido = usePedido(pedidoId);
  if (!destino) return <DestinoNaoEncontrado />;
  return <PassageiroWizard key={pedidoId ?? "novo"} destino={destino} pedido={pedido} />;
}
