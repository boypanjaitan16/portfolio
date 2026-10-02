import { getApps, initializeApp } from "firebase/app";
import {
	initializeAppCheck,
	ReCaptchaEnterpriseProvider,
} from "firebase/app-check";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const config = {
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
	storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
	appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let appCheckInitialized = false;

export function getFirebaseApp() {
	if (!config.apiKey || !config.projectId || !config.appId) {
		throw new Error("Firebase is not configured.");
	}
	const app = getApps()[0] ?? initializeApp(config);
	const siteKey = import.meta.env.VITE_FIREBASE_APPCHECK_SITE_KEY;
	if (
		siteKey &&
		!appCheckInitialized &&
		!import.meta.env.VITE_FIRESTORE_EMULATOR_HOST
	) {
		initializeAppCheck(app, {
			provider: new ReCaptchaEnterpriseProvider(siteKey),
			isTokenAutoRefreshEnabled: true,
		});
		appCheckInitialized = true;
	}
	return app;
}

export function getFirebaseAuth() {
	return getAuth(getFirebaseApp());
}

export function getFirestoreDb() {
	return getFirestore(getFirebaseApp());
}

export function getFirebaseStorage() {
	return getStorage(getFirebaseApp());
}
