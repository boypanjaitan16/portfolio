import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Firestore } from "@google-cloud/firestore";
import puppeteer from "puppeteer";

const dist = resolve(fileURLToPath(new URL("../dist", import.meta.url)));
const origin = "https://boypanjaitan.com";
const env = process.env;
const config = {
	apiKey: env.VITE_FIREBASE_API_KEY,
	authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
	projectId: env.VITE_FIREBASE_PROJECT_ID,
	storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
	appId: env.VITE_FIREBASE_APP_ID,
};
if (
	!config.apiKey ||
	!config.projectId ||
	!config.appId ||
	!config.storageBucket
) {
	throw new Error("Firebase config is required for the GitHub Pages build.");
}

if (!env.FIRESTORE_EMULATOR_HOST && !env.VITE_FIREBASE_APPCHECK_SITE_KEY) {
	throw new Error(
		"VITE_FIREBASE_APPCHECK_SITE_KEY is required for the GitHub Pages build.",
	);
}
const db = new Firestore({ projectId: config.projectId });
const fetchArticles = async (locale) => {
	const snapshot = await db
		.collection("articles")
		.where("status", "==", "PUBLISHED")
		.where("locale", "==", locale)
		.orderBy("publishedAt", "desc")
		.get();
	return snapshot.docs.map((item) => item.data());
};
let articles;
try {
	articles = [...(await fetchArticles("en")), ...(await fetchArticles("id"))];
} catch (error) {
	throw new Error(
		"Unable to fetch published articles for Pages prerender. Check Firestore server credentials and indexes.",
		{ cause: error },
	);
}
const articlePaths = articles.map((article) => `/notes/${article.slug}`);
const paths = ["/", "/work", "/about", "/notes", ...articlePaths];
const indexHtml = readFileSync(join(dist, "index.html"));

const mime = {
	".js": "text/javascript",
	".css": "text/css",
	".svg": "image/svg+xml",
	".woff": "font/woff",
	".woff2": "font/woff2",
	".webp": "image/webp",
	".png": "image/png",
	".jpg": "image/jpeg",
	".ico": "image/x-icon",
};
const server = createServer((request, response) => {
	const pathname = new URL(request.url ?? "/", "http://localhost").pathname;
	const path = resolve(dist, `.${decodeURIComponent(pathname)}`);
	if (path.startsWith(`${dist}/`) && existsSync(path) && extname(path)) {
		response.setHeader(
			"Content-Type",
			mime[extname(path)] ?? "application/octet-stream",
		);
		response.end(readFileSync(path));
		return;
	}
	response.setHeader("Content-Type", "text/html; charset=utf-8");
	response.end(indexHtml);
});
await new Promise((done) => server.listen(0, done));
const address = server.address();
if (!address || typeof address === "string")
	throw new Error("Prerender server failed to start.");
const baseUrl = `http://127.0.0.1:${address.port}`;
let browser;
try {
	browser = await puppeteer.launch({
		headless: true,
		args: ["--no-sandbox", "--disable-setuid-sandbox"],
	});
	for (const path of paths) {
		const page = await browser.newPage();
		try {
			await page.evaluateOnNewDocument(
				(publicOrigin, publishedArticles) => {
					window.__portfolioPrerenderOrigin = publicOrigin;
					window.__portfolioPrerenderArticles = publishedArticles;
				},
				origin,
				articles,
			);
			await page.goto(baseUrl + path, { waitUntil: "domcontentloaded" });
			if (path === "/" || path.startsWith("/notes")) {
				await page.waitForFunction(
					() =>
						document.querySelector('[data-prerender-ready="true"]') ||
						document.querySelector('[data-prerender-error="true"]'),
					{ timeout: 30_000 },
				);
				if (await page.$('[data-prerender-error="true"]'))
					throw new Error(`Public article query failed at ${path}`);
			} else {
				await page.waitForSelector("main h1", { timeout: 30_000 });
			}
			await page.waitForFunction(
				(route) =>
					document
						.querySelector('link[rel="canonical"]')
						?.getAttribute("href") === `https://boypanjaitan.com${route}`,
				{},
				path,
			);
			const html = await page.content();
			const output =
				path === "/"
					? join(dist, "index.html")
					: join(dist, path, "index.html");
			mkdirSync(resolve(output, ".."), { recursive: true });
			writeFileSync(output, html);
		} finally {
			await page.close();
		}
	}
} finally {
	await browser?.close();
	await new Promise((done) => server.close(done));
}

const escapeXml = (value) =>
	String(value)
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;");
const staticEntries = ["/", "/work", "/about", "/notes"].map(
	(path) => `<url><loc>${origin}${path}</loc></url>`,
);
const articleEntries = articles.map(
	(article) =>
		"<url><loc>" +
		origin +
		"/notes/" +
		escapeXml(article.slug) +
		"</loc><lastmod>" +
		escapeXml(article.updatedAt.slice(0, 10)) +
		"</lastmod></url>",
);
writeFileSync(
	join(dist, "sitemap.xml"),
	'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
		[...staticEntries, ...articleEntries].join("\n") +
		"\n</urlset>\n",
);
writeFileSync(
	join(dist, "404.html"),
	`<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="robots" content="noindex"><title>Redirecting…</title></head><body><script>
const target = location.pathname + location.search + location.hash;
const base = location.pathname === "/admin" || location.pathname.startsWith("/admin/") ? "/admin/" : location.pathname === "/tools" || location.pathname.startsWith("/tools/") ? "/tools/" : "/";
location.replace(base + "?__redirect=" + encodeURIComponent(target));
</script></body></html>`,
);
