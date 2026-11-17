import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { DndContext, KeyboardSensor, MouseSensor, TouchSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Check, ChevronRight, Copy, GripVertical, Link2, MapPin, MessageCircle, Phone, Route, Ticket, UserPlus, Users } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useCoordenadas } from "@/lib/coordenadas-store";
import { ordemPelaDistancia, vizinhasNaRota } from "@/lib/organizar";
import { RecusarPedido } from "@/components/app/RecusarPedido";
import type { Destino, Passageiro, PedidoEntrada } from "@/data/exemplo";
import { cn } from "@/lib/utils";
import { mensagemConvite } from "@/lib/destinos";
import { useDestino } from "@/lib/destinos-store";
import { descricaoPlano, formatarTelefone, numerosDaBusca, porCidade } from "@/lib/passageiros";
import { cadastroDoPedido, usePassageiros, usePassageirosDoDestino, usePedidosDoDestino } from "@/lib/passageiros-store";
import { fazer } from "@/lib/acoes";
import { ligarPedidoAoCadastroNoBanco, organizarCidadeNoBanco, reordenarNoBanco } from "@/lib/banco/passageiros";
import { textoDaOcupacao } from "@/lib/lugares";
import { usePerfilVanzeiro } from "@/lib/vanzeiro-store";

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
  // G1: the same phone as someone added by hand in this destino: link the account instead of a second passenger.
  const cadastro = cadastroDoPedido(usePassageiros(), p);
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
      {cadastro && (
        <p className="mt-2 rounded-2xl bg-primary-soft px-3 py-2 text-sm text-foreground">
          Já está cadastrado neste destino como <span className="font-bold">{cadastro.nome}</span>. Ligando, passa a usar o app com o
          plano que já tem.
        </p>
      )}
      <div className="mt-2.5 grid grid-cols-2 gap-2">
        {cadastro ? (
          <Button size="lg" variant="success" onClick={() => void fazer(() => ligarPedidoAoCadastroNoBanco(p.id))}>
            <Link2 className="!h-5 !w-5" /> Ligar
          </Button>
        ) : (
          <Button asChild size="lg" variant="success">
            <Link to="/vanzeiro/destinos/$id/passageiros/novo" params={{ id: p.destinoId }} search={{ pedido: p.id }}>
              <Check className="!h-5 !w-5" /> Aceitar
            </Link>
          </Button>
        )}
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
  const numeros = destino ? numerosDaBusca(passageiros, destino) : new Map<string, number>();
  const lugares = usePerfilVanzeiro().van.lugares;

  return (
    <section className="rounded-3xl bg-card p-4 shadow-card">
      <div className="mb-3 flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success-soft text-success">
          <Users className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-base font-bold text-foreground">Passageiros deste destino</p>
          <p className="text-sm text-muted-foreground">
            {passageiros.length === 0 && lugares === null ? "Nenhum passageiro ainda." : textoDaOcupacao(passageiros.length, lugares)}
          </p>
        </div>
      </div>

      {destino && passageiros.length > 0 && (
        <div className="space-y-3">
          {porCidade(passageiros, destino).some((g) => g.passageiros.length > 1) && (
            <p className="flex items-center gap-1.5 px-1 text-xs text-muted-foreground">
              <GripVertical className="h-3.5 w-3.5 shrink-0" /> Ordem fixa da busca, com todos os passageiros. Segure e arraste para mudar.
            </p>
          )}
          {porCidade(passageiros, destino).map((grupo) => (
            <div key={grupo.cidade}>
              <div className="flex min-h-9 items-center justify-between gap-2 px-1 pb-1">
                <p className="truncate text-xs font-semibold uppercase tracking-wider text-muted-foreground">{grupo.cidade}</p>
                <OrganizarPelaDistancia destino={destino} cidade={grupo.cidade} passageiros={grupo.passageiros} />
              </div>
              <ListaArrastavel destinoId={destinoId} cidade={grupo.cidade} passageiros={grupo.passageiros} numeros={numeros} />
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

/** N3: puts the pickups of one city in an order where each one is close to the next (asks first). */
function OrganizarPelaDistancia({ destino, cidade, passageiros }: { destino: Destino; cidade: string; passageiros: Passageiro[] }) {
  const coordenadas = useCoordenadas();
  const comPonto = passageiros.filter((p) => p.ponto).length;
  if (comPonto < 2) return null;
  const semPonto = passageiros.length - comPonto;
  const organizar = () => {
    const { entrada, saida } = vizinhasNaRota(destino, cidade, coordenadas);
    const ids = ordemPelaDistancia(passageiros, entrada, saida);
    void fazer(() => organizarCidadeNoBanco(destino.id, cidade, ids));
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 shrink-0 gap-1.5 px-2 text-sm font-semibold text-primary">
          <Route className="!h-4 !w-4" /> Organizar pela distância
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-[calc(100%-2.5rem)] rounded-3xl sm:max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Organizar {cidade} pela distância?</AlertDialogTitle>
          <AlertDialogDescription>
            A ordem da busca em {cidade} muda para cada passageiro ficar perto do próximo, pelo ponto marcado no mapa.
            {semPonto > 0 && ` ${semPonto === 1 ? "1 passageiro sem ponto no mapa fica" : `${semPonto} passageiros sem ponto no mapa ficam`} no fim.`} Depois,
            você ainda pode arrastar para ajustar.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className={buttonVariants({ variant: "outline", size: "lg" })}>Voltar</AlertDialogCancel>
          <AlertDialogAction className={buttonVariants({ variant: "cta", size: "lg" })} onClick={organizar}>
            <Route className="!h-5 !w-5" /> Organizar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * The passengers of one city, in pickup order. Hold a passenger for a moment and drag up or down to change
 * the order (only inside the city: the cities follow the route). A quick tap still opens the passenger.
 */
function ListaArrastavel({ destinoId, cidade, passageiros, numeros }: { destinoId: string; cidade: string; passageiros: Passageiro[]; numeros: Map<string, number> }) {
  const sensores = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const acabouDeArrastar = useRef(false);
  // The click that ends a drag must not open the passenger: it is blocked before anything else sees it.
  const bloquearClique = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const comecar = () => {
    acabouDeArrastar.current = true;
    window.addEventListener("click", bloquearClique, true);
  };
  const largarDepois = () =>
    setTimeout(() => {
      acabouDeArrastar.current = false;
      window.removeEventListener("click", bloquearClique, true);
    }, 300);
  const aoSoltar = (e: DragEndEvent) => {
    largarDepois();
    const alvo = e.over;
    if (alvo && e.active.id !== alvo.id) void fazer(() => reordenarNoBanco(String(e.active.id), String(alvo.id)));
  };
  return (
    <DndContext id={`busca-${destinoId}-${cidade}`} sensors={sensores} collisionDetection={closestCenter} onDragStart={comecar} onDragEnd={aoSoltar} onDragCancel={largarDepois}>
      <SortableContext items={passageiros.map((p) => p.id)} strategy={verticalListSortingStrategy}>
        <ul className="space-y-2">
          {passageiros.map((p) => (
            <ItemArrastavel
              key={p.id}
              p={p}
              destinoId={destinoId}
              numero={numeros.get(p.id) ?? 0}
              arrastavel={passageiros.length > 1}
              acabouDeArrastar={acabouDeArrastar}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

function ItemArrastavel({
  p,
  destinoId,
  numero,
  arrastavel,
  acabouDeArrastar,
}: {
  p: Passageiro;
  destinoId: string;
  numero: number;
  arrastavel: boolean;
  acabouDeArrastar: { current: boolean };
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: p.id, disabled: !arrastavel });
  const estilo = { transform: transform ? CSS.Transform.toString({ ...transform, x: 0, scaleX: 1, scaleY: 1 }) : undefined, transition };
  return (
    <li ref={setNodeRef} style={estilo} className={cn("relative", isDragging && "z-10")} {...attributes} {...listeners} aria-roledescription="passageiro arrastável">
      <Link
        to="/vanzeiro/destinos/$id/passageiros/$pid"
        params={{ id: destinoId, pid: p.id }}
        onClick={(e) => {
          if (acabouDeArrastar.current) e.preventDefault();
        }}
        draggable={false}
        onDragStart={(e) => e.preventDefault()}
        className={cn(
          "flex min-w-0 select-none items-center gap-3 rounded-2xl bg-surface px-3 py-2.5 transition-shadow [-webkit-touch-callout:none]",
          isDragging ? "shadow-card ring-2 ring-primary" : "active:scale-[0.98]",
        )}
      >
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft font-display text-lg font-bold text-primary"
          aria-label={`${numero}º a ser buscado`}
        >
          {numero}
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
        {arrastavel && <GripVertical className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />}
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
      </Link>
    </li>
  );
}
