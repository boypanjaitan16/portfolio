import type { Locale } from "./portfolioContent";

export type PageContent = {
	common: {
		viewAllWork: string;
		viewAllNotes: string;
		home: string;
		breadcrumbLabel: string;
		backHome: string;
	};
	work: {
		metaTitle: string;
		metaDescription: string;
		eyebrow: string;
		title: string;
		intro: string;
		frameworkLabel: string;
		frameworkTitle: string;
		frameworkItems: Array<{ title: string; description: string }>;
	};
	about: {
		metaTitle: string;
		metaDescription: string;
		eyebrow: string;
		title: string;
		intro: string;
		biography: string[];
		nowLabel: string;
		nowTitle: string;
		nowBody: string;
		capabilitiesLabel: string;
		capabilitiesTitle: string;
		capabilities: Array<{ title: string; description: string }>;
		stackLabel: string;
		stackTitle: string;
		stackGroups: Array<{ label: string; items: string[] }>;
	};
	notes: {
		metaTitle: string;
		metaDescription: string;
		eyebrow: string;
		title: string;
		intro: string;
		queueLabel: string;
		queueSummary: string;
		openArticle: string;
		loading: string;
		error: string;
		empty: string;
	};
	notFound: {
		metaTitle: string;
		metaDescription: string;
		label: string;
		title: string;
		body: string;
	};
};

export const pageContent: Record<Locale, PageContent> = {
	en: {
		common: {
			viewAllWork: "View all work",
			viewAllNotes: "Browse all notes",
			home: "Home",
			breadcrumbLabel: "Breadcrumb",
			backHome: "Back home",
		},
		work: {
			metaTitle: "Work",
			metaDescription:
				"Selected software systems and concept case studies by Boy Boni Panjaitan.",
			eyebrow: "Work index · 01—03",
			title: "Systems, interfaces, and the decisions between them.",
			intro:
				"This index currently uses clearly labelled concept case studies. It establishes how real work will be documented: context first, trade-offs visible, and outcomes stated without theatre.",
			frameworkLabel: "Case study anatomy",
			frameworkTitle: "Evidence over spectacle.",
			frameworkItems: [
				{
					title: "Context",
					description:
						"What changed, who was affected, and why the problem mattered.",
				},
				{
					title: "Constraints",
					description:
						"The technical, product, and operational limits shaping the work.",
				},
				{
					title: "Decisions",
					description:
						"The alternatives considered and the trade-offs behind the chosen path.",
				},
				{
					title: "Outcome",
					description:
						"What improved, what remained unresolved, and what was learned.",
				},
			],
		},
		about: {
			metaTitle: "About",
			metaDescription:
				"About Boy Boni Panjaitan, a software engineer focused on dependable products and clear systems.",
			eyebrow: "About · engineering practice",
			title: "Engineering with a product point of view.",
			intro:
				"I care about software that behaves predictably, communicates clearly, and remains understandable after launch.",
			biography: [
				"I’m Boy Boni Panjaitan, a software engineer based in Indonesia. My work lives at the intersection of product thinking, interface design, and systems engineering.",
				"I’m drawn to ambiguous problems where the difficult part is not only writing code, but deciding what the system should make obvious, what it should automate, and what it should leave in human hands.",
				"This site is a working record of that practice: selected work, engineering notes, and small tools built to solve focused problems.",
			],
			nowLabel: "Now",
			nowTitle: "Based in Indonesia · UTC+8",
			nowBody:
				"Currently developing this portfolio, documenting engineering decisions, and building focused tools for the web.",
			capabilitiesLabel: "What I bring",
			capabilitiesTitle: "From unclear problem to maintainable product.",
			capabilities: [
				{
					title: "Product engineering",
					description:
						"Turning user needs and business constraints into focused software increments.",
				},
				{
					title: "Frontend systems",
					description:
						"Building accessible interfaces, durable component boundaries, and legible state.",
				},
				{
					title: "Developer experience",
					description:
						"Reducing friction with practical tooling, automation, and clear conventions.",
				},
				{
					title: "Technical stewardship",
					description:
						"Making trade-offs explicit and leaving systems easier to operate and extend.",
				},
			],
			stackLabel: "Working toolkit",
			stackTitle: "Tools follow the problem.",
			stackGroups: [
				{ label: "Core", items: ["TypeScript", "React", "Node.js"] },
				{
					label: "Interface",
					items: ["Tailwind CSS", "Design systems", "Accessibility"],
				},
				{ label: "Systems", items: ["APIs", "SQL", "Observability"] },
				{ label: "Delivery", items: ["Git", "CI/CD", "Automated testing"] },
			],
		},
		notes: {
			metaTitle: "Notes",
			metaDescription:
				"Engineering notes by Boy Boni Panjaitan on interfaces, reliability, and product development.",
			eyebrow: "Notes · published writing",
			title: "Working through software in public.",
			intro:
				"Published essays on engineering judgment, interface design, reliability, and useful software.",
			queueLabel: "Published notes",
			queueSummary: "Articles written and published in English.",
			openArticle: "Read article",
			loading: "Loading articles…",
			error: "Articles could not be loaded. Please try again later.",
			empty: "No published articles yet.",
		},
		notFound: {
			metaTitle: "Page not found",
			metaDescription: "The requested page could not be found.",
			label: "404 · Off the map",
			title: "This page does not exist.",
			body: "The address may have changed, or the page may still be waiting to be built.",
		},
	},
	id: {
		common: {
			viewAllWork: "Lihat semua karya",
			viewAllNotes: "Jelajahi semua catatan",
			home: "Beranda",
			breadcrumbLabel: "Jejak navigasi",
			backHome: "Kembali ke beranda",
		},
		work: {
			metaTitle: "Karya",
			metaDescription:
				"Sistem software pilihan dan studi kasus konsep oleh Boy Boni Panjaitan.",
			eyebrow: "Indeks karya · 01—03",
			title: "Sistem, antarmuka, dan keputusan di antaranya.",
			intro:
				"Indeks ini sementara memakai studi kasus konsep yang diberi label dengan jelas. Struktur ini menunjukkan bagaimana karya nyata akan ditulis: konteks terlebih dahulu, trade-off terlihat, dan hasil disampaikan tanpa dramatisasi.",
			frameworkLabel: "Anatomi studi kasus",
			frameworkTitle: "Bukti lebih penting daripada pertunjukan.",
			frameworkItems: [
				{
					title: "Konteks",
					description:
						"Apa yang berubah, siapa yang terdampak, dan mengapa masalahnya penting.",
				},
				{
					title: "Batasan",
					description:
						"Batas teknis, produk, dan operasional yang membentuk pekerjaan.",
				},
				{
					title: "Keputusan",
					description:
						"Alternatif yang dipertimbangkan dan trade-off di balik jalur terpilih.",
				},
				{
					title: "Hasil",
					description:
						"Apa yang membaik, apa yang belum selesai, dan apa yang dipelajari.",
				},
			],
		},
		about: {
			metaTitle: "Tentang",
			metaDescription:
				"Tentang Boy Boni Panjaitan, software engineer yang berfokus pada produk andal dan sistem yang jelas.",
			eyebrow: "Tentang · praktik engineering",
			title: "Engineering dengan sudut pandang produk.",
			intro:
				"Saya peduli pada software yang dapat diprediksi, berkomunikasi dengan jelas, dan tetap mudah dipahami setelah diluncurkan.",
			biography: [
				"Saya Boy Boni Panjaitan, software engineer yang berbasis di Indonesia. Pekerjaan saya berada di persimpangan pemikiran produk, desain antarmuka, dan systems engineering.",
				"Saya tertarik pada masalah ambigu yang bagian tersulitnya bukan hanya menulis kode, tetapi menentukan apa yang harus diperjelas oleh sistem, apa yang perlu diotomatisasi, dan apa yang sebaiknya tetap berada di tangan manusia.",
				"Website ini adalah catatan kerja dari praktik tersebut: karya pilihan, catatan engineering, dan tools kecil untuk menyelesaikan masalah yang terarah.",
			],
			nowLabel: "Sekarang",
			nowTitle: "Berbasis di Indonesia · UTC+8",
			nowBody:
				"Saat ini mengembangkan portfolio ini, mendokumentasikan keputusan engineering, dan membangun tools web dengan fokus yang jelas.",
			capabilitiesLabel: "Yang saya bawa",
			capabilitiesTitle:
				"Dari masalah kabur menjadi produk yang mudah dirawat.",
			capabilities: [
				{
					title: "Product engineering",
					description:
						"Mengubah kebutuhan pengguna dan batasan bisnis menjadi iterasi software yang terarah.",
				},
				{
					title: "Frontend systems",
					description:
						"Membangun antarmuka aksesibel, batas komponen yang tahan lama, dan state yang terbaca.",
				},
				{
					title: "Developer experience",
					description:
						"Mengurangi friksi melalui tooling, otomasi, dan konvensi yang jelas.",
				},
				{
					title: "Technical stewardship",
					description:
						"Memperjelas trade-off dan meninggalkan sistem yang lebih mudah dioperasikan serta dikembangkan.",
				},
			],
			stackLabel: "Toolkit kerja",
			stackTitle: "Tools mengikuti masalah.",
			stackGroups: [
				{ label: "Core", items: ["TypeScript", "React", "Node.js"] },
				{
					label: "Antarmuka",
					items: ["Tailwind CSS", "Design system", "Aksesibilitas"],
				},
				{ label: "Sistem", items: ["API", "SQL", "Observability"] },
				{ label: "Delivery", items: ["Git", "CI/CD", "Automated testing"] },
			],
		},
		notes: {
			metaTitle: "Catatan",
			metaDescription:
				"Catatan engineering Boy Boni Panjaitan tentang antarmuka, reliability, dan pengembangan produk.",
			eyebrow: "Catatan · tulisan terbit",
			title: "Mengurai software di ruang publik.",
			intro:
				"Esai tentang pertimbangan engineering, desain antarmuka, reliability, dan software yang berguna.",
			queueLabel: "Catatan terbit",
			queueSummary:
				"Artikel yang ditulis dan diterbitkan dalam bahasa Indonesia.",
			openArticle: "Baca artikel",
			loading: "Memuat artikel…",
			error: "Artikel gagal dimuat. Coba lagi nanti.",
			empty: "Belum ada artikel terbit.",
		},
		notFound: {
			metaTitle: "Halaman tidak ditemukan",
			metaDescription: "Halaman yang diminta tidak dapat ditemukan.",
			label: "404 · Di luar peta",
			title: "Halaman ini tidak ada.",
			body: "Alamatnya mungkin berubah, atau halamannya memang masih menunggu untuk dibangun.",
		},
	},
};
