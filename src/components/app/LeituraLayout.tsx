import type { ReactNode } from "react";
import { useCanGoBack, useNavigate, useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { MobileScreen } from "./MobileScreen";

/** Reading screen (Termos de Uso, Política de Privacidade): navy header with Voltar, then text cards. */
export function LeituraLayout({ titulo, resumo, children }: { titulo: string; resumo: string; children: ReactNode }) {
  const router = useRouter();
  const podeVoltar = useCanGoBack();
  const navigate = useNavigate();
  const voltar = () => (podeVoltar ? router.history.back() : navigate({ to: "/entrar" }));

  return (
    <MobileScreen className="bg-background">
      <header className="relative overflow-hidden rounded-b-[2rem] bg-header px-5 pb-7 pt-5 text-header-foreground">
        <button
          type="button"
          onClick={voltar}
          className="inline-flex h-10 items-center gap-1.5 rounded-full bg-header-foreground/10 px-4 text-sm font-semibold transition-colors hover:bg-header-foreground/20"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>
        <span className="mt-5 flex w-fit rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">
          Versão provisória
        </span>
        <h1 className="mt-3 text-[1.75rem] font-bold leading-tight">{titulo}</h1>
        <p className="mt-1 text-sm text-header-muted">{resumo}</p>
      </header>
      <div className="space-y-3 px-5 pb-10 pt-5">{children}</div>
    </MobileScreen>
  );
}

export function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl bg-card p-5 shadow-card">
      <h2 className="font-display text-lg font-bold leading-tight text-foreground">{titulo}</h2>
      <div className="mt-2 space-y-2 text-[0.95rem] leading-relaxed text-muted-foreground [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-foreground [&_ul]:space-y-1">
        {children}
      </div>
    </section>
  );
}
