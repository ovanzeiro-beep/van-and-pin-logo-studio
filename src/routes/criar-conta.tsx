import { useEffect, useState, type ChangeEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Lock, Mail, User } from "lucide-react";
import { AuthLayout, OuDivisor } from "@/components/app/AuthLayout";
import { CampoComIcone } from "@/components/app/CampoComIcone";
import { GoogleButton } from "@/components/app/GoogleButton";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  cadastroOk,
  podeContinuarComGoogle,
  guardarRascunhoDoCadastro,
  limparRascunhoDoCadastro,
  rascunhoDoCadastro,
  validarCadastro,
  type DadosCadastro,
} from "@/lib/cadastro";
import { criarConta } from "@/lib/acesso";

export const Route = createFileRoute("/criar-conta")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Criar conta — O Vanzeiro" },
      { name: "description", content: "Crie sua conta grátis no O Vanzeiro." },
      { property: "og:title", content: "Criar conta — O Vanzeiro" },
      { property: "og:description", content: "Crie sua conta grátis no O Vanzeiro." },
    ],
  }),
  component: CriarConta,
});

function CriarConta() {
  const navigate = useNavigate();
  const avancar = () => navigate({ to: "/como-vai-usar" });
  const [dados, setDados] = useState<DadosCadastro>(rascunhoDoCadastro);
  const [tentou, setTentou] = useState(false);
  // Keeps what was typed while the person reads the Termos or the Política and comes back.
  useEffect(() => guardarRascunhoDoCadastro(dados), [dados]);

  const erros = tentou ? validarCadastro(dados) : {};
  const mudar = (campo: keyof DadosCadastro) => (e: ChangeEvent<HTMLInputElement>) =>
    setDados((d) => ({ ...d, [campo]: e.target.value }));

  return (
    <AuthLayout
      titulo="Criar sua conta"
      subtitulo="Leva menos de um minuto."
      rodape={
        <>
          Já tem conta?{" "}
          <Link to="/entrar" className="font-bold text-primary">
            Entrar
          </Link>
        </>
      }
    >
      <form
        className="space-y-4"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          setTentou(true);
          if (!cadastroOk(validarCadastro(dados))) return;
          // A new account is not in any van yet: as a passenger it starts at "Entrar na van".
          criarConta(dados.nome);
          limparRascunhoDoCadastro();
          avancar();
        }}
      >
        <CampoComIcone
          id="nome"
          name="nome"
          label="Nome"
          icon={User}
          placeholder="Seu nome"
          autoComplete="name"
          value={dados.nome}
          onChange={mudar("nome")}
          erro={erros.nome}
        />
        <CampoComIcone
          id="email"
          label="E-mail"
          type="email"
          icon={Mail}
          placeholder="voce@email.com"
          autoComplete="email"
          value={dados.email}
          onChange={mudar("email")}
          erro={erros.email}
        />
        <CampoComIcone
          id="senha"
          label="Senha"
          type="password"
          olhinho
          icon={Lock}
          placeholder="Pelo menos 8 caracteres"
          autoComplete="new-password"
          value={dados.senha}
          onChange={mudar("senha")}
          erro={erros.senha}
        />
        <CampoComIcone
          id="confirmar"
          label="Confirmar senha"
          type="password"
          olhinho
          icon={Lock}
          placeholder="Digite a senha de novo"
          autoComplete="new-password"
          value={dados.confirmar}
          onChange={mudar("confirmar")}
          erro={erros.confirmar}
        />
        <div className="flex items-start gap-3 pt-1">
          <Checkbox
            id="termos"
            checked={dados.aceitouTermos}
            onCheckedChange={(v) => setDados((d) => ({ ...d, aceitouTermos: v === true }))}
            className="mt-0.5 h-5 w-5 rounded-md"
          />
          <label htmlFor="termos" className="text-sm leading-snug text-foreground">
            Li e aceito os{" "}
            <Link to="/termos" className="font-bold text-primary underline underline-offset-2">
              Termos de Uso
            </Link>{" "}
            e a{" "}
            <Link to="/privacidade" className="font-bold text-primary underline underline-offset-2">
              Política de Privacidade
            </Link>
          </label>
        </div>
        <Button type="submit" variant="cta" size="xl" className="mt-2 w-full" disabled={!dados.aceitouTermos}>
          Criar conta
        </Button>
      </form>
      <OuDivisor />
      <GoogleButton
        label="Continuar com Google"
        disabled={!podeContinuarComGoogle(dados.aceitouTermos)}
        onClick={() => {
          if (!podeContinuarComGoogle(dados.aceitouTermos)) return;
          criarConta("");
          avancar();
        }}
      />
    </AuthLayout>
  );
}
