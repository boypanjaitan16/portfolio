import { useLocation, useNavigate } from "react-router-dom";
import { useLocale } from "../i18n/LocaleProvider";

type LocaleToggleProps = {
	tone?: "light" | "dark" | "paper";
};

export function LocaleToggle({ tone = "light" }: LocaleToggleProps) {
	const { content, locale, setLocale } = useLocale();
	const location = useLocation();
	const navigate = useNavigate();
	const changeLocale = (next: "en" | "id") => {
		if (next === locale) return;
		setLocale(next);
		if (/^\/notes\/[^/]+$/.test(location.pathname)) navigate("/notes");
	};

	return (
		<fieldset className={`locale-toggle locale-toggle--${tone}`}>
			<legend className="sr-only">{content.languageLabel}</legend>
			<button
				type="button"
				aria-pressed={locale === "en"}
				onClick={() => changeLocale("en")}
			>
				EN
			</button>
			<span aria-hidden="true">/</span>
			<button
				type="button"
				aria-pressed={locale === "id"}
				onClick={() => changeLocale("id")}
			>
				ID
			</button>
		</fieldset>
	);
}
