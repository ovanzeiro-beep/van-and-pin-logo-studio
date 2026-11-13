import type { LucideIcon } from "lucide-react";
import { ScreenHeader } from "./ScreenHeader";

export function PlaceholderTab({
  titulo,
  nome,
  icon: Icon,
}: {
  titulo: string;
  nome: string;
  icon: LucideIcon;
}) {
  return (
    <>
      <ScreenHeader titulo={titulo} nome={nome} />
      <div className="flex flex-1 flex-col items-center justify-center px-8 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary-soft text-primary">
          <Icon className="h-8 w-8" />
        </div>
        <h2 className="mt-4 text-lg font-bold text-foreground">{titulo}</h2>
        <p className="mt-1 text-sm text-muted-foreground">Esta tela será construída na próxima etapa.</p>
      </div>
    </>
  );
}
