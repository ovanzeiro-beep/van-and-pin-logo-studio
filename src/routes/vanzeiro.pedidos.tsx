import { createFileRoute, useCanGoBack, useNavigate, useRouter } from "@tanstack/react-router";
import { ArrowLeft, UserPlus } from "lucide-react";
import { PedidoCard } from "@/components/app/PassageirosDoDestino";
import { VanzeiroHeader } from "@/components/app/VanzeiroHeader";
import { nomeDestino } from "@/lib/destinos";
import { useDestinos } from "@/lib/destinos-store";
import { usePedidos } from "@/lib/passageiros-store";

export const Route = createFileRoute("/vanzeiro/pedidos")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Pedidos para entrar — O Vanzeiro" },
      { name: "description", content: "Todas as pessoas que pediram para entrar nos seus destinos." },
      { property: "og:title", content: "Pedidos para entrar — O Vanzeiro" },
      { property: "og:description", content: "Todas as pessoas que pediram para entrar nos seus destinos." },
    ],
  }),
  component: TodosOsPedidos,
});

function TodosOsPedidos() {
  const pedidos = usePedidos();
  const destinos = useDestinos();
  const router = useRouter();
  const podeVoltar = useCanGoBack();
  const navigate = useNavigate();
  const voltar = () => (podeVoltar ? router.history.back() : navigate({ to: "/vanzeiro" }));
  const nomeDoDestino = (id: string) => {
    const d = destinos.find((x) => x.id === id);
    return d ? nomeDestino(d) : undefined;
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <VanzeiroHeader compacto titulo="Pedidos para entrar" subtitulo="Pessoas que querem entrar na sua van.">
        <button
          type="button"
          onClick={voltar}
          className="relative mt-3 inline-flex h-9 items-center gap-1.5 rounded-full bg-header-foreground/10 px-3.5 text-sm font-semibold transition-colors hover:bg-header-foreground/20"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>
      </VanzeiroHeader>

      {pedidos.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-8 py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary-soft text-primary">
            <UserPlus className="h-8 w-8" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-foreground">Nenhum pedido novo</h2>
          <p className="mt-1 text-sm text-muted-foreground">Quando alguém usar o seu código de convite, aparece aqui.</p>
        </div>
      ) : (
        <ul className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 pb-4 pt-4">
          {pedidos.map((p) => (
            <PedidoCard key={p.id} pedido={p} destino={nomeDoDestino(p.destinoId)} />
          ))}
        </ul>
      )}
    </div>
  );
}
