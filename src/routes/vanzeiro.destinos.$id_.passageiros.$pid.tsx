import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays, MapPin, MessageCircle, Pencil, Phone, Trash2, Wallet, type LucideIcon } from "lucide-react";
import { DestinoNaoEncontrado } from "@/components/app/DestinoNaoEncontrado";
import { PassageiroNaoEncontrado } from "@/components/app/PassageiroNaoEncontrado";
import { VanzeiroHeader } from "@/components/app/VanzeiroHeader";
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
import { Button, buttonVariants } from "@/components/ui/button";
import { formatarReais } from "@/data/exemplo";
import { nomeDestino } from "@/lib/destinos";
import { useDestino } from "@/lib/destinos-store";
import { PLANO_ROTULO, formatarTelefone, linkWhatsApp } from "@/lib/passageiros";
import { removerPassageiro, usePassageiro } from "@/lib/passageiros-store";

export const Route = createFileRoute("/vanzeiro/destinos/$id_/passageiros/$pid")({
  head: () => ({
    meta: [
      { title: "Passageiro — O Vanzeiro" },
      { name: "description", content: "Contato, local de embarque e plano de pagamento do passageiro." },
      { property: "og:title", content: "Passageiro — O Vanzeiro" },
      { property: "og:description", content: "Contato, local de embarque e plano de pagamento do passageiro." },
    ],
  }),
  component: DetalhePassageiro,
});

function DetalhePassageiro() {
  const { id, pid } = Route.useParams();
  const navigate = useNavigate();
  const d = useDestino(id);
  const p = usePassageiro(pid);
  if (!d) return <DestinoNaoEncontrado />;
  if (!p || p.destinoId !== d.id) return <PassageiroNaoEncontrado destinoId={d.id} />;

  const remover = async () => {
    await navigate({ to: "/vanzeiro/destinos/$id", params: { id: d.id } });
    removerPassageiro(p.id);
  };

  return (
    <>
      <VanzeiroHeader compacto titulo={p.nome}>
        <Link
          to="/vanzeiro/destinos/$id"
          params={{ id: d.id }}
          className="relative mt-3 inline-flex h-9 max-w-full items-center gap-1.5 rounded-full bg-header-foreground/10 px-3.5 text-sm font-semibold transition-colors hover:bg-header-foreground/20"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          <span className="truncate">{nomeDestino(d)}</span>
        </Link>
      </VanzeiroHeader>

      <div className="relative z-10 -mt-4 space-y-3 px-5 pb-4">
        <section className="rounded-3xl bg-card p-4 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contato e embarque</p>
          <dl className="mt-3 space-y-2.5">
            <Linha icon={Phone} rotulo="WhatsApp" valor={formatarTelefone(p.telefone)} />
            <div className="flex items-start gap-3 rounded-2xl bg-surface px-3.5 py-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <dt className="text-sm text-muted-foreground">Embarca em</dt>
                <dd className="font-bold leading-snug text-foreground">{p.cidade}</dd>
                <dd className="break-words text-sm text-foreground">{p.endereco}</dd>
              </div>
            </div>
          </dl>
        </section>

        <section className="rounded-3xl bg-card p-4 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Plano de pagamento</p>
          <dl className="mt-3 space-y-2.5">
            <Linha icon={Wallet} rotulo={PLANO_ROTULO[p.plano]} valor={formatarReais(p.valor)} />
            {p.vencimento && <Linha icon={CalendarDays} rotulo="Vencimento" valor={`Todo dia ${p.vencimento}`} />}
          </dl>
        </section>

        <div className="space-y-3 pt-1">
          <Button asChild size="lg" variant="success" className="w-full">
            <a href={linkWhatsApp(p.telefone)} target="_blank" rel="noreferrer">
              <MessageCircle className="!h-5 !w-5" /> Chamar no WhatsApp
            </a>
          </Button>
          <div className="grid grid-cols-2 gap-3">
            <Button asChild size="lg" variant="outline">
              <Link to="/vanzeiro/destinos/$id/passageiros/$pid/editar" params={{ id: d.id, pid: p.id }}>
                <Pencil className="!h-5 !w-5" /> Editar
              </Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="lg" variant="outline" className="whitespace-normal px-3 leading-tight text-destructive">
                  <Trash2 className="!h-5 !w-5" /> Remover deste destino
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-[calc(100%-2.5rem)] rounded-3xl sm:max-w-sm">
                <AlertDialogHeader>
                  <AlertDialogTitle>Remover {p.nome}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    A pessoa sai da lista de passageiros de {nomeDestino(d)}.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2">
                  <AlertDialogCancel className={buttonVariants({ variant: "outline", size: "lg" })}>Cancelar</AlertDialogCancel>
                  <AlertDialogAction className={buttonVariants({ variant: "destructive", size: "lg" })} onClick={remover}>
                    Remover
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </>
  );
}

function Linha({ icon: Icon, rotulo, valor }: { icon: LucideIcon; rotulo: string; valor: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-surface px-3.5 py-2.5">
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <dt className="flex-1 text-sm text-muted-foreground">{rotulo}</dt>
      <dd className="text-right text-sm font-bold text-foreground">{valor}</dd>
    </div>
  );
}
