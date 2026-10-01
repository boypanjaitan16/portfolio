import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, Form, Input } from "antd";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Controller, useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { getFirebaseAuth } from "../lib/firebase";

const loginSchema = z.object({
	email: z.email("Email tidak valid."),
	password: z.string().min(1, "Password wajib diisi."),
});
type LoginValues = z.infer<typeof loginSchema>;

export function LoginPage() {
	const navigate = useNavigate();
	const location = useLocation();
	const {
		control,
		handleSubmit,
		setError,
		formState: { errors, isSubmitting },
	} = useForm<LoginValues>({
		resolver: zodResolver(loginSchema),
		defaultValues: { email: "", password: "" },
	});

	const submit = async (values: LoginValues) => {
		try {
			await signInWithEmailAndPassword(
				getFirebaseAuth(),
				values.email,
				values.password,
			);
			const from = (location.state as { from?: { pathname?: string } } | null)
				?.from?.pathname;
			navigate(from?.startsWith("/") ? from : "/", {
				replace: true,
			});
		} catch {
			setError("email", {
				message:
					"Login gagal. Periksa email dan password atau konfigurasi Firebase.",
			});
		}
	};

	return (
		<main className="grid min-h-screen place-items-center bg-paper px-5">
			<section className="w-full max-w-md border border-ink bg-white p-8 shadow-soft">
				<p className="section-kicker text-signal">Portfolio admin</p>
				<h1 className="mt-5 text-4xl font-semibold tracking-tight">Masuk</h1>
				<p className="mt-3 text-muted">
					Gunakan akun yang dibuat di Firebase Authentication.
				</p>
				{errors.email?.message?.startsWith("Login gagal") && (
					<Alert
						type="error"
						showIcon
						title={errors.email.message}
						className="mt-6"
					/>
				)}
				<Form
					layout="vertical"
					size="large"
					onSubmitCapture={handleSubmit(submit)}
					className="mt-8"
				>
					<Form.Item
						label="Email"
						htmlFor="email"
						validateStatus={errors.email ? "error" : undefined}
						help={
							errors.email?.message?.startsWith("Login gagal")
								? undefined
								: errors.email?.message
						}
					>
						<Controller
							name="email"
							control={control}
							render={({ field }) => (
								<Input
									{...field}
									id="email"
									type="email"
									autoComplete="email"
									status={errors.email ? "error" : undefined}
								/>
							)}
						/>
					</Form.Item>
					<Form.Item
						label="Password"
						htmlFor="password"
						validateStatus={errors.password ? "error" : undefined}
						help={errors.password?.message}
					>
						<Controller
							name="password"
							control={control}
							render={({ field }) => (
								<Input.Password
									{...field}
									id="password"
									autoComplete="current-password"
									status={errors.password ? "error" : undefined}
								/>
							)}
						/>
					</Form.Item>
					<Button type="primary" htmlType="submit" loading={isSubmitting} block>
						Masuk
					</Button>
				</Form>
			</section>
		</main>
	);
}
