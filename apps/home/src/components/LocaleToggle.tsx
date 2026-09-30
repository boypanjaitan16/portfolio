import { useLocale } from "../i18n/LocaleProvider";

type LocaleToggleProps = {
	tone?: "light" | "dark" | "paper";
};

export function LocaleToggle({ tone = "light" }: LocaleToggleProps) {
	const { content, locale, setLocale } = useLocale();

	return (
		<fieldset className={`locale-toggle locale-toggle--${tone}`}>
			<legend className="sr-only">{content.languageLabel}</legend>
			<button
				type="button"
				aria-pressed={locale === "en"}
				onClick={() => setLocale("en")}
			>
				EN
			</button>
			<span aria-hidden="true">/</span>
			<button
				type="button"
				aria-pressed={locale === "id"}
				onClick={() => setLocale("id")}
			>
				ID
			</button>
		</fieldset>
	);
}
