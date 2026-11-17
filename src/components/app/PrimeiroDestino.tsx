import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  CircleCheck,
  ChevronRight,
  CircleAlert,
  MapPinPlus,
  Phone,
  QrCode,
  UserCog,
  type LucideIcon,
} from "lucide-react";
import { VanIcon } from "@/components/brand/Logo";
import { buttonVariants } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { itensDoPerfil, perfilCompleto, usePerfilVanzeiro } from "@/lib/vanzeiro-store";
import { cn } from "@/lib/utils";

const PASSOS = [
  { titulo: "Crie um destino", texto: "A rota ou a viagem que a sua van faz." },
  { titulo: "Convide os passageiros", texto: "Envie o código de convite pelo WhatsApp." },
  { titulo: "Faça a viagem", texto: "Busque cada um na ordem e confira quem está na van." },
];

/** First use of a new vanzeiro (no destinos yet): a 3-step help and a single path, "Crie seu primeiro destino". */
export function PrimeiroDestino() {
  const [aberto, setAberto] = useState(false);
  const completo = perfilCompleto(usePerfilVanzeiro());
  const botao =
    "flex h-14 w-full items-center gap-3 rounded-2xl bg-accent px-4 text-left text-accent-foreground shadow-cta transition-transform active:scale-[0.98]";
  return (
    <div className="relative z-10 -mt-4 space-y-3 px-5 pb-3">
      <section className="rounded-3xl bg-card p-4 shadow-card">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
            <VanIcon className="h-6 w-6" />
          </div>
          <p className="font-display text-lg font-bold leading-tight text-foreground">
            Você ainda não tem destinos.
          </p>
        </div>
        <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Como funciona
        </p>
        <ol className="mt-2 space-y-2">
          {PASSOS.map((p, i) => (
            <li
              key={p.titulo}
              className="flex items-start gap-3 rounded-2xl bg-surface px-3.5 py-2.5"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-soft font-display text-sm font-bold text-primary">
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="font-bold leading-snug text-foreground">{p.titulo}</p>
                <p className="text-sm leading-snug text-muted-foreground">{p.texto}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
      {/* Profile complete: straight to the destino. Something missing (new account, or erased later): the card first. */}
      {completo ? (
        <Link to="/vanzeiro/destinos/novo" className={botao}>
          <MapPinPlus className="h-5 w-5 shrink-0" />
          <span className="flex-1 font-display text-base font-bold">Crie seu primeiro destino</span>
          <ChevronRight className="h-5 w-5 shrink-0" />
        </Link>
      ) : (
        <>
          <button type="button" onClick={() => setAberto(true)} className={botao}>
            <MapPinPlus className="h-5 w-5 shrink-0" />
            <span className="flex-1 font-display text-base font-bold">Crie seu primeiro destino</span>
            <ChevronRight className="h-5 w-5 shrink-0" />
          </button>
          <AntesDoPrimeiroDestino aberto={aberto} mudarAberto={setAberto} />
        </>
      )}
    </div>
  );
}

/**
 * Before the first destino: what the profile needs for the app to work fully (phone, Pix, the van and its seats),
 * each with "Pronto" or "Falta"; one path to fill it, and the destino right after saving.
 */
function AntesDoPrimeiroDestino({
  aberto,
  mudarAberto,
}: {
  aberto: boolean;
  mudarAberto: (a: boolean) => void;
}) {
  const perfil = usePerfilVanzeiro();
  const tem = itensDoPerfil(perfil);
  const completo = perfilCompleto(perfil);
  const itens: { icone: LucideIcon | "van"; titulo: string; porque: string; pronto: boolean }[] = [
    {
      icone: Phone,
      titulo: "Seu telefone (WhatsApp)",
      porque: "Os passageiros falam com você e recebem o convite por ele.",
      pronto: tem.telefone,
    },
    {
      icone: QrCode,
      titulo: "Sua chave Pix",
      porque: "Aparece para os passageiros na hora de pagar você.",
      pronto: tem.pix,
    },
    {
      icone: "van",
      titulo: "Sua van: modelo, placa e lugares",
      porque:
        'O número de lugares é o limite de quem pode confirmar "Vou". Lotou, ninguém mais entra.',
      pronto: tem.van,
    },
  ];
  return (
    <AlertDialog open={aberto} onOpenChange={mudarAberto}>
      <AlertDialogContent className="max-h-[calc(100dvh-2rem)] max-w-[calc(100%-2rem)] gap-3 overflow-y-auto rounded-3xl p-5 sm:max-w-sm">
        <AlertDialogHeader className="items-center text-center sm:text-center">
          <div
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-3xl",
              completo ? "bg-success-soft text-success" : "bg-warning-soft text-warning",
            )}
          >
            {completo ? <CircleCheck className="h-7 w-7" /> : <UserCog className="h-7 w-7" />}
          </div>
          <AlertDialogTitle className="font-display text-xl leading-tight">
            {completo ? "Seu perfil está pronto!" : "Antes, complete seu perfil"}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[0.95rem] leading-snug">
            {completo
              ? "Está tudo certo para o app funcionar 100%. Agora é só criar o seu primeiro destino."
              : "Leva 1 minuto. Com esses dados, o app funciona 100%: os passageiros falam com você, pagam no Pix certo e a van nunca passa da lotação."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <ul className="space-y-2">
          {itens.map((item) => {
            const Icone = item.icone;
            return (
              <li
                key={item.titulo}
                className={cn(
                  "flex items-start gap-3 rounded-2xl border-2 px-3 py-2.5",
                  item.pronto
                    ? "border-transparent bg-surface"
                    : "border-warning/40 bg-warning-soft/50",
                )}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                  {Icone === "van" ? (
                    <VanIcon className="h-5 w-5" />
                  ) : (
                    <Icone className="h-5 w-5" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold leading-snug text-foreground">{item.titulo}</p>
                    <span
                      className={cn(
                        "flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold",
                        item.pronto
                          ? "bg-success-soft text-success"
                          : "bg-warning-soft text-warning",
                      )}
                    >
                      {item.pronto ? (
                        <CircleCheck className="h-3.5 w-3.5" />
                      ) : (
                        <CircleAlert className="h-3.5 w-3.5" />
                      )}
                      {item.pronto ? "Pronto" : "Falta"}
                    </span>
                  </div>
                  <p className="text-sm leading-snug text-muted-foreground">{item.porque}</p>
                </div>
              </li>
            );
          })}
        </ul>
        <div className="grid gap-2 pt-1">
          {completo ? (
            <Link
              to="/vanzeiro/destinos/novo"
              className={cn(buttonVariants({ variant: "cta", size: "lg" }), "w-full")}
            >
              <MapPinPlus className="!h-5 !w-5" /> Criar meu primeiro destino
            </Link>
          ) : (
            <Link
              to="/vanzeiro/perfil"
              search={{ editar: true, depois: "destino" }}
              className={cn(buttonVariants({ variant: "cta", size: "lg" }), "w-full")}
            >
              <UserCog className="!h-5 !w-5" /> Completar meu perfil
            </Link>
          )}
          {!completo && (
            <p className="text-center text-xs text-muted-foreground">
              Depois de salvar, você já vai para o seu primeiro destino.
            </p>
          )}
          <AlertDialogCancel
            className={cn(buttonVariants({ variant: "ghost", size: "lg" }), "mt-0 w-full border-0")}
          >
            Voltar
          </AlertDialogCancel>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
