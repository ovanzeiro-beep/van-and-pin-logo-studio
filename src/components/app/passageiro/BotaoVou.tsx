import { Armchair, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RespostaViagem } from "@/data/exemplo";
import { responder, useVanLotadaPara } from "@/lib/respostas-store";
import { fazer } from "@/lib/acoes";

/** "Vou", or "Van lotada" (disabled) when every seat of this trip is already taken. */
export function BotaoVou({ passageiroId, destinoId, data, resposta }: { passageiroId: string; destinoId: string; data: string; resposta: RespostaViagem | undefined }) {
  const lotada = useVanLotadaPara(passageiroId, destinoId, data);
  if (lotada) {
    return (
      <Button variant="outline" disabled aria-disabled>
        <Armchair className="!h-5 !w-5" /> Van lotada
      </Button>
    );
  }
  return (
    <Button variant={resposta === "vai" ? "success" : "cta"} onClick={() => void fazer(() => responder(passageiroId, data, "vai"))} aria-pressed={resposta === "vai"}>
      <Check className="!h-5 !w-5" /> Vou
    </Button>
  );
}
