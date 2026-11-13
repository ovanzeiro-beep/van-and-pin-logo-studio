import type { ComponentType, ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Empty screen: icon, short message and one useful button. */
export function TelaVazia({
  icon: Icon,
  titulo,
  texto,
  botao,
  className,
}: {
  icon: ComponentType<{ className?: string }>;
  titulo: string;
  texto?: string | undefined;
  botao?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-1 flex-col items-center justify-center px-8 py-10 text-center", className)}>
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary-soft text-primary">
        <Icon className="h-8 w-8" />
      </div>
      <h2 className="mt-4 font-display text-xl font-bold text-foreground">{titulo}</h2>
      {texto && <p className="mt-1 text-sm text-muted-foreground">{texto}</p>}
      {botao && <div className="mt-6 w-full">{botao}</div>}
    </div>
  );
}
