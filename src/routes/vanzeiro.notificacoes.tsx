import { Link, createFileRoute } from "@tanstack/react-router";
import { PedidoCard } from "@/components/app/PassageirosDoDestino";
import { VanzeiroHeader } from "@/components/app/VanzeiroHeader";
import { ListaDeAvisos } from "@/components/app/ListaDeAvisos";
import { TelaVazia } from "@/components/app/TelaVazia";
import { Bell, Check, MapPin } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { limparAvisosDaPessoa, useAvisosAoAbrir } from "@/lib/avisos-store";
import { nomeDestino } from "@/lib/destinos";
import { useDestinos } from "@/lib/destinos-store";
import { idDoVanzeiro } from "@/lib/sessao";
import { RecusarMudanca } from "@/components/app/RecusarMudanca";
import { useMudancasAguardando, usePedidos, type MudancaDeEndereco } from "@/lib/passageiros-store";
import { textoDaDistancia } from "@/lib/endereco";
import { Button } from "@/components/ui/button";
import { BotaoVoltar } from "@/components/app/PilulaDoCabecalho";
import { fazer } from "@/lib/acoes";
import { responderMudancaNoBanco } from "@/lib/banco/passageiros";

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
  const { avisos, novos } = useAvisosAoAbrir(idDoVanzeiro(), "vanzeiro");
  const pedidos = usePedidos();
  const mudancas = useMudancasAguardando();
  const destinos = useDestinos();
  const nomeDoDestino = (id: string) => {
    const d = destinos.find((x) => x.id === id);
    return d ? nomeDestino(d) : undefined;
  };
  const vazio = avisos.length === 0 && pedidos.length === 0 && mudancas.length === 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <VanzeiroHeader compacto titulo="Notificações" subtitulo="Seus pedidos e avisos.">
        <BotaoVoltar senao="/vanzeiro" />
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
          {mudancas.length > 0 && (
            <section>
              <h2 className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mudanças de endereço</h2>
              <ul className="mt-1.5 space-y-3">
                {mudancas.map((m) => (
                  <MudancaCard key={m.id} m={m} destino={nomeDoDestino(m.destinoId)} />
                ))}
              </ul>
            </section>
          )}
          {avisos.length > 0 && <ListaDeAvisos avisos={avisos} novos={novos} tipos={tipoAviso} onLimpar={() => limparAvisosDaPessoa(idDoVanzeiro(), "vanzeiro")} />}
        </div>
      )}
    </div>
  );
}

/** A passenger asked to board farther than 1 km from the agreed point: the vanzeiro accepts or declines. */
function MudancaCard({ m, destino }: { m: MudancaDeEndereco; destino: string | undefined }) {
  return (
    <li className="rounded-3xl bg-card p-4 shadow-card">
      <p className="font-display text-lg font-bold leading-tight text-foreground">{m.nome}</p>
      <p className="text-sm text-muted-foreground">
        Quer mudar onde embarca{destino ? ` em ${destino}` : ""}
        {m.distanciaKm !== null ? ` (${textoDaDistancia(m.distanciaKm)} do ponto combinado)` : ""}.
      </p>
      <dl className="mt-2 space-y-1.5 text-sm">
        <div className="rounded-2xl bg-surface px-3 py-2">
          <dt className="text-[0.7rem] font-semibold text-muted-foreground">Hoje</dt>
          <dd className="font-semibold text-foreground">
            {m.de.cidade} · {m.de.endereco}
          </dd>
        </div>
        <div className="rounded-2xl bg-warning-soft px-3 py-2">
          <dt className="text-[0.7rem] font-semibold text-warning">Quer mudar para</dt>
          <dd className="font-semibold text-foreground">
            {m.para.cidade} · {m.para.endereco}
          </dd>
        </div>
      </dl>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <RecusarMudanca m={m} />
        <Button size="lg" variant="success" onClick={() => void fazer(() => responderMudancaNoBanco(m.id, true))}>
          <Check className="!h-5 !w-5" /> Aceitar
        </Button>
      </div>
    </li>
  );
}
