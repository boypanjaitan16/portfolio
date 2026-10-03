// Prerenders the tools app into static HTML, generates one Open Graph image
// per tool from its landing-page icon, and writes the tools sitemap.
// Run after `vite build`: `pnpm --filter @portfolio/tools build:pages`.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { portfolioTheme } from "@portfolio/config";
import puppeteer from "puppeteer";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer as createViteServer } from "vite";

const appDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const dist = join(appDir, "dist");
const base = "/tools";
const origin = `https://boypanjaitan.com${base}`;

if (!existsSync(join(dist, "index.html")))
	throw new Error("Run `vite build` before prerendering the tools app.");

// Load the tool catalog and landing copy from source so routes, icons, and
// copy are never duplicated here.
const vite = await createViteServer({
	root: appDir,
	logLevel: "error",
	appType: "custom",
	server: { middlewareMode: true, hmr: false },
});
let tools;
let landing;
try {
	({ tools } = await vite.ssrLoadModule("/src/toolCatalog.ts"));
	({
		toolsTranslations: { en: landing },
	} = await vite.ssrLoadModule("/src/toolsLocale.tsx"));
} finally {
	await vite.close();
}

const pages = [
	"/",
	...tools.map((tool) => `/${tool.slug}`),
	"/privacy-policy",
	"/terms-of-service",
];

// ---------------------------------------------------------------------------
// Static server for dist, mounted at the /tools/ base path. Unknown paths get
// the SPA shell, like the GitHub Pages 404 fallback.
const shell = readFileSync(join(dist, "index.html"));
const mime = {
	".js": "text/javascript",
	".mjs": "text/javascript",
	".css": "text/css",
	".svg": "image/svg+xml",
	".woff": "font/woff",
	".woff2": "font/woff2",
	".webp": "image/webp",
	".png": "image/png",
	".jpg": "image/jpeg",
	".ico": "image/x-icon",
	".json": "application/json",
	".wasm": "application/wasm",
	".ttf": "font/ttf",
};
const server = createServer((request, response) => {
	const pathname = new URL(request.url ?? "/", "http://localhost").pathname;
	const relative = pathname.startsWith(`${base}/`)
		? pathname.slice(base.length)
		: pathname;
	const path = resolve(dist, `.${decodeURIComponent(relative)}`);
	if (path.startsWith(`${dist}/`) && existsSync(path) && extname(path)) {
		response.setHeader(
			"Content-Type",
			mime[extname(path)] ?? "application/octet-stream",
		);
		response.end(readFileSync(path));
		return;
	}
	response.setHeader("Content-Type", "text/html; charset=utf-8");
	response.end(shell);
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));
const address = server.address();
if (!address || typeof address === "string")
	throw new Error("Prerender server failed to start.");
const baseUrl = `http://127.0.0.1:${address.port}${base}`;

// ---------------------------------------------------------------------------
// Open Graph images
const require = createRequire(join(appDir, "package.json"));
const fontData = (specifier) =>
	readFileSync(require.resolve(specifier)).toString("base64");
const fonts = {
	sans: fontData(
		"@fontsource-variable/instrument-sans/files/instrument-sans-latin-wght-normal.woff2",
	),
	mono400: fontData(
		"@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2",
	),
	mono600: fontData(
		"@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-600-normal.woff2",
	),
};
const { colors } = portfolioTheme;
const escapeHtml = (value) =>
	String(value)
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;");
const iconSvg = (icon, size) =>
	renderToStaticMarkup(
		createElement(icon, { size, strokeWidth: 1.6, "aria-hidden": true }),
	);

function ogHtml({ title, description, url, art }) {
	return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: Sans; font-weight: 400 700; src: url(data:font/woff2;base64,${fonts.sans}) format("woff2"); }
@font-face { font-family: Mono; font-weight: 400; src: url(data:font/woff2;base64,${fonts.mono400}) format("woff2"); }
@font-face { font-family: Mono; font-weight: 600; src: url(data:font/woff2;base64,${fonts.mono600}) format("woff2"); }
* { box-sizing: border-box; margin: 0; }
html, body { width: 1200px; height: 630px; }
body { position: relative; overflow: hidden; background: ${colors.paper}; color: ${colors.ink}; font-family: Sans, sans-serif; padding: 64px 72px; display: flex; flex-direction: column; }
.brand { display: flex; align-items: center; gap: 16px; font: 600 20px/1 Mono, monospace; letter-spacing: 0.16em; text-transform: uppercase; }
.badge { display: grid; place-items: center; width: 48px; height: 48px; background: ${colors.primary}; color: #fff; letter-spacing: 0.04em; }
.main { flex: 1; display: flex; align-items: center; gap: 56px; }
.tile { flex: none; display: grid; place-items: center; width: 236px; height: 236px; background: ${colors.primary}1a; color: ${colors.primary}; border: 2px solid ${colors.primary}33; }
.grid { flex: none; display: grid; grid-template-columns: repeat(4, 96px); gap: 14px; }
.grid span { display: grid; place-items: center; width: 96px; height: 96px; background: ${colors.primary}1a; color: ${colors.primary}; }
h1 { font-size: 68px; line-height: 1.05; font-weight: 600; letter-spacing: -0.02em; }
p { margin-top: 22px; font-size: 28px; line-height: 1.4; color: ${colors.muted}; }
.url { font: 400 20px/1 Mono, monospace; color: ${colors.muted}; letter-spacing: 0.02em; }
.bar { position: absolute; left: 0; right: 0; bottom: 0; height: 12px; background: ${colors.primary}; }
</style></head><body>
<div class="brand"><span class="badge">BB</span>Boy's tools</div>
<div class="main">${art}<div><h1>${escapeHtml(title)}</h1><p>${escapeHtml(description)}</p></div></div>
<div class="url">${escapeHtml(url)}</div>
<div class="bar"></div>
</body></html>`;
}

const ogImages = [
	{
		name: "tools",
		title: landing.homeTitle,
		description: landing.homeDescription,
		url: "boypanjaitan.com/tools",
		art: `<div class="grid">${tools
			.map((tool) => `<span>${iconSvg(tool.icon, 48)}</span>`)
			.join("")}</div>`,
	},
	...tools.map((tool) => ({
		name: tool.slug,
		title: tool.card.en.name,
		description: tool.card.en.description,
		url: `boypanjaitan.com/tools/${tool.slug}`,
		art: `<div class="tile">${iconSvg(tool.icon, 128)}</div>`,
	})),
];

let browser;
try {
	browser = await puppeteer.launch({
		headless: true,
		args: ["--no-sandbox", "--disable-setuid-sandbox"],
	});

	mkdirSync(join(dist, "og"), { recursive: true });
	const ogPage = await browser.newPage();
	try {
		await ogPage.setViewport({ width: 1200, height: 630 });
		for (const image of ogImages) {
			await ogPage.setContent(ogHtml(image), { waitUntil: "load" });
			await ogPage.evaluate(() => document.fonts.ready);
			const overflow = await ogPage.evaluate(
				() => document.body.scrollHeight > 630,
			);
			if (overflow)
				throw new Error(`OG image text overflows for "${image.name}".`);
			await ogPage.screenshot({
				path: join(dist, "og", `${image.name}.png`),
				type: "png",
			});
		}
	} finally {
		await ogPage.close();
	}

	// -------------------------------------------------------------------------
	// HTML. Pages render in English, the locale crawlers see first; visitors'
	// saved locale still applies after the app starts.
	for (const path of pages) {
		const page = await browser.newPage();
		try {
			await page.evaluateOnNewDocument(() => {
				window.localStorage.setItem("portfolio-locale", "en");
			});
			await page.goto(baseUrl + path, { waitUntil: "domcontentloaded" });
			await page.waitForSelector("main h1", { timeout: 30_000 });
			if (tools.some((tool) => path === `/${tool.slug}`))
				await page.waitForSelector("#tool-about-title", { timeout: 30_000 });
			const canonical = path === "/" ? `${origin}/` : `${origin}${path}`;
			await page.waitForFunction(
				(expected) =>
					document
						.querySelector('link[rel="canonical"]')
						?.getAttribute("href") === expected,
				{ timeout: 30_000 },
				canonical,
			);
			const html = await page.content();
			// `<slug>.html` lets GitHub Pages serve `/tools/<slug>` without a
			// trailing-slash redirect, so the URL matches the canonical link.
			const output =
				path === "/" ? join(dist, "index.html") : join(dist, `${path}.html`);
			mkdirSync(dirname(output), { recursive: true });
			writeFileSync(output, html);
		} finally {
			await page.close();
		}
	}
} finally {
	await browser?.close();
	await new Promise((done) => server.close(done));
}

writeFileSync(
	join(dist, "sitemap.xml"),
	'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
		pages
			.map(
				(path) =>
					`<url><loc>${path === "/" ? `${origin}/` : origin + path}</loc></url>`,
			)
			.join("\n") +
		"\n</urlset>\n",
);
process.stdout.write(
	`Prerendered ${pages.length} pages and ${ogImages.length} OG images.\n`,
);
