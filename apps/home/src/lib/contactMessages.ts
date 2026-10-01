import type { ContactSubmission } from "@portfolio/contact";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getFirestoreDb } from "./firebase";

export async function submitContactMessage(
	input: ContactSubmission,
): Promise<void> {
	await addDoc(collection(getFirestoreDb(), "contactMessages"), {
		...input,
		status: "NEW",
		adminNote: "",
		createdAt: serverTimestamp(),
		updatedAt: serverTimestamp(),
	});
}
