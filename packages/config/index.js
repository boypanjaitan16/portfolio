export const portfolioTheme = {
	colors: {
		primary: "#e60023",
		ink: "#111111",
		paper: "#f5f2eb",
		line: "#d9d4ca",
		muted: "#696762",
	},
	fonts: {
		sans: "Instrument Sans Variable",
		mono: "IBM Plex Mono",
	},
	shadows: {
		soft: "0 24px 60px rgba(17, 17, 17, 0.14)",
	},
};

export const adminAntdTheme = {
	token: {
		colorPrimary: portfolioTheme.colors.primary,
		colorText: portfolioTheme.colors.ink,
		colorTextSecondary: portfolioTheme.colors.muted,
		colorBgBase: portfolioTheme.colors.paper,
		colorBgContainer: "#ffffff",
		colorBorder: portfolioTheme.colors.line,
		colorTextLightSolid: "#ffffff",
		fontFamily: `"${portfolioTheme.fonts.sans}", sans-serif`,
		borderRadius: 0,
	},
	components: {
		Form: {
			verticalLabelPadding: "0px",
			labelColor: portfolioTheme.colors.ink,
		},
	},
};

export function applyPortfolioTheme(root = document.documentElement) {
	for (const [name, value] of Object.entries(portfolioTheme.colors)) {
		root.style.setProperty(`--portfolio-${name}`, value);
	}
	root.style.setProperty(
		"--portfolio-font-sans",
		`"${portfolioTheme.fonts.sans}", sans-serif`,
	);
	root.style.setProperty(
		"--portfolio-font-mono",
		`"${portfolioTheme.fonts.mono}", monospace`,
	);
}
