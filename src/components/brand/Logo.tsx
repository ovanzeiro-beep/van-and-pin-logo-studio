import { cn } from "@/lib/utils";

/**
 * O Vanzeiro logo: geometric side-view van with a location pin resting on the roof.
 * - "color": navy van + amber pin and headlight (for light backgrounds)
 * - "light": white van + amber pin (for navy backgrounds)
 * - "mono": single color, inherits `currentColor`
 */
type LogoVariant = "color" | "light" | "mono";

const VAN_BODY =
  "M10 46C7.2 46 5 43.8 5 41V28C5 24.7 7.7 22 11 22H38.5C40.3 22 42 22.8 43.2 24.1L51.8 33.4L55.4 34.6C57.6 35.3 59 37.3 59 39.6V42C59 44.2 57.2 46 55 46H54A7 7 0 0 0 40 46H25A7 7 0 0 0 11 46Z" +
  "M11 26H20V33H11Q10 33 10 32V27Q10 26 11 26Z" +
  "M23.5 26H34.5V33H23.5Z" +
  "M38 26H40L46.5 33H38Z" +
  "M55.5 37.6H58.2V39.8H55.5Z";

const WHEEL = (cx: number) =>
  `M${cx - 5} 46a5 5 0 1 0 10 0a5 5 0 1 0 -10 0Z M${cx - 1.8} 46a1.8 1.8 0 1 1 3.6 0a1.8 1.8 0 1 1 -3.6 0Z`;

const PIN =
  "M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7z M12 6.4a2.6 2.6 0 1 0 0 5.2a2.6 2.6 0 1 0 0-5.2z";

export function LogoMark({
  variant = "color",
  className,
  title,
}: {
  variant?: LogoVariant;
  className?: string;
  title?: string;
}) {
  const vanClass =
    variant === "color" ? "fill-primary" : variant === "light" ? "fill-header-foreground" : "fill-current";
  const pinClass = variant === "mono" ? "fill-current" : "fill-accent";

  return (
    <svg
      viewBox="2 0 60 56"
      className={cn("h-10 w-auto", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <path className={vanClass} fillRule="evenodd" d={VAN_BODY} />
      {variant !== "mono" && <rect className="fill-accent" x="55.5" y="37.6" width="2.7" height="2.2" rx="0.6" />}
      <path className={vanClass} fillRule="evenodd" d={WHEEL(18)} />
      <path className={vanClass} fillRule="evenodd" d={WHEEL(47)} />
      <g transform="translate(17.6 1) scale(0.95)">
        <path className={pinClass} fillRule="evenodd" d={PIN} />
      </g>
    </svg>
  );
}

export function Logo({
  variant = "color",
  size = "md",
  className,
}: {
  variant?: LogoVariant;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const markSize = { sm: "h-7", md: "h-10", lg: "h-16" }[size];
  const textSize = { sm: "text-lg", md: "text-2xl", lg: "text-4xl" }[size];
  const textColor =
    variant === "color" ? "text-primary" : variant === "light" ? "text-header-foreground" : "text-current";

  return (
    <div className={cn("inline-flex items-center gap-2.5", className)} aria-label="O Vanzeiro">
      <LogoMark variant={variant} className={markSize} />
      <span className={cn("font-display font-bold leading-none tracking-tight", textSize, textColor)}>
        O Vanzeiro
      </span>
    </div>
  );
}

/** Rounded-square app icon (navy tile, white van, amber pin). */
export function AppIcon({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex aspect-square items-center justify-center rounded-[28%] bg-header shadow-card",
        className,
      )}
    >
      <LogoMark variant="light" className="h-[58%]" />
    </div>
  );
}
