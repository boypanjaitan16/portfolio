# Portfolio

Monorepo pnpm + Turborepo untuk portfolio Boy Boni Panjaitan.

## Apps

- `apps/home` — situs publik di `https://boypanjaitan.com/`
- `apps/tools` — tools di `https://boypanjaitan.com/tools/`
- `apps/admin` — portal artikel dan pesan di `https://boypanjaitan.com/admin/`

Ketiganya memakai React, TypeScript, Vite, Tailwind CSS, Biome, Vitest, React Router, dan TanStack Query. Token warna, font, bayangan, dan preset Tailwind bersama berada di `packages/config`; ketiga app memakai palet portfolio yang sama. Admin memakai Ant Design v6 untuk kontrol dan interaksi utama, sedangkan home memakai Tailwind dan CSS kustom tanpa Ant Design. Home dan admin memakai satu proyek Firebase portfolio. Kontrak artikel bersama berada di `packages/articles`, sedangkan kontrak pesan kontak di `packages/contact`.

## Development

Gunakan Node.js 22 dan pnpm 10.11.0.

```bash
pnpm install
pnpm dev
```

Untuk menjalankan satu app:

```bash
pnpm --filter @portfolio/home dev
pnpm --filter @portfolio/admin dev
pnpm --filter @portfolio/tools dev
```

Gate repo: `pnpm format:check`, `pnpm lint`, `pnpm test`, dan `pnpm build`. Build dan test biasa tidak memerlukan Firebase aktif.

## Firebase portfolio

1. Gunakan proyek Firebase khusus portfolio (terpisah dari TheBuilder). Aktifkan Authentication dengan provider **Email/Password**, Firestore, dan Storage. Buat akun editor secara manual di Firebase Console; portal tidak menyediakan registrasi.
2. Salin `apps/home/.env.example` dan `apps/admin/.env.example` menjadi `.env.local` di masing-masing app. Isi kedua file dengan konfigurasi web dari proyek Firebase yang sama serta `VITE_FIREBASE_APPCHECK_SITE_KEY` dari reCAPTCHA Enterprise. Variabel `VITE_*` tersedia di browser dan bukan kredensial administrator.
3. Deploy `firestore.rules`, `storage.rules`, dan `firestore.indexes.json` sebelum memakai portal:

```bash
firebase deploy --project YOUR_PROJECT_ID --only firestore:rules,firestore:indexes,storage
```

Semua akun Authentication dalam proyek tersebut boleh menulis artikel dan menangani pesan kontak. Pengunjung tanpa login hanya dapat membaca artikel `PUBLISHED` dan membuat pesan kontak yang valid; mereka tidak dapat membaca pesan. Gambar dapat dibaca publik jika URL-nya diketahui. Artikel memakai slug global yang unik dan tidak berubah setelah dibuat.

Untuk menguji aturan dengan emulator:

```bash
firebase emulators:exec --project demo-portfolio --only firestore,storage 'pnpm --filter @portfolio/admin test:rules'
```

Untuk smoke test lengkap HTML, sitemap, fallback URL, dan artefak Pages, jalankan `pnpm --filter @portfolio/home exec puppeteer browsers install chrome` lalu `pnpm test:pages:smoke`.

Firebase CLI terbaru memerlukan JDK 21. Jika mesin masih memakai JDK 17, gunakan `pnpm dlx firebase-tools@14.22.0` sebagai pengganti `firebase` pada perintah test tersebut.

## Artikel dan GitHub Pages

Dashboard `/admin/` menampilkan jumlah artikel terbit/draft dan pesan baru/diproses; daftar artikel ada di `/admin/articles`, sedangkan inbox pesan ada di `/admin/contacts`. Admin menyediakan draft, publikasi, edit, preview privat, cover, dan gambar di isi artikel. Tiap artikel ditulis dalam satu bahasa, EN atau ID. Home menampilkan tiga artikel terbit terbaru pada bahasa aktif; `/notes` menampilkan seluruh artikel terbit pada bahasa itu. Tiga placeholder `planned` lama telah dihapus.

Simpan enam konfigurasi web Firebase dan `VITE_FIREBASE_APPCHECK_SITE_KEY` sebagai repository Actions secrets dengan nama yang sama seperti di `.env.example`. Untuk pembacaan artikel saat build, siapkan Google Cloud Workload Identity Federation yang dibatasi ke repository ini, lalu beri service account izin baca Firestore (`roles/datastore.viewer`). Isi repository variables `GCP_WORKLOAD_IDENTITY_PROVIDER` dengan nama provider lengkap dan `GCP_PAGES_SERVICE_ACCOUNT` dengan alamat service account. Workflow **Deploy GitHub Pages** tetap dijalankan manual. Prerender memakai library Firestore server dengan kredensial sementara GitHub OIDC; browser prerender menerima hanya data artikel terbit. Build Pages gagal bila konfigurasi Firebase/App Check, akses Firestore server, atau pengambilan artikel gagal.

Daftarkan web app portfolio di Firebase App Check dengan reCAPTCHA Enterprise dan domain produksi. Deploy Pages dengan konfigurasi ini, periksa pembacaan artikel, login admin, dan kirim pesan; pantau metrik App Check sebelum mengaktifkan **Enforce** untuk Cloud Firestore. Penegakan berlaku untuk semua pembacaan dan penulisan Firestore oleh browser home dan admin. Untuk development lokal setelah penegakan, gunakan emulator atau [debug provider App Check](https://firebase.google.com/docs/app-check/web/debug-provider). App Check mengurangi permintaan dari klien tidak sah, tetapi tidak membatasi jumlah kiriman per pengguna.

Perubahan artikel terbit terlihat oleh browser yang membaca Firestore tanpa deploy ulang. HTML statis dan sitemap diperbarui pada deploy Pages berikutnya. Setelah menerbitkan, mengubah, menarik, atau menghapus artikel, jalankan workflow tersebut agar hasil yang dibaca crawler selaras dengan data Firestore.

GitHub Pages memakai satu `404.html` untuk URL SPA yang belum memiliki berkas statis. Fallback mengarahkan URL admin bertingkat ke app admin dan memulihkan alamat semula. Halaman artikel terbit yang dibuat saat deploy tersedia sebagai `/notes/:slug/index.html`.
