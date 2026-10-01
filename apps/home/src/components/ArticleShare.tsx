import { Copy, Facebook, MessageCircle, Send, Share2, X } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import type { Locale } from "../content/portfolioContent";
import {
	createArticleShareLinks,
	getArticleShareUrl,
} from "../lib/articleShare";

type ArticleShareProps = {
	title: string;
	locale: Locale;
};

type ShareStatus = "copied" | "copyError" | "shareError" | null;

const copy = {
	en: {
		label: "Share this article",
		native: "More options",
		copy: "Copy link",
		copied: "Link copied.",
		copyError: "Couldn't copy automatically. Select the link below.",
		shareError: "Couldn't open sharing. Try one of the links below.",
		manualCopy: "Article link",
	},
	id: {
		label: "Bagikan artikel ini",
		native: "Pilihan lainnya",
		copy: "Salin tautan",
		copied: "Tautan tersalin.",
		copyError: "Tidak dapat menyalin otomatis. Pilih tautan di bawah.",
		shareError:
			"Tidak dapat membuka menu berbagi. Coba salah satu tautan di bawah.",
		manualCopy: "Tautan artikel",
	},
} satisfies Record<Locale, Record<string, string>>;

const controlClassName =
	"grid h-10 w-10 place-items-center border border-ink/20 text-ink transition-colors hover:border-signal hover:text-signal focus-visible:border-signal focus-visible:text-signal";

function ShareIconTooltip({
	label,
	children,
}: {
	label: string;
	children: ReactNode;
}) {
	return (
		<span className="group relative inline-flex">
			{children}
			<span
				aria-hidden="true"
				className="pointer-events-none invisible absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap bg-ink px-2 py-1 font-mono text-[10px] text-white opacity-0 transition-opacity group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 lg:bottom-auto lg:left-full lg:top-1/2 lg:mb-0 lg:ml-2 lg:translate-x-0 lg:-translate-y-1/2"
			>
				{label}
			</span>
		</span>
	);
}

export function ArticleShare({ title, locale }: ArticleShareProps) {
	const [status, setStatus] = useState<ShareStatus>(null);
	const manualInput = useRef<HTMLInputElement>(null);
	const labels = copy[locale];
	const prerenderOrigin = (
		window as Window & { __portfolioPrerenderOrigin?: string }
	).__portfolioPrerenderOrigin;
	const articleUrl = getArticleShareUrl(window.location.href, prerenderOrigin);
	const links = createArticleShareLinks(title, articleUrl);
	const canShare = typeof navigator.share === "function";

	useEffect(() => {
		if (status === "copyError") manualInput.current?.select();
	}, [status]);

	const handleNativeShare = async () => {
		setStatus(null);
		try {
			await navigator.share({ title, url: articleUrl });
		} catch (error) {
			if (error instanceof DOMException && error.name === "AbortError") return;
			setStatus("shareError");
		}
	};

	const handleCopy = async () => {
		if (!navigator.clipboard?.writeText) {
			setStatus("copyError");
			return;
		}
		try {
			await navigator.clipboard.writeText(articleUrl);
			setStatus("copied");
		} catch {
			setStatus("copyError");
		}
	};

	const channels = [
		{ label: "WhatsApp", href: links.whatsapp, Icon: MessageCircle },
		{ label: "Telegram", href: links.telegram, Icon: Send },
		{ label: "Facebook", href: links.facebook, Icon: Facebook },
		{ label: "X", href: links.x, Icon: X },
	];

	return (
		<aside
			aria-label={labels.label}
			lang={locale}
			className="min-w-0 lg:sticky lg:top-24 lg:self-start"
		>
			<p className="sr-only">{labels.label}</p>
			<div className="flex flex-wrap gap-2 lg:flex-col">
				{canShare && (
					<ShareIconTooltip label={labels.native}>
						<button
							type="button"
							aria-label={labels.native}
							className={controlClassName}
							onClick={handleNativeShare}
						>
							<Share2 size={18} aria-hidden="true" />
						</button>
					</ShareIconTooltip>
				)}
				<ShareIconTooltip label={labels.copy}>
					<button
						type="button"
						aria-label={labels.copy}
						className={controlClassName}
						onClick={handleCopy}
					>
						<Copy size={18} aria-hidden="true" />
					</button>
				</ShareIconTooltip>
				{channels.map(({ label, href, Icon }) => (
					<ShareIconTooltip key={label} label={label}>
						<a
							aria-label={label}
							href={href}
							target="_blank"
							rel="noopener noreferrer"
							className={controlClassName}
						>
							<Icon size={18} aria-hidden="true" />
						</a>
					</ShareIconTooltip>
				))}
			</div>
			{status && (
				<p role="status" className="mt-3 text-sm leading-5 text-muted">
					{labels[status]}
				</p>
			)}
			{status === "copyError" && (
				<input
					ref={manualInput}
					aria-label={labels.manualCopy}
					className="mt-2 w-full border border-ink/20 bg-white px-2 py-2 text-xs"
					readOnly
					value={articleUrl}
					onFocus={(event) => event.currentTarget.select()}
				/>
			)}
		</aside>
	);
}
