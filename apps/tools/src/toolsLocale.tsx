import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";

export type Locale = "en" | "id";
const STORAGE_KEY = "portfolio-locale";

const en = {
	portfolio: "Portfolio",
	language: "Language",
	collection: "Public tools",
	homeTitle: "Useful tools, ready when you are.",
	homeDescription:
		"Small, focused tools for everyday work. Choose one to get started.",
	availableTools: "Available tools",
	openTool: "Open tool",
	notFound: "Page not found",
	backToTools: "Back to tools",
	loading: "Loading…",
	footerNavigation: "Legal pages",
	privacyPolicy: "Privacy Policy",
	termsOfService: "Terms of Service",
};

const id = {
	portfolio: "Portofolio",
	language: "Bahasa",
	collection: "Tools publik",
	homeTitle: "Tools berguna, siap digunakan.",
	homeDescription:
		"Tools sederhana untuk pekerjaan sehari-hari. Pilih salah satu untuk memulai.",
	availableTools: "Tools tersedia",
	openTool: "Buka tool",
	notFound: "Halaman tidak ditemukan",
	backToTools: "Kembali ke tools",
	loading: "Memuat…",
	footerNavigation: "Halaman kebijakan",
	privacyPolicy: "Kebijakan Privasi",
	termsOfService: "Ketentuan Layanan",
} satisfies Record<keyof typeof en, string>;

const translations = { en, id } satisfies Record<
	Locale,
	Record<keyof typeof en, string>
>;

type LocaleContextValue = {
	locale: Locale;
	setLocale: (locale: Locale) => void;
	t: (typeof translations)[Locale];
};
const LocaleContext = createContext<LocaleContextValue | null>(null);

function initialLocale(): Locale {
	if (typeof window === "undefined") return "en";
	try {
		const stored = window.localStorage.getItem(STORAGE_KEY);
		if (stored === "en" || stored === "id") return stored;
	} catch {
		/* Private browsing can disable storage. */
	}
	return window.navigator.language.toLowerCase().startsWith("id") ? "id" : "en";
}

export function LocaleProvider({ children }: { children: ReactNode }) {
	const [locale, setLocale] = useState<Locale>(initialLocale);
	useEffect(() => {
		try {
			window.localStorage.setItem(STORAGE_KEY, locale);
		} catch {
			/* Keep the in-memory choice. */
		}
		document.documentElement.lang = locale;
	}, [locale]);
	return (
		<LocaleContext.Provider
			value={{ locale, setLocale, t: translations[locale] }}
		>
			{children}
		</LocaleContext.Provider>
	);
}

export function useToolsLocale() {
	const context = useContext(LocaleContext);
	if (!context)
		throw new Error("useToolsLocale must be used inside LocaleProvider.");
	return context;
}
