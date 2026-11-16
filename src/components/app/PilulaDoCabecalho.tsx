import type { ComponentProps } from "react";
import { Slot } from "@radix-ui/react-slot";
import { useCanGoBack, useNavigate, useRouter, type LinkProps } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The round button inside the blue header (U1): "Voltar", "Viagens feitas", "Seu mês na van", "Todos os destinos",
 * the voice button. One piece, so it looks the same everywhere. With `asChild`, it dresses a Link.
 */
export function PilulaDoCabecalho({ asChild, className, ...props }: ComponentProps<"button"> & { asChild?: boolean }) {
  const Peca = asChild ? Slot : "button";
  return (
    <Peca
      {...(asChild ? {} : { type: "button" as const })}
      className={cn(
        "relative mt-3 inline-flex h-9 items-center gap-1.5 rounded-full bg-header-foreground/10 px-3.5 text-sm font-semibold transition-colors hover:bg-header-foreground/20",
        className,
      )}
      {...props}
    />
  );
}

/** "Voltar": back to where the person came from; opened straight from a link, goes to `senao`. */
export function BotaoVoltar({ senao }: { senao: NonNullable<LinkProps["to"]> }) {
  const router = useRouter();
  const podeVoltar = useCanGoBack();
  const navigate = useNavigate();
  return (
    <PilulaDoCabecalho onClick={() => (podeVoltar ? router.history.back() : navigate({ to: senao }))}>
      <ArrowLeft className="h-4 w-4" /> Voltar
    </PilulaDoCabecalho>
  );
}
