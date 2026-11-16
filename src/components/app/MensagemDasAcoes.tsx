import { useEffect, useState } from "react";
import { CircleAlert, LoaderCircle, X } from "lucide-react";
import { fecharMensagem, useEstadoDasAcoes } from "@/lib/acoes";

/** How long "não deu" stays on the screen, and how long an action waits before showing "Salvando…". */
const MENSAGEM_MS = 6000;
const SALVANDO_DEPOIS_MS = 400;

/**
 * V2: at the top of the screen, in both panels. "Salvando…" only when an action takes a while (with the database);
 * the reason in red when an action does not work. Today, in memory, actions answer at once, so "Salvando…" never shows.
 */
export function MensagemDasAcoes() {
  const { salvando, mensagem } = useEstadoDasAcoes();
  const [mostrarSalvando, setMostrarSalvando] = useState(false);

  useEffect(() => {
    if (salvando === 0) {
      setMostrarSalvando(false);
      return;
    }
    const t = setTimeout(() => setMostrarSalvando(true), SALVANDO_DEPOIS_MS);
    return () => clearTimeout(t);
  }, [salvando]);

  useEffect(() => {
    if (!mensagem) return;
    const t = setTimeout(fecharMensagem, MENSAGEM_MS);
    return () => clearTimeout(t);
  }, [mensagem]);

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-[60] flex flex-col items-center gap-2 px-4 pt-safe-3" aria-live="polite">
      {mensagem && (
        <div
          role="alert"
          key={mensagem.id}
          className="pointer-events-auto flex w-full items-start gap-2.5 rounded-2xl bg-destructive px-4 py-3 text-sm font-semibold text-destructive-foreground shadow-card"
        >
          <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />
          <span className="flex-1">{mensagem.texto}</span>
          <button type="button" onClick={fecharMensagem} aria-label="Fechar a mensagem" className="-m-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {mostrarSalvando && !mensagem && (
        <div className="flex items-center gap-2 rounded-full bg-header px-4 py-2 text-sm font-semibold text-header-foreground shadow-card">
          <LoaderCircle className="h-4 w-4 animate-spin" /> Salvando…
        </div>
      )}
    </div>
  );
}
