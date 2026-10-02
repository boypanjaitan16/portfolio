# Portfolio

pnpm + Turborepo monorepo for Boy Boni Panjaitan's portfolio.

## Apps

- `apps/home` — public site at `https://boypanjaitan.com/`
- `apps/tools` — tools at `https://boypanjaitan.com/tools/`
- `apps/admin` — article and contact portal at `https://boypanjaitan.com/admin/`

All three apps use React, TypeScript, Vite, Tailwind CSS, Biome, Vitest, React Router, and TanStack Query. Shared color, font, shadow, and Tailwind tokens live in `packages/config`; all three apps use the same portfolio palette. Admin uses Ant Design v6 for its main controls and interactions, while home uses Tailwind and custom CSS without Ant Design. Home and admin share one portfolio Firebase project. Shared article contracts live in `packages/articles`, and contact message contracts live in `packages/contact`.

## Development

Use Node.js 22 and pnpm 10.11.0.

```bash
pnpm install
pnpm dev
```

To run one app:

```bash
pnpm --filter @portfolio/home dev
pnpm --filter @portfolio/admin dev
pnpm --filter @portfolio/tools dev
```

Repository gates are `pnpm format:check`, `pnpm lint`, `pnpm test`, and `pnpm build`. Standard builds and tests do not require an active Firebase project.

## Portfolio Firebase

1. Use a dedicated Firebase project for the portfolio (separate from TheBuilder). Enable Authentication with the **Email/Password** provider, Firestore, and Storage. Create editor accounts manually in the Firebase Console; the portal has no registration flow.
2. Copy `apps/home/.env.example` and `apps/admin/.env.example` to `.env.local` in their respective apps. Fill both files with web configuration from the same Firebase project and `VITE_FIREBASE_APPCHECK_SITE_KEY` from reCAPTCHA Enterprise. `VITE_*` variables are available in the browser and are not administrator credentials.
3. Deploy `firestore.rules`, `storage.rules`, and `firestore.indexes.json` before using the portal:

```bash
firebase deploy --project YOUR_PROJECT_ID --only firestore:rules,firestore:indexes,storage
```

Every Authentication account in this project can write articles and manage contact messages. Visitors who are not signed in can only read `PUBLISHED` articles and create valid contact messages; they cannot read messages. Images can be read publicly if their URLs are known. Article slugs are globally unique and do not change after creation.

To test the rules with the emulator:

```bash
firebase emulators:exec --project demo-portfolio --only firestore,storage 'pnpm --filter @portfolio/admin test:rules'
```

For the full HTML, sitemap, fallback URL, and Pages artifact smoke test, run `pnpm --filter @portfolio/home exec puppeteer browsers install chrome` followed by `pnpm test:pages:smoke`.

The latest Firebase CLI requires JDK 21. If the machine still uses JDK 17, use `pnpm dlx firebase-tools@14.22.0` instead of `firebase` for that test command.

## Articles and GitHub Pages

The `/admin/` dashboard shows counts of published and draft articles and of new and in-progress messages. The article list is at `/admin/articles`, and the message inbox is at `/admin/contacts`. The account dropdown in the header shows the account name when available and provides `/admin/profile` to change the display name, `/admin/change-password` to change the password, and a sign-out action. The account email is shown only on the profile page. Admin supports drafts, publishing, editing, private previews, cover images, and images in article content. Each article is written in one language, EN or ID. Home shows the three most recent published articles in the active language; `/notes` shows all published articles in that language. The three old `planned` placeholders have been removed.

Store the six Firebase web configuration values and `VITE_FIREBASE_APPCHECK_SITE_KEY` as repository Actions secrets with the same names as in `.env.example`. To read articles during the build, set up Google Cloud Workload Identity Federation restricted to this repository, then grant the service account Firestore read access (`roles/datastore.viewer`). Set the `GCP_WORKLOAD_IDENTITY_PROVIDER` repository variable to the full provider name and `GCP_PAGES_SERVICE_ACCOUNT` to the service account email. The **Deploy GitHub Pages** workflow still runs manually. Prerendering uses the server Firestore library with temporary GitHub OIDC credentials; the prerendered browser receives only published article data. The Pages build fails if Firebase/App Check configuration, server Firestore access, or article retrieval fails.

Register the portfolio web app in Firebase App Check with reCAPTCHA Enterprise and the production domain. Deploy Pages with this configuration, check article reads, admin login, and message submission, and monitor App Check metrics before enabling **Enforce** for Cloud Firestore. Enforcement applies to all browser Firestore reads and writes from home and admin. For local development after enforcement, use the emulator or the [App Check debug provider](https://firebase.google.com/docs/app-check/web/debug-provider). App Check reduces requests from unauthorized clients, but does not limit how many messages a user can submit.

Changes to published articles are visible to browsers reading Firestore without a redeploy. Static HTML and the sitemap are updated on the next Pages deployment. After publishing, editing, unpublishing, or deleting an article, run that workflow so crawler-visible output matches Firestore data.

GitHub Pages uses one `404.html` for SPA URLs without a static file. The fallback directs nested admin URLs to the admin app and restores the original address. Published article pages generated during deployment are available at `/notes/:slug/index.html`.
