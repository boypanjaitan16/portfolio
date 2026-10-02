import { onAuthStateChanged, type User } from "firebase/auth";
import { useEffect, useState } from "react";
import { getFirebaseAuth } from "../lib/firebase";

export function useFirebaseSession() {
	const [user, setUser] = useState<User | null>(null);
	const [checking, setChecking] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		try {
			return onAuthStateChanged(
				getFirebaseAuth(),
				(nextUser) => {
					setUser(nextUser);
					setChecking(false);
				},
				(reason) => {
					setError(reason.message);
					setChecking(false);
				},
			);
		} catch (reason) {
			setError(
				reason instanceof Error ? reason.message : "Could not load Firebase.",
			);
			setChecking(false);
		}
	}, []);

	return { user, checking, error };
}
