// W10: delivers the bell's notices (and the requests to join) as phone notifications, even with the app closed.
// The database calls this function when a notice is born; it can also be called by anyone: it only delivers what is
// waiting, to the right person. GET ?chave → the public key the phones need to sign up.
import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2";

const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
};

const TITULO: Record<string, string> = {
  pedido_novo: "Pedido novo",
  resposta_passageiro: "Resposta de passageiro",
  cobranca_vencida: "Cobrança vencida",
  prazo_chegando: "Prazo chegando",
  van_saiu: "Van saiu",
  cobranca_vencendo: "Cobrança vencendo",
  pedido_recusado: "Pedido não aceito",
  pedido_aceito: "Pedido aceito",
  endereco_aceito: "Endereço aceito",
  endereco_recusado: "Endereço não aceito",
  viagem_cancelada: "Viagem cancelada",
  viagem_de_volta: "Vai ter viagem",
  destino_excluido: "Destino excluído",
  presenca_confirmada: "Presença confirmada",
  ausencia_registrada: "Ausência registrada",
  proxima_parada: "A van está chegando",
  boa_viagem: "Boa viagem!",
};

/** The keys are made once, here, and never leave the database. */
async function chaves(): Promise<{ publica: string; privada: string }> {
  const { data } = await sb
    .from("chaves_push")
    .select("publica, privada")
    .eq("id", 1)
    .maybeSingle();
  if (data) return data;
  const nova = webpush.generateVAPIDKeys();
  await sb.from("chaves_push").insert({ id: 1, publica: nova.publicKey, privada: nova.privateKey });
  const { data: salva } = await sb
    .from("chaves_push")
    .select("publica, privada")
    .eq("id", 1)
    .single();
  return salva!;
}

type Entrega = {
  entrega_id: number;
  ficha: string;
  tag: string;
  tipo: string;
  texto: string;
  endereco: Parameters<typeof webpush.sendNotification>[0];
};

const DO_VANZEIRO = new Set(["pedido_novo", "resposta_passageiro", "cobranca_vencida"]);

async function enviar(entrega: Entrega) {
  let resultado: "enviado" | "repetir" | "celular_invalido" = "enviado";
  try {
    await webpush.sendNotification(
      entrega.endereco,
      JSON.stringify({
        titulo: TITULO[entrega.tipo] ?? "O Vanzeiro",
        corpo: entrega.texto,
        url: DO_VANZEIRO.has(entrega.tipo) ? "/vanzeiro/notificacoes" : "/passageiro/notificacoes",
        tag: entrega.tag,
      }),
      { TTL: 60 * 60 * 24, timeout: 10000 },
    );
  } catch (erro) {
    const status = (erro as { statusCode?: number } | null)?.statusCode;
    resultado = status === 404 || status === 410 ? "celular_invalido" : "repetir";
  }

  const { error } = await sb.rpc("finalizar_entrega_push", {
    entrega_id: entrega.entrega_id,
    reserva: entrega.ficha,
    resultado,
  });
  if (error) throw new Error(error.message);
  return resultado === "enviado";
}

async function entregar(): Promise<number> {
  const c = await chaves();
  webpush.setVapidDetails("https://van-and-pin-logo-studio.lovable.app", c.publica, c.privada);

  const { data, error } = await sb.rpc("reservar_entregas_push");
  if (error) throw new Error(error.message);
  const concluidas = await Promise.allSettled(((data ?? []) as Entrega[]).map(enviar));
  const falha = concluidas.find((r) => r.status === "rejected");
  if (falha) throw falha.reason;
  return concluidas.filter((r) => r.status === "fulfilled" && r.value).length;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    if (req.method === "GET") {
      const { publica } = await chaves();
      return Response.json({ chave: publica }, { headers: cors });
    }
    const enviadas = await entregar();
    return Response.json({ enviadas }, { headers: cors });
  } catch (erro) {
    return Response.json({ erro: String(erro) }, { status: 500, headers: cors });
  }
});
