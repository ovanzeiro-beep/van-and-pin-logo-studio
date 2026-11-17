-- REV-01 (P-13): funções internas que ninguém precisa chamar pelo app, nem sem login.
-- Elas continuam funcionando dentro das funções do banco e das regras automáticas (que rodam como dono).
revoke all on function public.lugares_do_destino(text) from public, anon, authenticated;
revoke all on function public.ocupados_no_destino(text) from public, anon, authenticated;
revoke all on function public.aviso_trocado_de_novo() from public, anon, authenticated;
-- G6 (parte de permissão): a criação da conta no cadastro só roda pelo próprio banco.
revoke all on function public.criar_conta_do_login() from public, anon, authenticated;
