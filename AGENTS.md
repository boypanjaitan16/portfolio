# Repository instructions

These instructions apply to the entire repository.

## Work in the right place

- `apps/home` serves the public site, `apps/tools` serves the tools app, and `apps/admin` serves the private article and contact portal.
- For work in `apps/tools`, including new tools, routes, translations, assets, behavior, or tests, read `apps/tools/README.md` before editing.
- Every new tool must follow the "Adding a tool" checklist in `apps/tools/README.md`: lazy-loaded registration in `src/toolCatalog.ts`, EN/ID card and SEO copy (meta, About, features, steps, FAQ), smoke-test entries, and a `build:pages` check of its prerendered HTML and OG image.
- Keep shared theme configuration in `packages/config`, article contracts in `packages/articles`, and contact contracts in `packages/contact`. Update affected consumers and tests when a shared contract changes.
- Preserve each app's Vite base path and router basename when changing routes or asset URLs.

## Language

- Write new and modified code and documentation in English, including identifiers, comments, test descriptions, Markdown, and agent instructions.
- Keep user-facing copy aligned with the application's existing locale. Localized UI text is product content.

## Follow the relevant workflow

- Read `README.md` for setup, Firebase, App Check, and GitHub Pages details. Treat `VITE_*` values as browser-visible configuration.
- For Firestore or Storage rules, inspect the rules files and `apps/admin/rules/firebaseRules.test.mjs`. For Pages or prerender changes, inspect `apps/home/scripts/prerender.mjs`, `apps/tools/scripts/prerender.mjs`, `.github/workflows/deploy-pages.yml`, and `scripts/test-pages-smoke.sh`.
- Run checks for each affected workspace. For cross-workspace code or configuration changes, run the root CI gates: `pnpm format:check`, `pnpm lint`, `pnpm test`, and `pnpm build`. Run the emulator rules or Pages smoke tests when those paths change, following `README.md`.
- Report the checks run and any behavior that remains unverified.
