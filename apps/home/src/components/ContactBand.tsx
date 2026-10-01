import { contactLimits } from "@portfolio/contact";
import { useMutation } from "@tanstack/react-query";
import { ArrowUpRight } from "lucide-react";
import { type FormEvent, useRef, useState } from "react";
import { useLocale } from "../i18n/LocaleProvider";
import { submitContactMessage } from "../lib/contactMessages";

const formCopy = {
	en: {
		name: "Name",
		email: "Email",
		message: "Message",
		namePlaceholder: "Your name",
		emailPlaceholder: "you@example.com",
		messagePlaceholder: "Tell me about your project or question...",
		submit: "Send message",
		sending: "Sending...",
		success: "Thanks for reaching out. Your message has been sent.",
		error: "Your message could not be sent. Please try again.",
		invalid:
			"Please enter a valid name, email, and a message of at least 10 characters.",
		privacy: "Your email is used only to reply to this message.",
	},
	id: {
		name: "Nama",
		email: "Email",
		message: "Pesan",
		namePlaceholder: "Nama Anda",
		emailPlaceholder: "anda@contoh.com",
		messagePlaceholder: "Ceritakan proyek atau pertanyaan Anda...",
		submit: "Kirim pesan",
		sending: "Mengirim...",
		success: "Terima kasih. Pesan Anda sudah terkirim.",
		error: "Pesan belum dapat dikirim. Silakan coba lagi.",
		invalid: "Isi nama, email yang valid, dan pesan minimal 10 karakter.",
		privacy: "Email Anda hanya digunakan untuk membalas pesan ini.",
	},
} as const;

const fieldClassName =
	"w-full rounded-none border border-white/55 bg-white/10 px-4 py-3 text-white placeholder:text-white/60 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/60";

export function ContactBand() {
	const { content, locale } = useLocale();
	const labels = formCopy[locale];
	const formRef = useRef<HTMLFormElement>(null);
	const busyRef = useRef(false);
	const [feedback, setFeedback] = useState<
		"success" | "error" | "invalid" | null
	>(null);
	const submit = useMutation({ mutationFn: submitContactMessage });

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (busyRef.current) return;
		const form = event.currentTarget;
		const data = new FormData(form);
		const name = String(data.get("name") ?? "").trim();
		const email = String(data.get("email") ?? "").trim();
		const message = String(data.get("message") ?? "").trim();
		const sourcePath = window.location.pathname.slice(
			0,
			contactLimits.sourcePath,
		);
		if (
			!name ||
			name.length > contactLimits.name ||
			!/^[A-Za-z0-9._+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email) ||
			email.length > contactLimits.email ||
			message.length < 10 ||
			message.length > contactLimits.message
		) {
			setFeedback("invalid");
			return;
		}
		busyRef.current = true;
		setFeedback(null);
		try {
			await submit.mutateAsync({ name, email, message, locale, sourcePath });
			formRef.current?.reset();
			setFeedback("success");
		} catch {
			setFeedback("error");
		} finally {
			busyRef.current = false;
		}
	};

	return (
		<section className="bg-signal text-white" aria-labelledby="contact-title">
			<div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-16 md:grid-cols-12 md:px-10 md:py-20">
				<p className="font-mono text-[11px] uppercase tracking-[0.18em] md:col-span-3">
					{content.contact.label}
				</p>
				<div className="md:col-span-9">
					<h2
						id="contact-title"
						className="max-w-4xl text-4xl font-semibold leading-none tracking-[-0.045em] sm:text-6xl"
					>
						{content.contact.title}
					</h2>
					<p className="mt-6 max-w-2xl leading-7 text-white/80">
						{content.contact.body}
					</p>
					<form
						noValidate
						ref={formRef}
						className="mt-9 max-w-2xl space-y-5"
						onSubmit={(event) => void handleSubmit(event)}
					>
						<div className="grid gap-5 sm:grid-cols-2">
							<label className="block text-sm font-semibold">
								{labels.name}
								<input
									className={`${fieldClassName} mt-2`}
									name="name"
									autoComplete="name"
									maxLength={contactLimits.name}
									required
									placeholder={labels.namePlaceholder}
								/>
							</label>
							<label className="block text-sm font-semibold">
								{labels.email}
								<input
									className={`${fieldClassName} mt-2`}
									name="email"
									type="email"
									autoComplete="email"
									maxLength={contactLimits.email}
									required
									placeholder={labels.emailPlaceholder}
								/>
							</label>
						</div>
						<label className="block text-sm font-semibold">
							{labels.message}
							<textarea
								className={`${fieldClassName} mt-2 min-h-40 resize-y`}
								name="message"
								minLength={10}
								maxLength={contactLimits.message}
								required
								placeholder={labels.messagePlaceholder}
							/>
						</label>
						<p className="text-sm text-white/75">{labels.privacy}</p>
						{feedback && (
							<p role="status" className="border-l-2 border-white pl-3 text-sm">
								{labels[feedback]}
							</p>
						)}
						<button
							type="submit"
							disabled={submit.isPending}
							className="inline-flex min-h-12 items-center gap-3 bg-white px-5 py-3 font-semibold text-signal transition hover:bg-paper disabled:cursor-wait disabled:opacity-65"
						>
							{submit.isPending ? labels.sending : labels.submit}
							{!submit.isPending && (
								<ArrowUpRight size={18} aria-hidden="true" />
							)}
						</button>
					</form>
				</div>
			</div>
		</section>
	);
}
