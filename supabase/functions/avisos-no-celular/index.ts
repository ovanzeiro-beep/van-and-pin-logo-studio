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
  viagem_cancelada: "Sem viagem",
  viagem_de_volta: "Vai ter viagem",
  destino_excluido: "Destino excluído",
  presenca_confirmada: "Presença confirmada",
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

type Entrega = { para: string; tag: string; titulo: string; corpo: string; url: string };

async function entregar(): Promise<number> {
  const c = await chaves();
  webpush.setVapidDetails("https://van-and-pin-logo-studio.lovable.app", c.publica, c.privada);
  const agora = new Date().toISOString();
  const entregas: Entrega[] = [];
  // Taking the waiting ones and marking them in the same step: two calls never deliver the same notice twice.
  const { data: avisos } = await sb
    .from("avisos")
    .update({ enviado_em: agora })
    .is("enviado_em", null)
    .select("id, vanzeiro_id, para, tipo, texto");
  for (const a of avisos ?? []) {
    const doVanzeiro = a.para === a.vanzeiro_id;
    entregas.push({
      para: a.para,
      tag: a.id,
      titulo: TITULO[a.tipo] ?? "O Vanzeiro",
      corpo: a.texto,
      url: doVanzeiro ? "/vanzeiro/notificacoes" : "/passageiro/notificacoes",
    });
  }
  const { data: pedidos } = await sb
    .from("pedidos")
    .update({ avisado_em: agora })
    .is("avisado_em", null)
    .select("id, vanzeiro_id, destino_id, nome");
  for (const p of pedidos ?? []) {
    const { data: d } = await sb
      .from("destinos")
      .select("origem, destino")
      .eq("id", p.destino_id)
      .maybeSingle();
    entregas.push({
      para: p.vanzeiro_id,
      tag: p.id,
      titulo: TITULO.pedido_novo,
      corpo: `${p.nome} quer entrar${d ? ` em ${d.origem} → ${d.destino}` : ""}`,
      url: "/vanzeiro/notificacoes",
    });
  }
  // Only accounts have phones (a passenger without an account has nowhere to receive).
  const contas = [...new Set(entregas.map((e) => e.para).filter((p) => /^[0-9a-f-]{36}$/.test(p)))];
  if (contas.length === 0) return 0;
  const { data: celulares } = await sb
    .from("celulares")
    .select("id, conta_id, endereco")
    .in("conta_id", contas);
  let enviadas = 0;
  await Promise.all(
    entregas.flatMap((e) =>
      (celulares ?? [])
        .filter((cel) => cel.conta_id === e.para)
        .map(async (cel) => {
          try {
            await webpush.sendNotification(
              cel.endereco,
              JSON.stringify({ titulo: e.titulo, corpo: e.corpo, url: e.url, tag: e.tag }),
              { TTL: 60 * 60 * 24 },
            );
            enviadas++;
          } catch (erro) {
            // The phone turned the notifications off or the app was removed: forget this address.
            const status = (erro as { statusCode?: number }).statusCode;
            if (status === 404 || status === 410)
              await sb.from("celulares").delete().eq("id", cel.id);
          }
        }),
    ),
  );
  return enviadas;
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
