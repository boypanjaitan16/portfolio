import typography from "@tailwindcss/typography";
import defaultTheme from "tailwindcss/defaultTheme";

/** @type {import("tailwindcss").Config} */
export default {
	content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
	theme: {
		extend: {
			colors: {
				ink: "#111111",
				paper: "#f5f2eb",
				line: "#d9d4ca",
				muted: "#696762",
				signal: "#e60023",
			},
			fontFamily: {
				display: ["Instrument Sans Variable", ...defaultTheme.fontFamily.sans],
				sans: ["Instrument Sans Variable", ...defaultTheme.fontFamily.sans],
				mono: ["IBM Plex Mono", ...defaultTheme.fontFamily.mono],
			},
			boxShadow: {
				soft: "0 24px 60px rgba(17, 17, 17, 0.14)",
			},
		},
	},
	plugins: [typography],
};
