import type { LucideIcon } from "lucide-react";

/** One "label: value" line of a profile card. */
export function LinhaPerfil({ icon: Icon, rotulo, valor }: { icon: LucideIcon; rotulo: string; valor: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-surface px-3.5 py-2.5">
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <dt className="text-xs text-muted-foreground">{rotulo}</dt>
        <dd className="break-words text-sm font-bold text-foreground">{valor}</dd>
      </div>
    </div>
  );
}
