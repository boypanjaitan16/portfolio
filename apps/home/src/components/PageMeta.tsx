import { useEffect } from "react";
import { useLocation } from "react-router-dom";

type PageMetaProps = {
	title: string;
	description: string;
	image?: string;
	lang?: string;
};

function setMeta(property: string, content: string) {
	let element = document.head.querySelector<HTMLMetaElement>(
		`meta[property="${property}"]`,
	);

	if (!element) {
		element = document.createElement("meta");
		element.setAttribute("property", property);
		document.head.appendChild(element);
	}

	element.content = content;
}

export function PageMeta({ title, description, image, lang }: PageMetaProps) {
	const { pathname } = useLocation();

	useEffect(() => {
		if (lang) document.documentElement.lang = lang;
		const pageTitle = `${title} | Boy Boni Panjaitan`;
		const url = `https://boypanjaitan.com${pathname}`;
		document.title = pageTitle;

		let descriptionElement = document.head.querySelector<HTMLMetaElement>(
			'meta[name="description"]',
		);
		if (!descriptionElement) {
			descriptionElement = document.createElement("meta");
			descriptionElement.name = "description";
			document.head.appendChild(descriptionElement);
		}
		descriptionElement.content = description;

		let canonical = document.head.querySelector<HTMLLinkElement>(
			'link[rel="canonical"]',
		);
		if (!canonical) {
			canonical = document.createElement("link");
			canonical.rel = "canonical";
			document.head.appendChild(canonical);
		}
		canonical.href = url;

		setMeta("og:title", pageTitle);
		setMeta("og:description", description);
		setMeta("og:url", url);
		if (image) setMeta("og:image", image);
		else document.head.querySelector('meta[property="og:image"]')?.remove();
	}, [description, image, lang, pathname, title]);

	return null;
}
