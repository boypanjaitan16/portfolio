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
		return "Koneksi bermasalah. Periksa internet lalu coba lagi.";
	if (code === "auth/too-many-requests")
		return "Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.";
	if (
		code === "auth/user-token-expired" ||
		code === "auth/requires-recent-login"
	)
		return "Sesi perlu diperbarui. Keluar, masuk lagi, lalu coba lagi.";
	if (
		action === "reauthenticate" &&
		(code === "auth/wrong-password" || code === "auth/invalid-credential")
	)
		return "Password saat ini salah. Periksa lalu coba lagi.";
	if (action === "password" && code === "auth/weak-password")
		return "Password baru terlalu lemah. Gunakan password yang lebih kuat.";

	return action === "profile"
		? "Gagal menyimpan profil. Coba lagi."
		: "Gagal mengubah password. Coba lagi.";
}
