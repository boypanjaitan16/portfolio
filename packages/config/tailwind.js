import typography from "@tailwindcss/typography";
import defaultTheme from "tailwindcss/defaultTheme";
import { portfolioTheme } from "./index.js";

/** @type {import("tailwindcss").Config} */
const portfolioPreset = {
	content: [],
	theme: {
		extend: {
			colors: {
				...portfolioTheme.colors,
				signal: portfolioTheme.colors.primary,
			},
			fontFamily: {
				display: [portfolioTheme.fonts.sans, ...defaultTheme.fontFamily.sans],
				sans: [portfolioTheme.fonts.sans, ...defaultTheme.fontFamily.sans],
				mono: [portfolioTheme.fonts.mono, ...defaultTheme.fontFamily.mono],
			},
			boxShadow: portfolioTheme.shadows,
		},
	},
	plugins: [typography],
};

export default portfolioPreset;
