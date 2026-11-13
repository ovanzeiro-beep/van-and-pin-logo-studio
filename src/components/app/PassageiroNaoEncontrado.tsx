import { Link } from "@tanstack/react-router";
import { User } from "lucide-react";
import { VanzeiroHeader } from "@/components/app/VanzeiroHeader";

export function PassageiroNaoEncontrado({ destinoId }: { destinoId: string }) {
  return (
    <>
      <VanzeiroHeader compacto titulo="Passageiro" />
      <div className="flex flex-1 flex-col items-center justify-center px-8 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary-soft text-primary">
          <User className="h-8 w-8" />
        </div>
        <h2 className="mt-4 text-lg font-bold text-foreground">Passageiro não encontrado</h2>
        <p className="mt-1 text-sm text-muted-foreground">Ele pode ter sido removido.</p>
        <Link
          to="/vanzeiro/destinos/$id"
          params={{ id: destinoId }}
          className="mt-6 inline-flex h-12 items-center rounded-xl bg-primary px-6 font-semibold text-primary-foreground"
        >
          Voltar ao destino
        </Link>
      </div>
    </>
  );
}
