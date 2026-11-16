import { createFileRoute } from "@tanstack/react-router";
import { LeituraLayout, Secao } from "@/components/app/LeituraLayout";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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
          <li>Informa quantos lugares a van tem. Quando todos os lugares de uma viagem já têm "Vou", o app não deixa mais ninguém confirmar.</li>
          <li>Aceita ou recusa quando um passageiro pede para embarcar a mais de 1 km do ponto combinado.</li>
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
          <li>
            Se a van estiver lotada, aparece <strong>"Van lotada"</strong>: o lugar é de quem respondeu "Vou" primeiro.
          </li>
          <li>Vê suas cobranças e paga direto ao vanzeiro, por Pix ou em dinheiro.</li>
          <li>Durante a viagem, confirma pelo celular que está na van.</li>
          <li>
            Pode mudar onde embarca: até 1 km do ponto combinado, muda na hora; mais longe, o vanzeiro precisa aceitar.
            Até ele aceitar, vale o endereço de antes.
          </li>
        </ul>
      </Secao>

      <Secao titulo="Faltas e descontos">
        <ul>
          <li>
            Nos planos Mensal e Quinzenal, o vanzeiro escolhe se desconta as faltas. Quando desconta,{" "}
            <strong>só ganha o desconto quem avisou "Não vou" dentro do prazo.</strong>
          </li>
          <li>"Não estava no ponto" e "sem resposta" não descontam.</li>
          <li>O desconto entra na próxima cobrança que ainda não venceu.</li>
        </ul>
      </Secao>

      <Secao titulo="Pagamentos">
        <p>
          O app não recebe nem guarda dinheiro. O pagamento é feito direto entre o passageiro e o vanzeiro. O app só
          mostra quanto é, quando vence e se já foi pago.
        </p>
        <ul>
          <li>Uma cobrança nunca é mudada: ou ela é marcada como paga, ou é cancelada com um motivo.</li>
          <li>Quem sai de um destino continua devendo o que já venceu. As cobranças que ainda não venceram são canceladas.</li>
        </ul>
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
