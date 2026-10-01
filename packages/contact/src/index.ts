export type ContactLocale = "en" | "id";
export type ContactStatus = "NEW" | "IN_PROGRESS" | "DONE";

export type ContactMessage = {
	id: string;
	name: string;
	email: string;
	message: string;
	locale: ContactLocale;
	sourcePath: string;
	status: ContactStatus;
	adminNote: string;
	createdAt: string;
	updatedAt: string;
};

export type ContactSubmission = Pick<
	ContactMessage,
	"name" | "email" | "message" | "locale" | "sourcePath"
>;

export const contactLimits = {
	name: 100,
	email: 254,
	message: 4000,
	adminNote: 2000,
	sourcePath: 200,
} as const;
