import portfolioPreset from "@portfolio/config/tailwind";

/** @type {import("tailwindcss").Config} */
export default {
	content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
	presets: [portfolioPreset],
};
