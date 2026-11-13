import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const iconVariants = cva("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl", {
  variants: {
    tone: {
      primary: "bg-primary-soft text-primary",
      success: "bg-success-soft text-success",
      danger: "bg-destructive-soft text-destructive",
      warning: "bg-warning-soft text-warning",
      accent: "bg-accent text-accent-foreground",
    },
  },
  defaultVariants: { tone: "primary" },
});

export function InfoCard({
  icon: Icon,
  tone,
  label,
  value,
  detail,
  aside,
  children,
  className,
}: VariantProps<typeof iconVariants> & {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  aside?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-3xl bg-card p-4 shadow-card", className)}>
      <div className="flex items-start gap-3.5">
        <div className={iconVariants({ tone })}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
            {aside}
          </div>
          <div className="mt-1 font-display text-xl font-bold leading-snug text-foreground">
            {value}
          </div>
          {detail && <div className="mt-1 text-sm text-muted-foreground">{detail}</div>}
        </div>
      </div>
      {children && <div className="mt-4">{children}</div>}
    </section>
  );
}

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] font-bold whitespace-nowrap",
  {
    variants: {
      status: {
        pago: "bg-success-soft text-success",
        deve: "bg-destructive-soft text-destructive",
        pendente: "bg-warning-soft text-warning",
        info: "bg-primary-soft text-primary",
      },
    },
    defaultVariants: { status: "info" },
  },
);

export function StatusBadge({
  status,
  children,
}: VariantProps<typeof badgeVariants> & { children: ReactNode }) {
  return (
    <span className={badgeVariants({ status })}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}
