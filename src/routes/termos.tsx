import { createFileRoute } from "@tanstack/react-router";
import { LeituraLayout, Secao } from "@/components/app/LeituraLayout";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Termos de Uso — O Vanzeiro" },
      { name: "description", content: "Como o O Vanzeiro funciona para o vanzeiro e para o passageiro." },
      { property: "og:title", content: "Termos de Uso — O Vanzeiro" },
      { property: "og:description", content: "Como o O Vanzeiro funciona para o vanzeiro e para o passageiro." },
    ],
  }),
  component: Termos,
});

function Termos() {
  return (
    <LeituraLayout titulo="Termos de Uso" resumo="Como o app funciona e o que cada um faz.">
      <Secao titulo="O que é o O Vanzeiro">
        <p>
          É um app para organizar o transporte de van. O vanzeiro organiza passageiros, rotas e cobranças. O passageiro
          confirma as viagens, acompanha a van e vê seus pagamentos.
        </p>
        <p>Ao criar uma conta, você concorda com estes termos.</p>
      </Secao>

      <Secao titulo="Para o vanzeiro">
        <ul>
          <li>Cadastra os destinos, os horários e as paradas.</li>
          <li>Cadastra os passageiros e aceita ou recusa quem pede para entrar com o código de convite.</li>
          <li>O app cria as cobranças sozinho, pelo plano de cada passageiro.</li>
          <li>Só o vanzeiro marca uma cobrança como paga ou cancela uma cobrança.</li>
          <li>Durante a viagem, a localização da van é mostrada aos passageiros.</li>
          <li>O vanzeiro é o responsável pelo transporte, pela van e por manter os dados certos.</li>
        </ul>
      </Secao>

      <Secao titulo="Para o passageiro">
        <ul>
          <li>Entra na van com o código de convite do vanzeiro.</li>
          <li>
            Confirma <strong>"Vou"</strong> ou <strong>"Não vou"</strong> até o prazo de cada viagem.{" "}
            <strong>Quem não confirmar "Vou" até o prazo não entra na busca: a van não passa.</strong>
          </li>
          <li>Vê suas cobranças e paga direto ao vanzeiro, por Pix ou em dinheiro.</li>
          <li>Durante a viagem, confirma pelo celular que está na van.</li>
        </ul>
      </Secao>

      <Secao titulo="Pagamentos">
        <p>
          O app não recebe nem guarda dinheiro. O pagamento é feito direto entre o passageiro e o vanzeiro. O app só
          mostra quanto é, quando vence e se já foi pago.
        </p>
      </Secao>

      <Secao titulo="Sua conta">
        <ul>
          <li>Use dados verdadeiros e mantenha sua senha em segredo.</li>
          <li>Você pode sair da sua conta ou pedir para apagá-la quando quiser.</li>
          <li>Contas usadas para enganar ou prejudicar outras pessoas podem ser bloqueadas.</li>
        </ul>
      </Secao>

      <Secao titulo="Mudanças nestes termos">
        <p>Estes termos podem mudar. Quando isso acontecer, avisaremos no app.</p>
      </Secao>
    </LeituraLayout>
  );
}
