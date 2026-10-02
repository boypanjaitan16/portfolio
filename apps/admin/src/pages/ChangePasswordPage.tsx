import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, Form, Input } from "antd";
import {
	EmailAuthProvider,
	reauthenticateWithCredential,
	updatePassword,
} from "firebase/auth";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useOutletContext } from "react-router-dom";
import { z } from "zod";
import { accountErrorMessage } from "../lib/accountErrors";
import type { AccountOutletContext } from "../lib/accountSession";

const passwordSchema = z
	.object({
		currentPassword: z.string().min(1, "Current password is required."),
		newPassword: z
			.string()
			.min(6, "New password must be at least 6 characters."),
		confirmPassword: z.string().min(1, "Confirm your new password."),
	})
	.refine((values) => values.newPassword === values.confirmPassword, {
		path: ["confirmPassword"],
		message: "Passwords do not match.",
	});
type PasswordValues = z.infer<typeof passwordSchema>;

export function ChangePasswordPage() {
	const { user } = useOutletContext<AccountOutletContext>();
	const [feedback, setFeedback] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);
	const {
		control,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<PasswordValues>({
		resolver: zodResolver(passwordSchema),
		defaultValues: {
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		},
	});

	const submit = async (values: PasswordValues) => {
		setFeedback(null);
		if (!user.email) {
			setFeedback({
				type: "error",
				message:
					"Account email is unavailable. Sign out and sign in with an email account.",
			});
			return;
		}
		let action: "reauthenticate" | "password" = "reauthenticate";
		try {
			const credential = EmailAuthProvider.credential(
				user.email,
				values.currentPassword,
			);
			await reauthenticateWithCredential(user, credential);
			action = "password";
			await updatePassword(user, values.newPassword);
			reset();
			setFeedback({ type: "success", message: "Password changed." });
		} catch (reason) {
			setFeedback({
				type: "error",
				message: accountErrorMessage(reason, action),
			});
		}
	};

	return (
		<main className="mx-auto max-w-[1440px] px-5 pb-12 pt-8 md:px-10">
			<p className="section-kicker text-signal">Account settings</p>
			<h1 className="mt-5 text-5xl font-semibold tracking-tight">
				Change password
			</h1>
			<p className="mt-3 text-muted">
				Confirm your current password to keep your account secure.
			</p>
			<div className="mt-8">
				{feedback && (
					<Alert
						type={feedback.type}
						showIcon
						title={feedback.message}
						className="mb-6"
					/>
				)}
				<Form
					layout="vertical"
					size="large"
					onSubmitCapture={handleSubmit(submit)}
					className="w-full"
				>
					<Form.Item
						label="Current password"
						htmlFor="currentPassword"
						validateStatus={errors.currentPassword ? "error" : undefined}
						help={errors.currentPassword?.message}
					>
						<Controller
							name="currentPassword"
							control={control}
							render={({ field }) => (
								<Input.Password
									{...field}
									id="currentPassword"
									autoComplete="current-password"
									status={errors.currentPassword ? "error" : undefined}
								/>
							)}
						/>
					</Form.Item>
					<Form.Item
						label="New password"
						htmlFor="newPassword"
						validateStatus={errors.newPassword ? "error" : undefined}
						help={errors.newPassword?.message}
					>
						<Controller
							name="newPassword"
							control={control}
							render={({ field }) => (
								<Input.Password
									{...field}
									id="newPassword"
									autoComplete="new-password"
									status={errors.newPassword ? "error" : undefined}
								/>
							)}
						/>
					</Form.Item>
					<Form.Item
						label="Confirm new password"
						htmlFor="confirmPassword"
						validateStatus={errors.confirmPassword ? "error" : undefined}
						help={errors.confirmPassword?.message}
					>
						<Controller
							name="confirmPassword"
							control={control}
							render={({ field }) => (
								<Input.Password
									{...field}
									id="confirmPassword"
									autoComplete="new-password"
									status={errors.confirmPassword ? "error" : undefined}
								/>
							)}
						/>
					</Form.Item>
					<Button type="primary" htmlType="submit" loading={isSubmitting}>
						Save password
					</Button>
				</Form>
			</div>
		</main>
	);
}

export default ChangePasswordPage;
