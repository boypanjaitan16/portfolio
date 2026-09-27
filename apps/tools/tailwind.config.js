import typography from "@tailwindcss/typography";
import defaultTheme from "tailwindcss/defaultTheme";

/** @type {import("tailwindcss").Config} */
export default {
	content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
	theme: {
		extend: {
			colors: {
				ink: "#0f172a",
				mist: "#f8fafc",
				sand: "#e2e8f0",
				accent: "#0ea5e9",
			},
			fontFamily: {
				display: ["Space Grotesk", "Sora", ...defaultTheme.fontFamily.sans],
				sans: ["Work Sans", ...defaultTheme.fontFamily.sans],
			},
			boxShadow: {
				soft: "0 18px 44px rgba(15, 23, 42, 0.08)",
			},
		},
	},
	plugins: [typography],
};
