import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, ChevronDown, ChevronRight, ChevronUp, Copy, MapPin, MessageCircle, Phone, Ticket, UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RecusarPedido } from "@/components/app/RecusarPedido";
import type { Destino, PedidoEntrada } from "@/data/exemplo";
import { mensagemConvite } from "@/lib/destinos";
import { useDestino } from "@/lib/destinos-store";
import { descricaoPlano, formatarTelefone, porCidade } from "@/lib/passageiros";
import { moverPassageiro, usePassageirosDoDestino, usePedidosDoDestino } from "@/lib/passageiros-store";

function TituloSecao({ icon: Icon, children }: { icon: typeof Users; children: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{children}</p>
    </div>
  );
}

export function CodigoConvite({ destino }: { destino: Destino }) {
  const [copiado, setCopiado] = useState(false);
  useEffect(() => {
    if (!copiado) return;
    const t = setTimeout(() => setCopiado(false), 2000);
    return () => clearTimeout(t);
  }, [copiado]);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(destino.convite);
      setCopiado(true);
    } catch {
      setCopiado(false);
    }
  };

  return (
    <section className="rounded-3xl bg-card p-4 shadow-card">
      <TituloSecao icon={Ticket}>Código de convite</TituloSecao>
      <div className="flex items-center gap-3">
        <p className="flex-1 font-display text-2xl font-bold tracking-wider text-foreground">{destino.convite}</p>
        <Button size="lg" variant="outline" onClick={copiar} aria-live="polite">
          {copiado ? <Check className="!h-5 !w-5 text-success" /> : <Copy className="!h-5 !w-5" />}
          {copiado ? "Copiado" : "Copiar"}
        </Button>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">Envie para quem quer entrar nesta rota.</p>
      <Button asChild size="lg" variant="success" className="mt-3 w-full">
        <a href={`https://wa.me/?text=${encodeURIComponent(mensagemConvite(destino))}`} target="_blank" rel="noreferrer">
          <MessageCircle className="!h-5 !w-5" /> Enviar pelo WhatsApp
        </a>
      </Button>
    </section>
  );
}

/** One join request with Aceitar (opens the add-passenger steps prefilled) and Recusar. */
export function PedidoCard({ pedido: p, destino }: { pedido: PedidoEntrada; destino?: string | undefined }) {
  return (
    <li className={destino ? "rounded-3xl bg-card p-4 shadow-card" : "rounded-2xl bg-surface p-3"}>
      <p className="font-bold leading-snug text-foreground">{p.nome}</p>
      <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Phone className="h-3.5 w-3.5" /> {formatarTelefone(p.telefone)}
      </p>
      {destino && (
        <p className="mt-1 flex items-start gap-1.5 text-sm text-foreground">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span>
            Quer entrar em <span className="font-bold">{destino}</span>
          </span>
        </p>
      )}
      <div className="mt-2.5 grid grid-cols-2 gap-2">
        <Button asChild size="lg" variant="success">
          <Link to="/vanzeiro/destinos/$id/passageiros/novo" params={{ id: p.destinoId }} search={{ pedido: p.id }}>
            <Check className="!h-5 !w-5" /> Aceitar
          </Link>
        </Button>
        <RecusarPedido pedido={p} />
      </div>
    </li>
  );
}

export function PedidosParaEntrar({ destinoId }: { destinoId: string }) {
  const pedidos = usePedidosDoDestino(destinoId);
  if (pedidos.length === 0) return null;

  return (
    <section className="rounded-3xl border-2 border-accent bg-card p-4 shadow-card">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-soft text-foreground">
          <UserPlus className="h-4 w-4" />
        </span>
        <p className="flex-1 font-display text-base font-bold text-foreground">Pedidos para entrar</p>
        <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-accent px-1.5 text-xs font-bold text-accent-foreground">
          {pedidos.length}
        </span>
      </div>
      <ul className="space-y-2.5">
        {pedidos.map((p) => (
          <PedidoCard key={p.id} pedido={p} />
        ))}
      </ul>
    </section>
  );
}

export function PassageirosDoDestino({ destinoId }: { destinoId: string }) {
  const passageiros = usePassageirosDoDestino(destinoId);
  const destino = useDestino(destinoId);

  return (
    <section className="rounded-3xl bg-card p-4 shadow-card">
      <div className="mb-3 flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success-soft text-success">
          <Users className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-base font-bold text-foreground">Passageiros deste destino</p>
          <p className="text-sm text-muted-foreground">
            {passageiros.length === 0
              ? "Nenhum passageiro ainda."
              : `${passageiros.length} ${passageiros.length === 1 ? "passageiro" : "passageiros"}`}
          </p>
        </div>
      </div>

      {destino && passageiros.length > 0 && (
        <div className="space-y-3">
          {porCidade(passageiros, destino).map((grupo) => (
            <div key={grupo.cidade}>
              <p className="px-1 pb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{grupo.cidade}</p>
              <ul className="space-y-2">
                {grupo.passageiros.map((p, i) => (
                  <li key={p.id} className="flex items-stretch gap-2">
                    <Link
                      to="/vanzeiro/destinos/$id/passageiros/$pid"
                      params={{ id: destinoId, pid: p.id }}
                      className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl bg-surface px-3 py-2.5 transition-transform active:scale-[0.98]"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft font-display font-bold text-primary">
                        {p.nome.charAt(0)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold leading-snug text-foreground">{p.nome}</p>
                        <p className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">
                            {p.cidade} · {p.endereco}
                          </span>
                        </p>
                        <p className="text-sm font-semibold text-foreground">{descricaoPlano(p)}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </Link>
                    {grupo.passageiros.length > 1 && (
                      <div className="flex shrink-0 flex-col gap-1">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-full min-h-10 w-10 rounded-xl"
                          disabled={i === 0}
                          aria-label={`Subir ${p.nome} na busca`}
                          onClick={() => moverPassageiro(p.id, -1)}
                        >
                          <ChevronUp className="!h-5 !w-5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-full min-h-10 w-10 rounded-xl"
                          disabled={i === grupo.passageiros.length - 1}
                          aria-label={`Descer ${p.nome} na busca`}
                          onClick={() => moverPassageiro(p.id, 1)}
                        >
                          <ChevronDown className="!h-5 !w-5" />
                        </Button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <Button asChild size="lg" className="mt-3 w-full">
        <Link to="/vanzeiro/destinos/$id/passageiros/novo" params={{ id: destinoId }}>
          <UserPlus className="!h-5 !w-5" /> Adicionar passageiro
        </Link>
      </Button>
    </section>
  );
}
