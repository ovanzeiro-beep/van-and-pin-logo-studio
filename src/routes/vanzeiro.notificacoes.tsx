import { Link, createFileRoute } from "@tanstack/react-router";
import { VanzeiroHeader } from "@/components/app/VanzeiroHeader";
import { TelaVazia } from "@/components/app/TelaVazia";
import { Bell, MapPin } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { diaMes } from "@/lib/cobrancas";
import { cn } from "@/lib/utils";
import { useAvisos } from "@/lib/avisos-store";
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
  const avisos = useAvisos();
  const pedidos = usePedidos();
  const noAvisos = avisos.length === 0 && pedidos.length === 0;

  return (
    <>
      <VanzeiroHeader compacto titulo="Notificações" subtitulo="Seus pedidos e avisos." />
      <div className="relative z-10 -mt-4 space-y-3 px-5 pb-4">
        {noAvisos ? (
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
          <section className="rounded-3xl bg-card p-4 shadow-card">
            {avisos.map((aviso) => (
              <div key={aviso.id} className="border-b border-border px-4 py-3 last:border-b-0">
                <p className={`text-xs font-semibold uppercase tracking-wider ${tipoAviso[aviso.tipo]?.cor || "text-muted-foreground"}`}>
                  {tipoAviso[aviso.tipo]?.label || aviso.tipo}
                </p>
                <p className="mt-1 font-semibold text-foreground">{aviso.textoResumido}</p>
                <p className="text-xs text-muted-foreground">{diaMes(aviso.dataCriacao)}</p>
              </div>
            ))}
          </section>
        )}
      </div>
    </>
  );
}
