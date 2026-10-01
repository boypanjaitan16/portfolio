import { useEffect } from "react";
import { useLocation } from "react-router-dom";

type PageMetaProps = {
	title: string;
	description: string;
	image?: string;
	kind?: "website" | "article";
	publishedAt?: string | null;
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

function setNamedMeta(name: string, content: string) {
	let element = document.head.querySelector<HTMLMetaElement>(
		`meta[name="${name}"]`,
	);
	if (!element) {
		element = document.createElement("meta");
		element.name = name;
		document.head.appendChild(element);
	}
	element.content = content;
}

export function PageMeta({
	title,
	description,
	image,
	kind = "website",
	publishedAt,
}: PageMetaProps) {
	const { pathname } = useLocation();

	useEffect(() => {
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
		setMeta("og:type", kind);
		setNamedMeta("twitter:title", pageTitle);
		setNamedMeta("twitter:description", description);
		setNamedMeta("twitter:card", image ? "summary_large_image" : "summary");
		if (image) {
			setMeta("og:image", image);
			setNamedMeta("twitter:image", image);
		} else {
			document.head.querySelector('meta[property="og:image"]')?.remove();
			document.head.querySelector('meta[name="twitter:image"]')?.remove();
		}
		if (kind === "article" && publishedAt) {
			setMeta("article:published_time", publishedAt);
		} else {
			document.head
				.querySelector('meta[property="article:published_time"]')
				?.remove();
		}
	}, [description, image, kind, pathname, publishedAt, title]);

	return null;
}
