import "@testing-library/jest-dom/vitest";
import { tools } from "../toolCatalog";

// Tool pages are lazy-loaded. Loading them once here lets tests render tool
// routes synchronously, as `main.tsx` does for the initial URL. `lazyPage.test.ts`
// covers the Suspense fallback with its own unloaded page.
beforeAll(async () => {
	await Promise.all(tools.map((tool) => tool.page.preload()));
});
