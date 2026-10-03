import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";
import { tools } from "./toolCatalog";

beforeEach(() => {
	window.localStorage.clear();
	document.head.innerHTML = "";
});

function renderAt(path: string) {
	return render(
		<MemoryRouter initialEntries={[path]}>
			<App />
		</MemoryRouter>,
	);
}

function meta(selector: string) {
	return document.head.querySelector(selector)?.getAttribute("content");
}

describe.each(tools)("$slug", (tool) => {
	it.each(["en", "id"] as const)(
		"renders its About section and meta tags in %s",
		(locale) => {
			window.localStorage.setItem("portfolio-locale", locale);
			const { unmount } = renderAt(`/${tool.slug}`);
			const seo = tool.seo[locale];
			const name = tool.card[locale].name;
			const about = screen.getByRole("region", {
				name: locale === "en" ? `About ${name}` : `Tentang ${name}`,
			});
			expect(within(about).getByText(seo.about[0])).toBeInTheDocument();
			expect(within(about).getAllByRole("group")).toHaveLength(seo.faq.length);
			expect(document.title).toBe(`${seo.metaTitle} | Boy Boni Panjaitan`);
			expect(meta('meta[name="description"]')).toBe(seo.metaDescription);
			expect(
				document.head
					.querySelector('link[rel="canonical"]')
					?.getAttribute("href"),
			).toBe(`https://boypanjaitan.com/tools/${tool.slug}`);
			expect(meta('meta[property="og:image"]')).toBe(
				`https://boypanjaitan.com/tools/og/${tool.slug}.png`,
			);
			const jsonLd = JSON.parse(
				document.head.querySelector("#page-jsonld")?.textContent ?? "{}",
			);
			expect(jsonLd["@graph"][0]).toMatchObject({
				"@type": "WebApplication",
				name,
				inLanguage: locale,
			});
			expect(jsonLd["@graph"][1].mainEntity).toHaveLength(seo.faq.length);
			unmount();
		},
	);
});

it("keeps search copy within useful lengths", () => {
	for (const tool of tools) {
		for (const seo of Object.values(tool.seo)) {
			expect(seo.metaDescription.length).toBeLessThanOrEqual(170);
			expect(seo.metaDescription.length).toBeGreaterThanOrEqual(110);
			expect(seo.features.length).toBeGreaterThanOrEqual(4);
			expect(seo.steps.length).toBe(3);
			expect(seo.faq.length).toBeGreaterThanOrEqual(3);
		}
	}
});

it("sets landing meta and marks unknown pages as noindex", () => {
	const { unmount } = renderAt("/");
	expect(
		document.head.querySelector('link[rel="canonical"]')?.getAttribute("href"),
	).toBe("https://boypanjaitan.com/tools/");
	expect(meta('meta[property="og:image"]')).toBe(
		"https://boypanjaitan.com/tools/og/tools.png",
	);
	expect(meta('meta[name="robots"]')).toBeUndefined();
	unmount();
	renderAt("/missing");
	expect(meta('meta[name="robots"]')).toBe("noindex");
	expect(document.head.querySelector('meta[property="og:image"]')).toBeNull();
});
