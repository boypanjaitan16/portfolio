import { getApps, initializeApp } from "firebase/app";
import {
	initializeAppCheck,
	ReCaptchaEnterpriseProvider,
} from "firebase/app-check";
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
let appCheckInitialized = false;

function getFirebaseApp() {
	const app = getApps()[0] ?? initializeApp(config);
	const siteKey = import.meta.env.VITE_FIREBASE_APPCHECK_SITE_KEY;
	const prerender = Boolean(
		(window as Window & { __portfolioPrerenderArticles?: unknown })
			.__portfolioPrerenderArticles,
	);
	if (
		siteKey &&
		!appCheckInitialized &&
		!import.meta.env.VITE_FIRESTORE_EMULATOR_HOST &&
		!prerender
	) {
		initializeAppCheck(app, {
			provider: new ReCaptchaEnterpriseProvider(siteKey),
			isTokenAutoRefreshEnabled: true,
		});
		appCheckInitialized = true;
	}
	return app;
}

export function getFirestoreDb() {
	if (!config.apiKey || !config.projectId || !config.appId) {
		throw new Error("Firebase belum dikonfigurasi.");
	}
	if (!database) {
		database = getFirestore(getFirebaseApp());
		const emulator = import.meta.env.VITE_FIRESTORE_EMULATOR_HOST;
		if (emulator) {
			const [host, port] = emulator.split(":");
			connectFirestoreEmulator(database, host, Number(port));
		}
	}
	return database;
}
