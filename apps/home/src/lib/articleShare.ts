export function getArticleShareUrl(
	browserUrl: string,
	prerenderOrigin?: string,
) {
	if (!prerenderOrigin) return browserUrl;
	const current = new URL(browserUrl);
	return new URL(
		current.pathname + current.search + current.hash,
		prerenderOrigin,
	).href;
}

export function createArticleShareLinks(title: string, articleUrl: string) {
	const whatsapp = new URL("https://wa.me/");
	whatsapp.searchParams.set("text", `${title} ${articleUrl}`);

	const telegram = new URL("https://t.me/share/url");
	telegram.searchParams.set("url", articleUrl);
	telegram.searchParams.set("text", title);

	const facebook = new URL("https://www.facebook.com/sharer/sharer.php");
	facebook.searchParams.set("u", articleUrl);

	const x = new URL("https://x.com/intent/tweet");
	x.searchParams.set("url", articleUrl);
	x.searchParams.set("text", title);

	return {
		whatsapp: whatsapp.href,
		telegram: telegram.href,
		facebook: facebook.href,
		x: x.href,
	};
}
