# Repository instructions

These instructions apply to the entire repository.

## Work in the right place

- `apps/home` serves the public site, `apps/tools` serves the tools app, and `apps/admin` serves the private article and contact portal.
- Keep shared theme configuration in `packages/config`, article contracts in `packages/articles`, and contact contracts in `packages/contact`. Update affected consumers and tests when a shared contract changes.
- Preserve each app's Vite base path and router basename when changing routes or asset URLs.

## Language

- Write new and modified code and documentation in English, including identifiers, comments, test descriptions, Markdown, and agent instructions.
- Keep user-facing copy aligned with the application's existing locale. Localized UI text is product content.

## Follow the relevant workflow

- Read `README.md` for setup, Firebase, App Check, and GitHub Pages details. Treat `VITE_*` values as browser-visible configuration.
- For Firestore or Storage rules, inspect the rules files and `apps/admin/rules/firebaseRules.test.mjs`. For Pages or prerender changes, inspect `apps/home/scripts/prerender.mjs`, `.github/workflows/deploy-pages.yml`, and `scripts/test-pages-smoke.sh`.
- Run checks for each affected workspace. For cross-workspace code or configuration changes, run the root CI gates: `pnpm format:check`, `pnpm lint`, `pnpm test`, and `pnpm build`. Run the emulator rules or Pages smoke tests when those paths change, following `README.md`.
- Report the checks run and any behavior that remains unverified.
