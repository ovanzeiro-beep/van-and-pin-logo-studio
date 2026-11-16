import type { ReactNode } from "react";
import { Logo } from "@/components/brand/Logo";
import { InstalarApp } from "./InstalarApp";
import { MensagemDasAcoes } from "./MensagemDasAcoes";
import { MobileScreen } from "./MobileScreen";

export function AuthLayout({
  titulo,
  subtitulo,
  children,
  rodape,
}: {
  titulo: string;
  subtitulo: string;
  children: ReactNode;
  rodape: ReactNode;
}) {
  return (
    <MobileScreen className="bg-background">
      {/* Short screens (iPhone SE): less space around the title, so the form fits without scrolling (decision C). */}
      <div className="relative overflow-hidden rounded-b-[2.5rem] bg-header px-6 pb-10 pt-safe-10 [@media(max-height:700px)]:pb-5">
        <div className="flex items-center justify-between gap-3">
          <Logo variant="light" size="sm" />
          <InstalarApp />
        </div>
        <h1 className="mt-10 text-3xl font-bold text-header-foreground [@media(max-height:700px)]:mt-5">{titulo}</h1>
        <p className="mt-2 text-sm text-header-muted">{subtitulo}</p>
      </div>
      <div className="flex flex-1 flex-col px-6 pb-6 pt-8 [@media(max-height:700px)]:pb-3 [@media(max-height:700px)]:pt-4">
        {children}
        <div className="mt-auto pt-6 text-center text-sm text-muted-foreground">{rodape}</div>
      </div>
      <MensagemDasAcoes />
    </MobileScreen>
  );
}

export function OuDivisor() {
  return (
    <div className="my-6 flex items-center gap-3 text-xs font-medium text-muted-foreground">
      <span className="h-px flex-1 bg-border" />
      ou
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
