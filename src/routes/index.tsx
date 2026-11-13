import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppIcon } from "@/components/brand/Logo";
import { MobileScreen } from "@/components/app/MobileScreen";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "O Vanzeiro — Sua van organizada" },
      { name: "description", content: "Passageiros, rotas e cobranças da van em um só lugar." },
      { property: "og:title", content: "O Vanzeiro — Sua van organizada" },
      { property: "og:description", content: "Passageiros, rotas e cobranças da van em um só lugar." },
    ],
  }),
  component: Abertura,
});

function Abertura() {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => navigate({ to: "/entrar" }), 2600);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <MobileScreen className="bg-header">
      <button
        type="button"
        onClick={() => navigate({ to: "/entrar" })}
        className="flex flex-1 flex-col items-center justify-center px-8 text-center"
        aria-label="Entrar no O Vanzeiro"
      >
        <div className="animate-splash-rise">
          <AppIcon className="mx-auto w-28 ring-1 ring-header-foreground/10" />
          <h1 className="mt-8 font-display text-4xl font-bold text-header-foreground">
            O Vanzeiro
          </h1>
          <p className="mt-3 text-sm text-header-muted">Sua van organizada, do embarque à cobrança.</p>
        </div>
      </button>
      <div className="px-16 pb-14">
        <div className="h-1 overflow-hidden rounded-full bg-header-foreground/15">
          <div className="h-full w-full animate-progress-fill rounded-full bg-accent" />
        </div>
      </div>
    </MobileScreen>
  );
}
