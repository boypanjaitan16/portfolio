# Portfolio

Monorepo pnpm + Turborepo untuk situs portfolio dan koleksi tools Boy Boni Panjaitan.

## Apps

- `apps/home` — situs utama, dipublikasikan di `https://boypanjaitan.com/`
- `apps/tools` — koleksi tools, dipublikasikan di `https://boypanjaitan.com/tools/`

Keduanya menggunakan React, TypeScript, Vite, Tailwind CSS, Biome, Vitest, React Router, dan TanStack Query.

## Development

Gunakan Node.js 22 dan pnpm 10.11.0.

```bash
pnpm install
pnpm dev
```

Perintah root lain:

```bash
pnpm format
pnpm format:check
pnpm lint
pnpm test
pnpm test:coverage
pnpm build
```

Untuk menjalankan satu app:

```bash
pnpm --filter @portfolio/home dev
pnpm --filter @portfolio/tools dev
```

## GitHub Pages

Workflow `Deploy GitHub Pages` hanya berjalan secara manual dari tab Actions. Ia membangun kedua app, meletakkan output home pada root artefak, dan output tools pada `/tools/`.

Set custom domain `boypanjaitan.com` di **Settings → Pages** repositori dan konfigurasikan DNS apex serta HTTPS pada GitHub dan penyedia domain. Satu repository GitHub Pages hanya dapat menerbitkan satu site, sehingga tools tersedia di path `/tools/`, bukan di subdomain terpisah.
