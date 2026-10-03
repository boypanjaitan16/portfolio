#!/usr/bin/env bash
set -euo pipefail

node apps/admin/rules/seedPages.mjs

export VITE_FIREBASE_API_KEY=demo-api-key
export VITE_FIREBASE_AUTH_DOMAIN=demo-portfolio.firebaseapp.com
export VITE_FIREBASE_PROJECT_ID=demo-portfolio
export VITE_FIREBASE_STORAGE_BUCKET=demo-portfolio.appspot.com
export VITE_FIREBASE_MESSAGING_SENDER_ID=123456
export VITE_FIREBASE_APP_ID=demo-app
export VITE_FIRESTORE_EMULATOR_HOST="$FIRESTORE_EMULATOR_HOST"

pnpm --filter @portfolio/tools build
pnpm --filter @portfolio/admin build
pnpm --filter @portfolio/home build:pages

test -f apps/home/dist/notes/english-smoke/index.html
test -f apps/home/dist/notes/artikel-uji/index.html
rg -q 'English smoke article' apps/home/dist/notes/english-smoke/index.html
rg -q 'Published body for prerender verification' apps/home/dist/notes/english-smoke/index.html
rg -q '/notes/english-smoke' apps/home/dist/sitemap.xml
rg -q '/notes/artikel-uji' apps/home/dist/sitemap.xml
if rg -q 'hidden-draft' apps/home/dist/sitemap.xml; then exit 1; fi

node --input-type=module <<'JS'
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const html = readFileSync("apps/home/dist/404.html", "utf8");
const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(script);

for (const [pathname, expected] of [
	["/admin/articles/example/edit", "/admin/?__redirect=%2Fadmin%2Farticles%2Fexample%2Fedit"],
	["/admin/contacts", "/admin/?__redirect=%2Fadmin%2Fcontacts"],
	["/tools/missing", "/tools/?__redirect=%2Ftools%2Fmissing"],
	["/tools/pdf-editor", "/tools/?__redirect=%2Ftools%2Fpdf-editor"],
	["/tools/color-picker", "/tools/?__redirect=%2Ftools%2Fcolor-picker"],
	["/tools/qr-code-generator", "/tools/?__redirect=%2Ftools%2Fqr-code-generator"],
	["/tools/spinning-wheel", "/tools/?__redirect=%2Ftools%2Fspinning-wheel"],
	["/tools/privacy-policy", "/tools/?__redirect=%2Ftools%2Fprivacy-policy"],
	["/tools/terms-of-service", "/tools/?__redirect=%2Ftools%2Fterms-of-service"],
	["/missing", "/?__redirect=%2Fmissing"],
]) {
	let redirectedTo = "";
	vm.runInNewContext(script, {
		location: { pathname, search: "", hash: "", replace: (url) => { redirectedTo = url; } },
		encodeURIComponent,
	});
	assert.equal(redirectedTo, expected);
}
JS

site_dir="$(mktemp -d)"
trap 'rm -rf "$site_dir"' EXIT
mkdir -p "$site_dir/tools" "$site_dir/admin"
cp -R apps/home/dist/. "$site_dir/"
cp -R apps/tools/dist/. "$site_dir/tools/"
cp -R apps/admin/dist/. "$site_dir/admin/"
test -f "$site_dir/index.html"
test -f "$site_dir/404.html"
test -f "$site_dir/tools/index.html"
test -f "$site_dir/admin/index.html"
test -f "$site_dir/notes/english-smoke/index.html"
