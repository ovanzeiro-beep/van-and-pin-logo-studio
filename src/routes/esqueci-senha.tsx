import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { MailCheck, Mail } from "lucide-react";
import { AuthLayout } from "@/components/app/AuthLayout";
import { CampoComIcone } from "@/components/app/CampoComIcone";
import { Button } from "@/components/ui/button";
import { erroDoEmail } from "@/lib/cadastro";

export const Route = createFileRoute("/esqueci-senha")({
  head: () => ({
    meta: [
      { title: "Esqueci minha senha — O Vanzeiro" },
      { name: "description", content: "Receba um link para criar uma senha nova no O Vanzeiro." },
      { property: "og:title", content: "Esqueci minha senha — O Vanzeiro" },
      { property: "og:description", content: "Receba um link para criar uma senha nova no O Vanzeiro." },
    ],
  }),
  component: EsqueciSenha,
});

function EsqueciSenha() {
  const [email, setEmail] = useState("");
  const [tentou, setTentou] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const erro = tentou ? erroDoEmail(email) : undefined;

  return (
    <AuthLayout
      titulo="Esqueci minha senha"
      subtitulo="Digite seu e-mail para criar uma senha nova."
      rodape={
        <>
          Lembrou a senha?{" "}
          <Link to="/entrar" className="font-bold text-primary">
            Entrar
          </Link>
        </>
      }
    >
      {enviado ? (
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-success-soft text-success">
            <MailCheck className="h-8 w-8" />
          </div>
          <p className="mt-5 text-base font-semibold leading-snug text-foreground">
            Se esse e-mail tiver conta, você vai receber um link para criar uma senha nova
          </p>
          <Button asChild variant="cta" size="xl" className="mt-8 w-full">
            <Link to="/entrar">Voltar para Entrar</Link>
          </Button>
        </div>
      ) : (
        <form
          className="space-y-4"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            setTentou(true);
            // Nothing is sent for real yet: there is no real login.
            if (!erroDoEmail(email)) setEnviado(true);
          }}
        >
          <CampoComIcone
            id="email"
            label="E-mail"
            type="email"
            icon={Mail}
            placeholder="voce@email.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            erro={erro}
          />
          <Button type="submit" variant="cta" size="xl" className="mt-2 w-full">
            Enviar link
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
