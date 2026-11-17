<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Current project and progress tracking

- Work only in `ovanzeiro-beep/van-and-pin-logo-studio` for this project.
- Before a task, read `CLAUDE.md`, `docs/fonte-da-verdade.md` section 22 (`controle-atual`) and the latest entry in `docs/contraprova.md`. Keep one source of current status; do not create a competing checklist.
- Production code already connects to the owner's Supabase `rnziztwicggdekmpwpgy`. Rules below that describe memory-only data, sample time or a future backend are historical descriptions of the prototype, not instructions to remove the backend. Tests still use samples and simulations.
- Use the current approved business rules. Record a discrepancy between documentation, code and live database before proposing a change; do not silently make one match another.
- Work in small, isolated stages. Preserve approved screens and behavior, record the base revision, and update section 22 and the contraprova with evidence and remaining work. Distinguish code present, automated tests, live database checks and real-device validation.
- Do not mark a feature complete solely because its screen exists or a historical checkbox is checked. Never run old cleanup or write-based SQL test scripts against the live database as part of a read-only audit.
- For functional changes, verify the affected flow and relevant regressions before merging. Do not rewrite unrelated code or apply project-wide formatting to hide inherited lint failures. Database changes follow the owner's decision below.

## Project rules
- Real-account invite searches use the authenticated `destino_pelo_convite` RPC and its returned driver name; local lists and profiles are not authoritative for another driver's invite.
- Screens are phone-first: every page renders inside `MobileScreen` (max ~430px, centered on desktop) so the app reads as native mobile.
- Role dashboards are layout routes (`vanzeiro.tsx`, `passageiro.tsx`) that own the fixed `BottomNav`; each tab is a child route file.
- Sample data lives only in `src/data/exemplo.ts` until a real backend exists, so it can be swapped in one place.
- The logo is hand-built SVG in `src/components/brand/Logo.tsx` (color, light and single-color variants via theme tokens); `public/favicon.svg` mirrors it.
- The vanzeiro layout is a fixed-height shell where `<main>` scrolls, so a screen can pin its header and scroll only its list (Destinos).
- Destinos, passageiros and pedidos live in in-memory stores (`src/lib/destinos-store.ts`, `src/lib/passageiros-store.ts`) seeded from sample data, so changes work across screens without a backend; passenger counts are derived from the passenger list, never stored.
- Charges use pure generators and the shared charge store; trip charges deduplicate by stable trip identity, daily charges by boarding date. Only verified on-time negative answers enter discount history, finalized at departure; due, paid and cancelled charges are immutable. Both vanzeiro summaries read `resumoDoMes`.
- Sample "today" and "now" are the fixed `DATA_DE_HOJE` and `HORA_DE_AGORA` in `src/data/exemplo.ts`, so charge statuses and confirmation deadlines stay coherent with the sample history; swap them for the real clock with the backend.
- Multi-step forms share `PassosLayout` (header with "Passo X de 3", progress bar, Voltar/Continuar/Salvar) so every wizard looks the same.
- Passenger pages are un-nested children of a destino (`vanzeiro.destinos.$id_.passageiros.*`) because the destino detail page has no `<Outlet />`.
- The vanzeiro trip is a pure state machine in `src/lib/viagem.ts` (phases busca → parada/conferência → chegada → volta → encerrada) kept in `src/lib/viagem-store.ts`, so a trip survives tab switches and is unit-testable; trip taps feed the Financeiro only through `registrarEmbarque`/`registrarFalta`.
- Both panels share in-memory stores: answers per trip day (`src/lib/respostas-store.ts`), the vanzeiro profile with the Pix key (`src/lib/vanzeiro-store.ts`) and the passenger session (`src/lib/sessao-passageiro.ts`, which links an accepted pedido to its new passenger); the passageiro layout shows "Entrar na van" instead of `<Outlet />` until the session has a passenger.
- Legal pages (`/termos`, `/privacidade`) share `LeituraLayout`, and both profiles share `OpcoesDaConta` (switch role, legal links, Sair confirmation) so the two panels stay identical.
- Passenger IDs identify memberships; `pessoaId` (fallback to the original membership ID) identifies a person across destinations. Plans, answers and charges remain membership-scoped; passenger screens aggregate only that identity, never phone/name matches.

## Database workflow for this project (owner decision, overrides the Lovable block above)

- The database is the owner's own Supabase project `ovanzeiro` (`rnziztwicggdekmpwpgy`), not Lovable Cloud. Lovable does not manage it.
- Do not send requests to the Lovable agent (it spends the owner's credits). Lovable only syncs code with GitHub and publishes the app (publishing via `deploy_project` is fine).
- Every schema change is a new idempotent file in `supabase/migrations/` (`YYYYMMDDhhmmss_name.sql`), tested first on a local copy or inside a rolled-back transaction, then applied with the owner's authorization (Supabase `apply_migration`, or the owner pastes the matching `supabase/SO-SQL-*.sql` into the SQL Editor). Verify with a read-only query and record it in `docs/contraprova.md`.
- Never put secrets in the repo or ask for them in chat. Details: `docs/fonte-da-verdade.md` section 22.1a.
