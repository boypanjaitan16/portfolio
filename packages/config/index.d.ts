export declare const portfolioTheme: {
	colors: {
		primary: string;
		ink: string;
		paper: string;
		line: string;
		muted: string;
	};
	fonts: { sans: string; mono: string };
	shadows: { soft: string };
};

export declare const socialLinks: {
	instagram: string;
	facebook: string;
	github: string;
};

export declare const adminAntdTheme: {
	token: {
		colorPrimary: string;
		colorText: string;
		colorTextSecondary: string;
		colorBgBase: string;
		colorBgContainer: string;
		colorBorder: string;
		colorTextLightSolid: string;
		fontFamily: string;
		borderRadius: number;
	};
	components: { Form: { verticalLabelPadding: string; labelColor: string } };
};

export declare function applyPortfolioTheme(root?: HTMLElement): void;
