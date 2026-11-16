import { useEffect, useSyncExternalStore } from "react";
import type { AuthError, User } from "@supabase/supabase-js";
import { deuCerto, naoDeu, type Resultado } from "@/lib/acoes";
import { instanteDeAgora } from "@/lib/agora";
import { comecarContaDeVerdade, escolherPapel, sair } from "@/lib/acesso";
import { mudarSessao, obterSessao, type Papel } from "@/lib/sessao";
import { SUPABASE_CHAVE_PUBLICA, SUPABASE_URL, supabase, USA_BANCO } from "@/lib/supabase";
import { emailPadrao, nomeDePessoa } from "@/lib/formatos";
import { carregarPerfisEDestinos } from "@/lib/banco/destinos";
import { carregarPassageirosEPedidos } from "@/lib/banco/passageiros";
import { carregarRespostas } from "@/lib/banco/respostas";
import { carregarViagens } from "@/lib/banco/viagem";
import { carregarDinheiro } from "@/lib/banco/dinheiro";
import { carregarAvisos } from "@/lib/banco/avisos";

// W1 (docs/banco-de-dados.md, section 8.3): login and account for real, in the owner's Supabase.
// E-mail and password, "Esqueci a senha", the Termos accepted at sign-up and the role of each account.
// The screens call these through `fazer(...)`, so problems show in the red bar (V2).

const origem = () => (typeof window === "undefined" ? "" : window.location.origin);

/** Supabase's answer in simple Portuguese. */
function motivo(erro: AuthError | { message?: string; code?: string } | null): string {
  const codigo = (erro && "code" in erro ? erro.code : undefined) ?? "";
  const texto = (erro?.message ?? "").toLowerCase();
  if (codigo === "invalid_credentials" || texto.includes("invalid login")) return "E-mail ou senha errados.";
  if (codigo === "email_not_confirmed" || texto.includes("not confirmed")) return "Confirme seu e-mail: abra o link que mandamos para você.";
  if (codigo === "user_already_exists" || texto.includes("already registered")) return "Já existe uma conta com este e-mail. Toque em Entrar.";
  if (codigo === "weak_password" || texto.includes("password should")) return "Senha fraca. Use pelo menos 8 letras ou números.";
  if (codigo.startsWith("over_") || texto.includes("rate limit")) return "Muitas tentativas. Espere alguns minutos e tente de novo.";
  if (texto.includes("provider is not enabled") || texto.includes("unsupported provider")) return "O login com Google ainda não foi ligado. Use e-mail e senha.";
  if (codigo === "same_password") return "A senha nova é igual à antiga. Escolha outra.";
  if (texto.includes("aceite os termos")) return "Para criar a conta, aceite os Termos de Uso e a Política de Privacidade.";
  if (texto.includes("fetch") || texto.includes("network")) return SEM_CONEXAO;
  return "Não deu certo. Tente de novo em instantes.";
}

/** Login screens: no signal, or the server did not answer. */
const SEM_CONEXAO = "Sem conexão com o servidor. Confira o sinal e tente de novo.";
const semBanco = () => naoDeu(SEM_CONEXAO);

export async function entrarComEmail(email: string, senha: string): Promise<Resultado> {
  const sb = supabase();
  if (!sb) return semBanco();
  const { data, error } = await sb.auth.signInWithPassword({ email: emailPadrao(email), password: senha });
  if (error || !data.user) return naoDeu(motivo(error));
  await carregarConta(data.user);
  return deuCerto;
}

/** Creates the account with the name and the moment the Termos were accepted. When Supabase asks to confirm the e-mail, says so. */
export async function criarContaComEmail(d: { nome: string; email: string; senha: string }): Promise<Resultado & { confirmarEmail?: boolean }> {
  const sb = supabase();
  if (!sb) return semBanco();
  const { data, error } = await sb.auth.signUp({
    email: emailPadrao(d.email),
    password: d.senha,
    options: { data: { nome: nomeDePessoa(d.nome), aceite_termos_em: instanteDeAgora() }, emailRedirectTo: `${origem()}/como-vai-usar` },
  });
  if (error) return naoDeu(motivo(error));
  if (!data.session || !data.user) return { ok: true, confirmarEmail: true };
  await carregarConta(data.user);
  return deuCerto;
}

/** "Criar conta" with the box of the Termos checked: remembered on the phone while the person is at Google. */
const ACEITE_GOOGLE = "vanzeiro-aceite-google";

/** Leaves for Google; it comes back to "Como você vai usar o app?". Works once Google is turned on in Supabase. */
export async function entrarComGoogle(aceitouTermos = false): Promise<Resultado> {
  const sb = supabase();
  if (!sb) return semBanco();
  try {
    if (aceitouTermos) localStorage.setItem(ACEITE_GOOGLE, "sim");
  } catch {
    // No storage: the account is asked to accept again.
  }
  // Before leaving for Google, asks Supabase whether Google is turned on (otherwise the person would see an error page in English).
  try {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/settings`, { headers: { apikey: SUPABASE_CHAVE_PUBLICA } });
    const config = (await r.json()) as { external?: { google?: boolean } };
    if (!config.external?.google) return naoDeu("O login com Google ainda não foi ligado. Use e-mail e senha.");
  } catch {
    return naoDeu(SEM_CONEXAO);
  }
  const { error } = await sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${origem()}/como-vai-usar` } });
  return error ? naoDeu(motivo(error)) : deuCerto;
}

/** "Esqueci minha senha": the link in the e-mail opens "Criar senha nova". */
export async function pedirSenhaNova(email: string): Promise<Resultado> {
  const sb = supabase();
  if (!sb) return semBanco();
  const { error } = await sb.auth.resetPasswordForEmail(emailPadrao(email), { redirectTo: `${origem()}/nova-senha` });
  return error ? naoDeu(motivo(error)) : deuCerto;
}

export async function salvarSenhaNova(senha: string): Promise<Resultado> {
  const sb = supabase();
  if (!sb) return semBanco();
  const { error } = await sb.auth.updateUser({ password: senha });
  return error ? naoDeu(motivo(error)) : deuCerto;
}

/** "Sou vanzeiro" / "Sou passageiro": in memory (as before) and in the account, so it opens first next time. */
export async function escolherPapelDaConta(papel: Papel): Promise<Resultado> {
  escolherPapel(papel);
  const sb = supabase();
  if (!USA_BANCO.conta || !sb || !obterSessao().conta) return deuCerto;
  const { error } = await sb.rpc("escolher_papel", { papel });
  return error ? naoDeu(motivo(error)) : deuCerto;
}

export async function sairDaConta(): Promise<Resultado> {
  sair();
  // The copy of the data kept for opening without signal belongs to this account (public/sw.js).
  if (typeof caches !== "undefined") await caches.delete("vanzeiro-dados").catch(() => false);
  const sb = supabase();
  if (USA_BANCO.conta && sb) await sb.auth.signOut();
  mudarSessao({ conta: null });
  return deuCerto;
}

/** "Excluir minha conta": after the memory part (destinos and memberships), deletes the login and the account. */
export async function excluirContaDoBanco(): Promise<Resultado> {
  const sb = supabase();
  if (!USA_BANCO.conta || !sb || !obterSessao().conta) return deuCerto;
  const { error } = await sb.rpc("excluir_minha_conta");
  if (error) return naoDeu(motivo(error));
  await sb.auth.signOut();
  if (typeof caches !== "undefined") await caches.delete("vanzeiro-dados").catch(() => false);
  mudarSessao({ conta: null, papel: null });
  return deuCerto;
}

// ---------- the box of the Termos after Google (LGPD) ----------

let aceitePendente: User | null = null;
const ouvintesDoAceite = new Set<() => void>();
function mudarAceitePendente(u: User | null) {
  aceitePendente = u;
  ouvintesDoAceite.forEach((o) => o());
}
export const obterAceitePendente = () => aceitePendente;

/** Whether a Google account is waiting for the box of the Termos (the window shows on any screen). */
export function useAceitePendente() {
  return useSyncExternalStore(
    (o) => {
      ouvintesDoAceite.add(o);
      return () => ouvintesDoAceite.delete(o);
    },
    () => aceitePendente !== null,
    () => false,
  );
}

/** "Aceitar e continuar": the acceptance is saved and the person comes in. */
export async function aceitarTermosEContinuar(): Promise<Resultado> {
  const sb = supabase();
  const u = aceitePendente;
  if (!sb || !u) return deuCerto;
  const { error } = await sb.rpc("aceitar_termos");
  if (error) return naoDeu(motivo(error));
  mudarAceitePendente(null);
  await carregarConta(u);
  return deuCerto;
}

/** "Agora não": leaves the Google account. */
export async function naoAceitarTermos(): Promise<Resultado> {
  mudarAceitePendente(null);
  await supabase()?.auth.signOut();
  mudarSessao({ conta: null, contaPronta: true });
  return deuCerto;
}

/** Reads the account row (name, last role) and puts the person in the session. */
async function carregarConta(user: User) {
  const sb = supabase();
  if (!sb) return;
  const { data } = await sb.from("contas").select("nome, ultimo_papel, aceite_termos_em").eq("id", user.id).maybeSingle();
  // E4 (LGPD): an account made with Google needs the box of the Termos checked in "Criar conta" before it is used.
  if (data && !data["aceite_termos_em"]) {
    let aceitou = false;
    try {
      aceitou = localStorage.getItem(ACEITE_GOOGLE) !== null;
      localStorage.removeItem(ACEITE_GOOGLE);
    } catch {
      aceitou = false;
    }
    // Came straight from "Entrar com Google": the box of the Termos shows right here, one tap (owner, 16/11/2026).
    if (!aceitou) {
      mudarAceitePendente(user);
      return;
    }
    const { error } = await sb.rpc("aceitar_termos");
    if (error) {
      mudarAceitePendente(user);
      return;
    }
  }
  const nome = (data?.nome as string | undefined) || (user.user_metadata?.["nome"] as string | undefined) || "";
  const papel = (data?.ultimo_papel as Papel | null | undefined) ?? null;
  const antes = obterSessao().conta;
  if (antes?.id !== user.id) {
    comecarContaDeVerdade({ id: user.id, nome });
    // W2 and W3: the profile and the destinos come from the database.
    await carregarPerfisEDestinos();
    // W4: memberships, pedidos and address changes.
    await carregarPassageirosEPedidos();
    // W5: answers (Vou / Não vou, Vou sempre, Não vou de… até…).
    await carregarRespostas();
    // W6: today's trips (it goes on from where it was) and the history.
    await carregarViagens();
    // W7: charges, payments, cancellations, boardings, faltas and expenses.
    await carregarDinheiro();
  }
  mudarSessao({ conta: { id: user.id, email: user.email ?? "", nome }, papel, contaPronta: true });
  // W8: the bell's notices of this account.
  if (antes?.id !== user.id) await carregarAvisos();
}

/** In the root of the app: finds out who is logged in when the app opens, and follows logins and logouts. */
export function useContaDoBanco() {
  useEffect(() => {
    const sb = supabase();
    if (!USA_BANCO.conta || !sb) {
      mudarSessao({ contaPronta: true });
      return;
    }
    let vivo = true;
    void sb.auth.getSession().then(async ({ data }) => {
      if (!vivo) return;
      if (data.session?.user) await carregarConta(data.session.user);
      else mudarSessao({ conta: null, contaPronta: true });
    });
    const { data } = sb.auth.onAuthStateChange((evento, sessao) => {
      if (evento === "SIGNED_OUT") mudarSessao({ conta: null, papel: null, contaPronta: true });
      else if (sessao?.user && sessao.user.id !== obterSessao().conta?.id) void carregarConta(sessao.user);
    });
    return () => {
      vivo = false;
      data.subscription.unsubscribe();
    };
  }, []);
}
