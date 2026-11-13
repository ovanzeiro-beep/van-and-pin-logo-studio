import { useState, type ComponentProps } from "react";
import { Eye, EyeOff, type LucideIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function CampoComIcone({
  id,
  label,
  icon: Icon,
  erro,
  olhinho,
  type,
  className,
  ...props
}: ComponentProps<"input"> & {
  id: string;
  label: string;
  icon: LucideIcon;
  /** Short message shown under the field when something is wrong. */
  erro?: string | undefined;
  /** Password field with an eye button to show or hide what was typed. */
  olhinho?: boolean;
}) {
  const [mostrar, setMostrar] = useState(false);
  const idDoErro = `${id}-erro`;
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-foreground">
        {label}
      </Label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={id}
          type={olhinho && mostrar ? "text" : type}
          aria-invalid={erro ? true : undefined}
          aria-describedby={erro ? idDoErro : undefined}
          className={cn(
            "h-13 rounded-xl border-input bg-surface pl-12 text-base shadow-none focus-visible:bg-card md:text-base",
            olhinho && "pr-12",
            erro && "border-destructive",
            className,
          )}
          {...props}
        />
        {olhinho && (
          <button
            type="button"
            onClick={() => setMostrar((m) => !m)}
            aria-label={mostrar ? "Esconder senha" : "Mostrar senha"}
            aria-pressed={mostrar}
            className="absolute right-1.5 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground"
          >
            {mostrar ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        )}
      </div>
      {erro && (
        <p id={idDoErro} className="text-sm font-medium text-destructive">
          {erro}
        </p>
      )}
    </div>
  );
}
