import { socialLinks } from "@portfolio/config";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	base: process.env.VITE_BASE_PATH ?? "/",
	plugins: [
		react(),
		{
			name: "portfolio-social-metadata",
			transformIndexHtml(html) {
				const marker = '"__GITHUB_PROFILE_URL__"';
				if (!html.includes(marker)) {
					throw new Error("GitHub profile metadata marker is missing.");
				}
				return html.replace(marker, () => JSON.stringify(socialLinks.github));
			},
		},
	],
});
