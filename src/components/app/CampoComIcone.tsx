import type { ComponentProps } from "react";
import type { LucideIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CampoComIcone({
  id,
  label,
  icon: Icon,
  ...props
}: ComponentProps<"input"> & { id: string; label: string; icon: LucideIcon }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-foreground">
        {label}
      </Label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={id}
          className="h-13 rounded-xl border-input bg-surface pl-12 text-base shadow-none focus-visible:bg-card md:text-base"
          {...props}
        />
      </div>
    </div>
  );
}
