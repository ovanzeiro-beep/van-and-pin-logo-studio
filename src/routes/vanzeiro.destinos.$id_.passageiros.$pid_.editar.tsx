import { createFileRoute } from "@tanstack/react-router";
import { DestinoNaoEncontrado } from "@/components/app/DestinoNaoEncontrado";
import { PassageiroNaoEncontrado } from "@/components/app/PassageiroNaoEncontrado";
import { PassageiroWizard } from "@/components/app/PassageiroWizard";
import { useDestino } from "@/lib/destinos-store";
import { usePassageiro } from "@/lib/passageiros-store";

export const Route = createFileRoute("/vanzeiro/destinos/$id_/passageiros/$pid_/editar")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Editar passageiro — O Vanzeiro" },
      { name: "description", content: "Altere o contato, o embarque ou o plano de pagamento do passageiro." },
      { property: "og:title", content: "Editar passageiro — O Vanzeiro" },
      { property: "og:description", content: "Altere o contato, o embarque ou o plano de pagamento do passageiro." },
    ],
  }),
  component: EditarPassageiro,
});

function EditarPassageiro() {
  const { id, pid } = Route.useParams();
  const destino = useDestino(id);
  const passageiro = usePassageiro(pid);
  if (!destino) return <DestinoNaoEncontrado />;
  if (!passageiro || passageiro.destinoId !== destino.id) return <PassageiroNaoEncontrado destinoId={destino.id} />;
  return <PassageiroWizard key={passageiro.id} destino={destino} inicial={passageiro} />;
}
