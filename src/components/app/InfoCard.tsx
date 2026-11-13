import type { ComponentType, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const iconVariants = cva("flex shrink-0 items-center justify-center", {
  variants: {
    tone: {
      primary: "bg-primary-soft text-primary",
      success: "bg-success-soft text-success",
      danger: "bg-destructive-soft text-destructive",
      warning: "bg-warning-soft text-warning",
      accent: "bg-accent text-accent-foreground",
    },
    compacto: {
      true: "h-10 w-10 rounded-xl",
      false: "h-12 w-12 rounded-2xl",
    },
  },
  defaultVariants: { tone: "primary", compacto: false },
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
  compacto = false,
}: Omit<VariantProps<typeof iconVariants>, "compacto"> & {
  /** Tighter spacing, for screens that must fit without scrolling. */
  compacto?: boolean;
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  aside?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-3xl bg-card shadow-card", compacto ? "p-3" : "p-4", className)}>
      <div className={cn("flex items-start", compacto ? "gap-3" : "gap-3.5")}>
        <div className={iconVariants({ tone, compacto })}>
          <Icon className={compacto ? "h-5 w-5" : "h-6 w-6"} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
            {aside}
          </div>
          <div
            className={cn(
              "font-display font-bold leading-snug text-foreground",
              compacto ? "mt-0.5 text-lg" : "mt-1 text-xl",
            )}
          >
            {value}
          </div>
          {detail && (
            <div className={cn("text-muted-foreground", compacto ? "mt-0.5 text-[0.8rem]" : "mt-1 text-sm")}>
              {detail}
            </div>
          )}
        </div>
      </div>
      {children && <div className={compacto ? "mt-2.5" : "mt-4"}>{children}</div>}
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
        neutro: "bg-muted text-muted-foreground",
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
