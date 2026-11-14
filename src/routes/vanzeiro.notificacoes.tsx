import { Link, createFileRoute, useCanGoBack, useNavigate, useRouter } from "@tanstack/react-router";
import { PedidoCard } from "@/components/app/PassageirosDoDestino";
import { VanzeiroHeader } from "@/components/app/VanzeiroHeader";
import { ListaDeAvisos } from "@/components/app/ListaDeAvisos";
import { TelaVazia } from "@/components/app/TelaVazia";
import { ArrowLeft, Bell, MapPin } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAvisosAoAbrir } from "@/lib/avisos-store";
import { nomeDestino } from "@/lib/destinos";
import { useDestinos } from "@/lib/destinos-store";
import { idDoVanzeiro } from "@/lib/sessao";
import { usePedidos } from "@/lib/passageiros-store";

const tipoAviso: Record<string, { label: string; cor: string }> = {
  pedido_novo: { label: "Pedido novo", cor: "text-primary" },
  resposta_passageiro: { label: "Resposta de passageiro", cor: "text-primary" },
  cobranca_vencida: { label: "Cobrança vencida", cor: "text-destructive" },
};

export const Route = createFileRoute("/vanzeiro/notificacoes")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Notificações — O Vanzeiro" },
      { name: "description", content: "Seus pedidos e avisos." },
      { property: "og:title", content: "Notificações — O Vanzeiro" },
      { property: "og:description", content: "Seus pedidos e avisos." },
    ],
  }),
  component: PaginaNotificacoes,
});

function PaginaNotificacoes() {
  const { avisos, novos } = useAvisosAoAbrir(idDoVanzeiro());
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
  const vazio = avisos.length === 0 && pedidos.length === 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <VanzeiroHeader compacto titulo="Notificações" subtitulo="Seus pedidos e avisos.">
        <button
          type="button"
          onClick={voltar}
          className="relative mt-3 inline-flex h-9 items-center gap-1.5 rounded-full bg-header-foreground/10 px-3.5 text-sm font-semibold transition-colors hover:bg-header-foreground/20"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>
      </VanzeiroHeader>
      {vazio ? (
        <TelaVazia
          icon={Bell}
          titulo="Nenhuma notificação"
          texto="Quando houver pedidos ou avisos, aparecerão aqui."
          botao={
            <Link to="/vanzeiro/destinos" className={cn(buttonVariants({ size: "lg" }), "w-full")}>
              <MapPin className="!h-5 !w-5" /> Ver destinos
            </Link>
          }
        />
      ) : (
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 pb-4 pt-4">
          {pedidos.length > 0 && (
            <section>
              <h2 className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pedidos para entrar</h2>
              <ul className="mt-1.5 space-y-3">
                {pedidos.map((p) => (
                  <PedidoCard key={p.id} pedido={p} destino={nomeDoDestino(p.destinoId)} />
                ))}
              </ul>
            </section>
          )}
          {avisos.length > 0 && (
            <section>
              <h2 className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Avisos</h2>
              <div className="mt-1.5">
                <ListaDeAvisos avisos={avisos} novos={novos} tipos={tipoAviso} />
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
