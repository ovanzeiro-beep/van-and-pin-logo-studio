-- Apaga as 6 contas de teste criadas pelo Google (17/11/2026, pedido do dono).
-- Ficam: automacao9112@gmail.com (Rafael, vanzeiro) e ovanzeiro@gmail.com (Monica, passageira).
-- A conta, o perfil e o celular de cada uma saem junto. Não dá para desfazer.
delete from auth.users where email in (
  'rafaelatencia123@gmail.com',
  'rafaelatencia88@gmail.com',
  'zuvvioficial@gmail.com',
  'rafaelatencia008@gmail.com',
  'auviamedoficial@gmail.com',
  'nivexcontrol@gmail.com'
);
select email from auth.users order by created_at;
