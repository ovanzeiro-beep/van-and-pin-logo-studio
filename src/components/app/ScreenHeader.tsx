import { useEffect, useState, type ReactNode } from "react";
import { Bell } from "lucide-react";
import { LogoMark } from "@/components/brand/Logo";

function saudacaoPorHorario(hora: number) {
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

export function ScreenHeader({
  titulo,
  nome,
  subtitulo,
  children,
}: {
  titulo: string;
  nome: string;
  subtitulo?: string;
  children?: ReactNode;
}) {
  const [saudacao, setSaudacao] = useState("Olá");
  useEffect(() => setSaudacao(saudacaoPorHorario(new Date().getHours())), []);

  return (
    <header className="relative overflow-hidden rounded-b-[2rem] bg-header px-5 pb-8 pt-6 text-header-foreground">
      <LogoMark
        variant="light"
        className="pointer-events-none absolute -bottom-4 -right-10 h-36 opacity-[0.06]"
      />
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-header-foreground/15 font-display text-base font-semibold">
            {nome.charAt(0)}
          </div>
          <div>
            <p className="text-sm text-header-muted">{saudacao},</p>
            <p className="font-display text-base font-semibold">{nome}</p>
          </div>
        </div>
        <button
          type="button"
          aria-label="Avisos"
          className="relative flex h-11 w-11 items-center justify-center rounded-full bg-header-foreground/10 transition-colors hover:bg-header-foreground/20"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-accent ring-2 ring-primary" />
        </button>
      </div>
      <div className="relative mt-6">
        <h1 className="text-[1.75rem] font-bold leading-tight">{titulo}</h1>
        {subtitulo && <p className="mt-1 text-sm text-header-muted">{subtitulo}</p>}
      </div>
      {children}
    </header>
  );
}
