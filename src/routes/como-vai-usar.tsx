import { createFileRoute, Link } from "@tanstack/react-router";
import type { ComponentType } from "react";
import { ArrowRight, UserRound } from "lucide-react";
import { Logo, VanIcon } from "@/components/brand/Logo";
import { MobileScreen } from "@/components/app/MobileScreen";
import { escolherPapel } from "@/lib/acesso";

export const Route = createFileRoute("/como-vai-usar")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Como você vai usar o app? — O Vanzeiro" },
      { name: "description", content: "Escolha se você é vanzeiro ou passageiro." },
      { property: "og:title", content: "Como você vai usar o app? — O Vanzeiro" },
      { property: "og:description", content: "Escolha se você é vanzeiro ou passageiro." },
    ],
  }),
  component: ComoVaiUsar,
});

function ComoVaiUsar() {
  return (
    <MobileScreen>
      <div className="px-6 pt-10">
        <Logo size="sm" />
        <h1 className="mt-10 text-[1.9rem] font-bold leading-tight text-foreground">
          Como você vai usar o app?
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">Você poderá mudar isso depois no seu perfil.</p>
      </div>
      <div className="flex flex-1 flex-col gap-4 px-6 pb-10 pt-8">
        <OpcaoPerfil
          to="/vanzeiro"
          icon={VanIcon}
          titulo="Sou vanzeiro"
          descricao="Organize passageiros, rotas e cobranças da sua van."
          destaque
          aoTocar={() => escolherPapel("vanzeiro")}
        />
        <OpcaoPerfil
          to="/passageiro"
          icon={UserRound}
          titulo="Sou passageiro"
          descricao="Acompanhe a van, confirme presença e veja seus pagamentos."
          aoTocar={() => escolherPapel("passageiro")}
        />
      </div>
    </MobileScreen>
  );
}

function OpcaoPerfil({
  to,
  icon: Icon,
  titulo,
  descricao,
  destaque,
  aoTocar,
}: {
  to: "/vanzeiro" | "/passageiro";
  icon: ComponentType<{ className?: string }>;
  titulo: string;
  descricao: string;
  destaque?: boolean;
  aoTocar?: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={aoTocar}
      className={
        destaque
          ? "group relative overflow-hidden rounded-[1.75rem] bg-header p-6 text-header-foreground shadow-card transition-transform active:scale-[0.98]"
          : "group relative overflow-hidden rounded-[1.75rem] border border-border bg-card p-6 text-foreground shadow-card transition-transform active:scale-[0.98]"
      }
    >
      <div
        className={
          destaque
            ? "flex h-16 w-16 items-center justify-center rounded-2xl bg-accent text-accent-foreground"
            : "flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft text-primary"
        }
      >
        <Icon className="h-8 w-8" />
      </div>
      <h2 className="mt-6 text-2xl font-bold">{titulo}</h2>
      <p className={destaque ? "mt-1.5 text-sm text-header-muted" : "mt-1.5 text-sm text-muted-foreground"}>
        {descricao}
      </p>
      <span
        className={
          destaque
            ? "absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-header-foreground/10 transition-transform group-hover:translate-x-1"
            : "absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-muted transition-transform group-hover:translate-x-1"
        }
      >
        <ArrowRight className="h-5 w-5" />
      </span>
    </Link>
  );
}
