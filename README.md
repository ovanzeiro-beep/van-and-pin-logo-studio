# O Vanzeiro

Aplicativo para o vanzeiro organizar destinos, passageiros, viagens e cobranças, com um painel próprio para o passageiro. Repositório ativo: `ovanzeiro-beep/van-and-pin-logo-studio`.

## Acompanhar o trabalho

- [Fonte da verdade e plano atual](docs/fonte-da-verdade.md#controle-atual): funcionamento esperado, situação verificada, pendências e próximas etapas.
- [Contraprova](docs/contraprova.md): registro das verificações e entregas de cada etapa.
- [Descrição do banco](docs/banco-de-dados.md): dados, relações e regras de acesso.
- [Guia do vanzeiro](docs/guia-do-vanzeiro.md): orientação para usar o app.

O app já aponta para o Supabase `ovanzeiro`. Os testes automáticos usam simulações; sua aprovação não substitui a validação com contas reais e no celular. Consulte o controle atual antes de tratar uma etapa antiga como concluída hoje.

## Projeto e publicação

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://van-and-pin-logo-studio.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/2a67d984-dab6-4062-92c7-5ac4a9c34675).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
