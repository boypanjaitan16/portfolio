import type { ContactMessage, ContactStatus } from "@portfolio/contact";
import {
	collection,
	deleteDoc,
	doc,
	getDocs,
	orderBy,
	query,
	serverTimestamp,
	updateDoc,
} from "firebase/firestore";
import { getFirestoreDb } from "./firebase";

function asIso(value: unknown): string {
	if (
		value &&
		typeof value === "object" &&
		"toDate" in value &&
		typeof value.toDate === "function"
	) {
		return (value.toDate() as Date).toISOString();
	}
	return "";
}

export async function listContactMessages(): Promise<ContactMessage[]> {
	const snapshot = await getDocs(
		query(
			collection(getFirestoreDb(), "contactMessages"),
			orderBy("createdAt", "desc"),
		),
	);
	return snapshot.docs.map((item) => {
		const data = item.data();
		return {
			id: item.id,
			name: data.name,
			email: data.email,
			message: data.message,
			locale: data.locale,
			sourcePath: data.sourcePath,
			status: data.status,
			adminNote: data.adminNote,
			createdAt: asIso(data.createdAt),
			updatedAt: asIso(data.updatedAt),
		} as ContactMessage;
	});
}

export async function updateContactMessage(input: {
	id: string;
	status: ContactStatus;
	adminNote: string;
}): Promise<void> {
	await updateDoc(doc(getFirestoreDb(), "contactMessages", input.id), {
		status: input.status,
		adminNote: input.adminNote,
		updatedAt: serverTimestamp(),
	});
}

export async function deleteContactMessage(id: string): Promise<void> {
	await deleteDoc(doc(getFirestoreDb(), "contactMessages", id));
}
