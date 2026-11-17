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

const CONTATO = "contato@ovanzeiro.com.br";

function Termos() {
  return (
    <LeituraLayout titulo="Termos de Uso" resumo="As regras para usar o O Vanzeiro. Atualizado em 17/11/2026.">
      <Secao titulo="1. Quem somos e o que é o app">
        <p>
          O <strong>O Vanzeiro</strong> é um aplicativo para organizar o transporte em van. O responsável pelo app é{" "}
          <strong>Rafael Atencia</strong> (contato: {CONTATO}).
        </p>
        <p>
          O <strong>vanzeiro</strong> (dono ou motorista da van) usa o app para organizar destinos, passageiros, viagens e
          cobranças. O <strong>passageiro</strong> usa o app para confirmar as viagens, acompanhar a van e ver o que deve.
        </p>
        <p>
          <strong>O app não faz o transporte.</strong> Ele é uma ferramenta de organização. O transporte é contratado
          diretamente entre o passageiro e o vanzeiro.
        </p>
      </Secao>

      <Secao titulo="2. Aceite destes termos">
        <p>
          Para criar uma conta, por e-mail ou pelo Google, é preciso marcar que leu e aceita estes Termos de Uso e a Política
          de Privacidade. Se você não concorda, não use o app.
        </p>
      </Secao>

      <Secao titulo="3. Sua conta">
        <ul>
          <li>Use dados verdadeiros e mantenha seu nome e telefone atualizados.</li>
          <li>Guarde sua senha em segredo. O que for feito na sua conta é de sua responsabilidade.</li>
          <li>
            <strong>Menores de 18 anos</strong> só podem usar o app com a autorização e o acompanhamento do pai, da mãe ou
            do responsável legal.
          </li>
          <li>Você pode sair da conta ou apagá-la quando quiser, pelo Perfil.</li>
        </ul>
      </Secao>

      <Secao titulo="4. Responsabilidades do vanzeiro">
        <ul>
          <li>
            É o <strong>único responsável pelo transporte</strong>: pela van, pela direção, pela segurança dos passageiros e
            por ter as licenças, autorizações, documentos e seguros exigidos para o tipo de transporte que faz (escolar,
            fretamento, trabalho, excursão ou outro).
          </li>
          <li>Combina diretamente com cada passageiro o preço, a forma de pagamento e as regras do serviço.</li>
          <li>Mantém certos os dados dos destinos, dos horários, dos passageiros e do número de lugares da van.</li>
          <li>Só ele marca uma cobrança como paga ou a cancela, sempre com um motivo.</li>
          <li>
            Usa os dados dos passageiros <strong>somente para o transporte</strong> e não os passa para outras pessoas.
          </li>
        </ul>
      </Secao>

      <Secao titulo="5. Responsabilidades do passageiro">
        <ul>
          <li>Entra na van com o código de convite que recebeu do vanzeiro.</li>
          <li>
            Responde <strong>"Vou"</strong> ou <strong>"Não vou"</strong> até o prazo de cada viagem.{" "}
            <strong>Quem não confirmar "Vou" até o prazo não entra na busca: a van não passa.</strong>
          </li>
          <li>Espera no ponto combinado no horário. Quem não estiver no ponto pode ficar sem a viagem.</li>
          <li>Paga o vanzeiro nas condições combinadas com ele.</li>
        </ul>
      </Secao>

      <Secao titulo="6. Lugares na van">
        <ul>
          <li>Cada viagem tem o número de lugares informado pelo vanzeiro.</li>
          <li>
            O lugar é de quem confirma <strong>"Vou"</strong> primeiro. Com todos os lugares ocupados, aparece{" "}
            <strong>"Van lotada"</strong> e ninguém mais confirma até alguém desistir.
          </li>
          <li>O app mostra a cada passageiro quantos lugares estão ocupados e livres, sem mostrar quem são os outros.</li>
        </ul>
      </Secao>

      <Secao titulo="7. Cobranças, faltas e pagamentos">
        <ul>
          <li>
            <strong>O app não recebe nem guarda dinheiro.</strong> O pagamento é feito direto ao vanzeiro, por Pix ou em
            dinheiro. O app só mostra quanto é, quando vence e se já foi pago.
          </li>
          <li>As cobranças são criadas pelo app conforme o plano combinado (por viagem, diário, quinzenal ou mensal).</li>
          <li>Uma cobrança nunca é alterada depois de criada: ela é marcada como paga ou cancelada com um motivo.</li>
          <li>
            Nos planos mensal e quinzenal, o vanzeiro escolhe se desconta faltas. Quando desconta,{" "}
            <strong>só tem desconto quem avisou "Não vou" dentro do prazo</strong>. "Não estava no ponto" e "sem resposta"
            não dão desconto.
          </li>
          <li>Quem sai de um destino continua devendo o que já venceu; as cobranças que ainda não venceram são canceladas.</li>
          <li>Qualquer desacordo sobre valores é resolvido entre o passageiro e o vanzeiro.</li>
        </ul>
      </Secao>

      <Secao titulo="8. Avisos e notificações">
        <p>
          O app envia avisos sobre as viagens e as cobranças (por exemplo: "a van saiu", "você é o próximo", "cobrança
          vencendo"). Na tela do celular, eles só chegam se você ativar no Perfil, e você pode desligar quando quiser.
          Os avisos ajudam, mas <strong>não substituem combinar direto com o vanzeiro</strong> quando for importante.
        </p>
      </Secao>

      <Secao titulo="9. O que não é permitido">
        <ul>
          <li>Usar o app para enganar, ameaçar, cobrar indevidamente ou prejudicar outras pessoas.</li>
          <li>Cadastrar dados falsos ou de outra pessoa sem autorização.</li>
          <li>Tentar acessar dados de outras contas ou atrapalhar o funcionamento do app.</li>
        </ul>
        <p>Quem fizer isso pode ter a conta suspensa ou encerrada.</p>
      </Secao>

      <Secao titulo="10. Funcionamento do app">
        <ul>
          <li>
            Trabalhamos para o app funcionar sempre, mas podem acontecer falhas, falta de internet ou pausas para
            manutenção. Algumas ações da viagem ficam guardadas no celular e são enviadas quando o sinal volta.
          </li>
          <li>
            O app não responde por atrasos, faltas, acidentes ou problemas do transporte, que são de responsabilidade do
            vanzeiro, nem por acordos feitos fora do app. Isso não tira nenhum direito garantido pelo Código de Defesa do
            Consumidor.
          </li>
          <li>O nome, a marca e o app O Vanzeiro pertencem ao seu responsável e não podem ser copiados.</li>
        </ul>
      </Secao>

      <Secao titulo="11. Preço">
        <p>
          Durante a fase de testes, o app é gratuito. Se passar a ser cobrado (por exemplo, uma mensalidade para o
          vanzeiro), as condições serão informadas com antecedência e só valerão para quem aceitar.
        </p>
      </Secao>

      <Secao titulo="12. Seus dados">
        <p>
          O uso dos seus dados está explicado na <strong>Política de Privacidade</strong>, que faz parte destes termos.
        </p>
      </Secao>

      <Secao titulo="13. Mudanças nestes termos">
        <p>
          Estes termos podem mudar. Quando isso acontecer, avisaremos no app antes de a mudança valer. Se continuar usando
          o app depois disso, você concorda com a nova versão.
        </p>
      </Secao>

      <Secao titulo="14. Lei e foro">
        <p>
          Estes termos seguem as leis do Brasil. Qualquer questão pode ser levada ao foro da cidade onde você mora, como
          garante o Código de Defesa do Consumidor.
        </p>
      </Secao>

      <Secao titulo="15. Contato">
        <p>
          <strong>Rafael Atencia</strong>
          <br />
          <strong>E-mail:</strong> {CONTATO}
          <br />
          <strong>Telefone e WhatsApp:</strong> (14) 99773-2018
        </p>
      </Secao>
    </LeituraLayout>
  );
}
