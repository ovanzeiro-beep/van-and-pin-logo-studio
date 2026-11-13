import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Phone-width canvas, centered on larger screens so the app always reads as a native mobile app. */
export function MobileScreen({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className="min-h-dvh bg-muted md:py-6">
      <div
        className={cn(
          "relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-surface md:min-h-[calc(100dvh-3rem)] md:overflow-hidden md:rounded-[2.5rem] md:shadow-card",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
