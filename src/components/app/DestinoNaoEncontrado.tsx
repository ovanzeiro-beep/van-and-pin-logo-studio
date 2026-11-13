import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { VanzeiroHeader } from "@/components/app/VanzeiroHeader";

export function DestinoNaoEncontrado() {
  return (
    <>
      <VanzeiroHeader compacto titulo="Destino" />
      <div className="flex flex-1 flex-col items-center justify-center px-8 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary-soft text-primary">
          <MapPin className="h-8 w-8" />
        </div>
        <h2 className="mt-4 text-lg font-bold text-foreground">Destino não encontrado</h2>
        <p className="mt-1 text-sm text-muted-foreground">Ele pode ter sido apagado.</p>
        <Link
          to="/vanzeiro/destinos"
          className="mt-6 inline-flex h-12 items-center rounded-xl bg-primary px-6 font-semibold text-primary-foreground"
        >
          Ver destinos
        </Link>
      </div>
    </>
  );
}
