import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { type Locale, portfolioContent } from "../content/portfolioContent";

const STORAGE_KEY = "portfolio-locale";

type LocaleContextValue = {
	locale: Locale;
	setLocale: (locale: Locale) => void;
	content: (typeof portfolioContent)[Locale];
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function isLocale(value: string | null): value is Locale {
	return value === "en" || value === "id";
}

function getInitialLocale(): Locale {
	if (typeof window === "undefined") return "en";

	const storedLocale = window.localStorage.getItem(STORAGE_KEY);
	if (isLocale(storedLocale)) return storedLocale;

	return window.navigator.language.toLowerCase().startsWith("id") ? "id" : "en";
}

export function LocaleProvider({ children }: { children: ReactNode }) {
	const [locale, setLocale] = useState<Locale>(getInitialLocale);

	useEffect(() => {
		window.localStorage.setItem(STORAGE_KEY, locale);
		document.documentElement.lang = locale;
	}, [locale]);

	const value = useMemo(
		() => ({ locale, setLocale, content: portfolioContent[locale] }),
		[locale],
	);

	return (
		<LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
	);
}

export function useLocale() {
	const context = useContext(LocaleContext);
	if (!context)
		throw new Error("useLocale must be used within LocaleProvider.");
	return context;
}
