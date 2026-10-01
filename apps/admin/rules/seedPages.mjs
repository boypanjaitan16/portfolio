import { initializeTestEnvironment } from "@firebase/rules-unit-testing";

const environment = await initializeTestEnvironment({
	projectId: "demo-portfolio",
	firestore: {},
});
try {
	await environment.withSecurityRulesDisabled(async (context) => {
		const db = context.firestore();
		for (const [slug, locale, title, status] of [
			["english-smoke", "en", "English smoke article", "PUBLISHED"],
			["artikel-uji", "id", "Artikel uji Indonesia", "PUBLISHED"],
			["hidden-draft", "en", "Hidden draft", "DRAFT"],
		]) {
			await db
				.collection("articles")
				.doc(slug)
				.set({
					id: slug,
					slug,
					locale,
					title,
					summary: "Smoke test summary",
					topic: "Testing",
					contentHtml: "<p>Published body for prerender verification.</p>",
					status,
					cover: null,
					bodyImages: [],
					createdAt: "2026-01-01T00:00:00.000Z",
					updatedAt: "2026-01-01T00:00:00.000Z",
					publishedAt:
						status === "PUBLISHED" ? "2026-01-01T00:00:00.000Z" : null,
				});
		}
	});
} finally {
	await environment.cleanup();
}
