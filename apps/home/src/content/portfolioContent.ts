export type Locale = "en" | "id";

export type Project = {
	number: string;
	title: string;
	summary: string;
	tags: string[];
	indexLabel: string;
};

export type Principle = {
	number: string;
	title: string;
	description: string;
};

export type PortfolioContent = {
	brand: string;
	role: string;
	location: string;
	navigation: {
		primaryLabel: string;
		work: string;
		about: string;
		notes: string;
		tools: string;
	};
	languageLabel: string;
	hero: {
		eyebrow: string;
		statement: string;
		intro: string;
		primaryAction: string;
	};
	work: {
		label: string;
		title: string;
		intro: string;
		conceptLabel: string;
		projects: Project[];
	};
	approach: {
		label: string;
		title: string;
		intro: string;
		principles: Principle[];
	};
	notes: {
		label: string;
		title: string;
		intro: string;
	};
	contact: {
		label: string;
		title: string;
		body: string;
		githubAction: string;
	};
	footer: {
		siteNote: string;
		summary: string;
		footerNavigationLabel: string;
		socialNavigationLabel: string;
		photoBy: string;
	};
	images: {
		redBuildingAlt: string;
	};
};

export const portfolioContent: Record<Locale, PortfolioContent> = {
	en: {
		brand: "BBP",
		role: "Software engineer · product-minded builder",
		location: "Indonesia · UTC+8",
		navigation: {
			primaryLabel: "Primary navigation",
			work: "Work",
			about: "About",
			notes: "Notes",
			tools: "Tools",
		},
		languageLabel: "Language",
		hero: {
			eyebrow: "Independent software engineer",
			statement: "I turn complex systems into useful, dependable products.",
			intro:
				"My work sits between software architecture and product craft: clear interfaces, resilient systems, and small tools that earn their place.",
			primaryAction: "See selected work",
		},
		work: {
			label: "Selected explorations",
			title: "Software shaped around real constraints.",
			intro:
				"These concept case studies preview the kind of problems this portfolio will document. Real project stories will replace them as they are prepared.",
			conceptLabel: "Concept case study",
			projects: [
				{
					number: "01",
					title: "Incident Atlas",
					summary:
						"A calm command surface for teams coordinating high-stakes incidents across noisy systems.",
					tags: ["Product systems", "Observability", "React"],
					indexLabel: "Reliability",
				},
				{
					number: "02",
					title: "Fieldkit",
					summary:
						"An offline-first workspace for capturing decisions where connectivity cannot be assumed.",
					tags: ["Local-first", "Systems design", "TypeScript"],
					indexLabel: "Field operations",
				},
				{
					number: "03",
					title: "Shipshape",
					summary:
						"A release-readiness view that makes risk, ownership, and unfinished work visible before launch day.",
					tags: ["Developer tools", "Workflow", "Information design"],
					indexLabel: "Delivery",
				},
			],
		},
		approach: {
			label: "Working principles",
			title: "Less ceremony. More clarity.",
			intro:
				"The best engineering choices make the next decision easier—for users, teammates, and the person maintaining the system later.",
			principles: [
				{
					number: "A",
					title: "Start with the constraint",
					description:
						"Understand the operational reality before choosing the abstraction.",
				},
				{
					number: "B",
					title: "Make states legible",
					description:
						"Good interfaces reveal what happened, what matters, and what comes next.",
				},
				{
					number: "C",
					title: "Build for the handoff",
					description:
						"Durable software should be understandable beyond its original author.",
				},
			],
		},
		notes: {
			label: "Field notes",
			title: "Thinking in public, carefully.",
			intro:
				"Short notes on engineering judgment, interface design, and keeping systems humane.",
		},
		contact: {
			label: "Next conversation",
			title: "Have a difficult problem worth making simpler?",
			body: "Contact details are being prepared. For now, the public GitHub profile is the most reliable way to follow the work.",
			githubAction: "Visit GitHub",
		},
		footer: {
			siteNote: "Personal portfolio · concept work clearly labelled",
			summary:
				"Software engineer shaping dependable products, clear interfaces, and useful tools.",
			footerNavigationLabel: "Footer navigation",
			socialNavigationLabel: "Social media",
			photoBy: "Photography via Unsplash",
		},
		images: {
			redBuildingAlt: "Geometric red building facade with repeating windows",
		},
	},
	id: {
		brand: "BBP",
		role: "Software engineer · product-minded builder",
		location: "Indonesia · UTC+8",
		navigation: {
			primaryLabel: "Navigasi utama",
			work: "Karya",
			about: "Tentang",
			notes: "Catatan",
			tools: "Tools",
		},
		languageLabel: "Bahasa",
		hero: {
			eyebrow: "Software engineer independen",
			statement:
				"Saya mengubah sistem kompleks menjadi produk yang berguna dan dapat diandalkan.",
			intro:
				"Pekerjaan saya berada di antara arsitektur perangkat lunak dan ketelitian produk: antarmuka yang jelas, sistem tangguh, dan tools kecil yang benar-benar layak dipakai.",
			primaryAction: "Lihat karya pilihan",
		},
		work: {
			label: "Eksplorasi pilihan",
			title: "Software yang dibentuk oleh batasan nyata.",
			intro:
				"Studi kasus konsep ini memberi gambaran tentang jenis masalah yang akan didokumentasikan di sini. Kisah proyek nyata akan menggantikannya setelah siap.",
			conceptLabel: "Studi kasus konsep",
			projects: [
				{
					number: "01",
					title: "Incident Atlas",
					summary:
						"Ruang kendali yang tenang untuk tim yang mengoordinasikan insiden penting di tengah sistem yang bising.",
					tags: ["Sistem produk", "Observability", "React"],
					indexLabel: "Reliability",
				},
				{
					number: "02",
					title: "Fieldkit",
					summary:
						"Workspace offline-first untuk merekam keputusan ketika koneksi tidak dapat diandalkan.",
					tags: ["Local-first", "Desain sistem", "TypeScript"],
					indexLabel: "Operasi lapangan",
				},
				{
					number: "03",
					title: "Shipshape",
					summary:
						"Tampilan kesiapan rilis yang memperjelas risiko, kepemilikan, dan pekerjaan tersisa sebelum hari peluncuran.",
					tags: ["Developer tools", "Alur kerja", "Desain informasi"],
					indexLabel: "Delivery",
				},
			],
		},
		approach: {
			label: "Prinsip kerja",
			title: "Lebih sedikit seremoni. Lebih banyak kejelasan.",
			intro:
				"Pilihan engineering terbaik membuat keputusan berikutnya lebih mudah—untuk pengguna, rekan satu tim, dan orang yang merawat sistem di kemudian hari.",
			principles: [
				{
					number: "A",
					title: "Mulai dari batasan",
					description: "Pahami realitas operasional sebelum memilih abstraksi.",
				},
				{
					number: "B",
					title: "Buat setiap state terbaca",
					description:
						"Antarmuka yang baik memperjelas apa yang terjadi, apa yang penting, dan langkah berikutnya.",
				},
				{
					number: "C",
					title: "Bangun untuk handoff",
					description:
						"Software yang tahan lama harus dapat dipahami selain oleh pembuat awalnya.",
				},
			],
		},
		notes: {
			label: "Catatan lapangan",
			title: "Berpikir di ruang publik, dengan hati-hati.",
			intro:
				"Catatan singkat tentang pertimbangan engineering, desain antarmuka, dan menjaga sistem tetap manusiawi.",
		},
		contact: {
			label: "Percakapan berikutnya",
			title: "Punya masalah sulit yang layak dibuat lebih sederhana?",
			body: "Detail kontak sedang disiapkan. Untuk saat ini, profil GitHub publik adalah cara paling pasti untuk mengikuti karya saya.",
			githubAction: "Kunjungi GitHub",
		},
		footer: {
			siteNote: "Portfolio personal · karya konsep diberi label dengan jelas",
			summary:
				"Software engineer yang membangun produk andal, antarmuka jelas, dan tools yang berguna.",
			footerNavigationLabel: "Navigasi footer",
			socialNavigationLabel: "Media sosial",
			photoBy: "Fotografi melalui Unsplash",
		},
		images: {
			redBuildingAlt: "Fasad gedung merah geometris dengan jendela berulang",
		},
	},
};
