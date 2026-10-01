import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, Form, Input } from "antd";
import { updateProfile } from "firebase/auth";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useOutletContext } from "react-router-dom";
import { z } from "zod";
import { accountErrorMessage } from "../lib/accountErrors";
import type { AccountOutletContext } from "../lib/accountSession";

const profileSchema = z.object({
	displayName: z.string().trim().min(1, "Nama tampilan wajib diisi."),
});
type ProfileValues = z.infer<typeof profileSchema>;

export function ProfilePage() {
	const { user, onDisplayNameChange } =
		useOutletContext<AccountOutletContext>();
	const [feedback, setFeedback] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);
	const {
		control,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<ProfileValues>({
		resolver: zodResolver(profileSchema),
		defaultValues: { displayName: user.displayName ?? "" },
	});

	const submit = async ({ displayName }: ProfileValues) => {
		setFeedback(null);
		try {
			await updateProfile(user, { displayName });
			onDisplayNameChange(displayName);
			reset({ displayName });
			setFeedback({ type: "success", message: "Profil berhasil diperbarui." });
		} catch (reason) {
			setFeedback({
				type: "error",
				message: accountErrorMessage(reason, "profile"),
			});
		}
	};

	return (
		<main className="mx-auto max-w-[1440px] px-5 pb-12 pt-8 md:px-10">
			<p className="section-kicker text-signal">Pengaturan akun</p>
			<h1 className="mt-5 text-5xl font-semibold tracking-tight">
				Ubah profil
			</h1>
			<p className="mt-3 text-muted">
				Perbarui nama yang tertera pada akun admin.
			</p>
			<div className="mt-8">
				<div>
					<p className="mb-2 font-medium">Email akun</p>
					<p className="text-muted">{user.email ?? "Email tidak tersedia."}</p>
				</div>
				{feedback && (
					<Alert
						type={feedback.type}
						showIcon
						title={feedback.message}
						className="mt-6"
					/>
				)}
				<Form
					layout="vertical"
					size="large"
					onSubmitCapture={handleSubmit(submit)}
					className="mt-6 w-full"
				>
					<Form.Item
						label="Nama tampilan"
						htmlFor="displayName"
						validateStatus={errors.displayName ? "error" : undefined}
						help={errors.displayName?.message}
					>
						<Controller
							name="displayName"
							control={control}
							render={({ field }) => (
								<Input
									{...field}
									id="displayName"
									autoComplete="name"
									status={errors.displayName ? "error" : undefined}
								/>
							)}
						/>
					</Form.Item>
					<Button type="primary" htmlType="submit" loading={isSubmitting}>
						Simpan profil
					</Button>
				</Form>
			</div>
		</main>
	);
}

export default ProfilePage;
