import { getApps, initializeApp } from "firebase/app";
import {
	connectFirestoreEmulator,
	type Firestore,
	getFirestore,
} from "firebase/firestore";

const config = {
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
	storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
	appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let database: Firestore | null = null;

export function getFirestoreDb() {
	if (!config.apiKey || !config.projectId || !config.appId) {
		throw new Error("Firebase belum dikonfigurasi.");
	}
	if (!database) {
		database = getFirestore(getApps()[0] ?? initializeApp(config));
		const emulator = import.meta.env.VITE_FIRESTORE_EMULATOR_HOST;
		if (emulator) {
			const [host, port] = emulator.split(":");
			connectFirestoreEmulator(database, host, Number(port));
		}
	}
	return database;
}
