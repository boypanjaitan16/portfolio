type AccountAction = "profile" | "reauthenticate" | "password";

export function accountErrorMessage(
	reason: unknown,
	action: AccountAction,
): string {
	const code =
		typeof reason === "object" && reason !== null && "code" in reason
			? reason.code
			: undefined;

	if (code === "auth/network-request-failed")
		return "Connection problem. Check your internet connection and try again.";
	if (code === "auth/too-many-requests")
		return "Too many attempts. Wait a moment and try again.";
	if (
		code === "auth/user-token-expired" ||
		code === "auth/requires-recent-login"
	)
		return "Your session has expired. Sign out, sign in again, and retry.";
	if (
		action === "reauthenticate" &&
		(code === "auth/wrong-password" || code === "auth/invalid-credential")
	)
		return "Current password is incorrect. Check it and try again.";
	if (action === "password" && code === "auth/weak-password")
		return "New password is too weak. Choose a stronger password.";

	return action === "profile"
		? "Could not save your profile. Try again."
		: "Could not change your password. Try again.";
}
