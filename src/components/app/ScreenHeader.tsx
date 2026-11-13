import { useEffect, useState, type ReactNode } from "react";
import { Bell } from "lucide-react";
import { LogoMark } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";

function saudacaoPorHorario(hora: number) {
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

export type ScreenHeaderProps = Parameters<typeof ScreenHeader>[0];

export function ScreenHeader({
  titulo,
  nome,
  subtitulo,
  children,
  compacto = false,
  avisos,
  aoTocarAvisos,
}: {
  /** Number of new notices on the bell. Without it the bell keeps its simple dot. */
  avisos?: number | undefined;
  /** What happens when the bell is tapped. */
  aoTocarAvisos?: (() => void) | undefined;
  /** Lower header, for screens that must fit without scrolling. */
  compacto?: boolean;
  titulo: string;
  nome: string;
  subtitulo?: string;
  children?: ReactNode;
}) {
  const [saudacao, setSaudacao] = useState("Olá");
  useEffect(() => setSaudacao(saudacaoPorHorario(new Date().getHours())), []);

  return (
    <header
      className={cn(
        "relative shrink-0 overflow-hidden rounded-b-[2rem] bg-header px-5 text-header-foreground",
        compacto ? "pb-6 pt-3" : "pb-8 pt-6",
      )}
    >
      <LogoMark
        variant="light"
        className="pointer-events-none absolute -bottom-4 -right-10 h-36 opacity-[0.06]"
      />
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex items-center justify-center rounded-full bg-header-foreground/15 font-display text-base font-semibold",
              compacto ? "h-9 w-9" : "h-11 w-11",
            )}
          >
            {nome.charAt(0)}
          </div>
          <div>
            <p className="text-sm text-header-muted">{saudacao},</p>
            <p className="font-display text-base font-semibold">{nome}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={aoTocarAvisos}
          aria-label={avisos ? `Avisos: ${avisos} ${avisos === 1 ? "novo" : "novos"}` : "Avisos"}
          className={cn(
            "relative flex items-center justify-center rounded-full bg-header-foreground/10 transition-colors hover:bg-header-foreground/20",
            compacto ? "h-9 w-9" : "h-11 w-11",
          )}
        >
          <Bell className="h-5 w-5" />
          {avisos === undefined ? (
            <span
              className={cn(
                "absolute h-2 w-2 rounded-full bg-accent ring-2 ring-primary",
                compacto ? "right-2 top-2" : "right-2.5 top-2.5",
              )}
            />
          ) : avisos > 0 ? (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[0.7rem] font-bold leading-none text-accent-foreground ring-2 ring-primary">
              {avisos}
            </span>
          ) : null}
        </button>
      </div>
      <div className={cn("relative", compacto ? "mt-2" : "mt-6")}>
        <h1 className={cn("font-bold leading-tight", compacto ? "text-2xl" : "text-[1.75rem]")}>{titulo}</h1>
        {subtitulo && <p className={cn("text-sm text-header-muted", compacto ? "mt-0.5 [@media(max-height:700px)]:hidden" : "mt-1")}>{subtitulo}</p>}
      </div>
      {children}
    </header>
  );
}
