import { Link, type LinkProps } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type NavItem = {
  to: NonNullable<LinkProps["to"]>;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

export function BottomNav({ items }: { items: NavItem[] }) {
  return (
    <nav
      aria-label="Navegação principal"
      className="sticky bottom-0 z-20 mt-auto border-t border-border bg-card/95 px-2 pt-2 shadow-float backdrop-blur pb-safe"
    >
      <ul className="flex items-stretch justify-around">
        {items.map(({ to, label, icon: Icon, exact }) => (
          <li key={to} className="flex-1">
            <Link
              to={to}
              activeOptions={{ exact: !!exact }}
              className="group flex flex-col items-center gap-1 rounded-xl py-1.5 text-muted-foreground transition-colors data-[status=active]:text-primary"
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      "flex h-8 w-12 items-center justify-center rounded-full transition-colors",
                      isActive && "bg-primary-soft",
                    )}
                  >
                    <Icon className="h-5 w-5" strokeWidth={isActive ? 2.4 : 2} />
                  </span>
                  <span className={cn("text-[0.7rem]", isActive ? "font-bold" : "font-medium")}>
                    {label}
                  </span>
                </>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
