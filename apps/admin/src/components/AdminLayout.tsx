import { Alert, Breadcrumb, Button, Dropdown } from "antd";
import { signOut } from "firebase/auth";
import { ChevronDown, UserRound } from "lucide-react";
import { type ReactNode, useState } from "react";
import {
	Link,
	matchPath,
	NavLink,
	useLocation,
	useNavigate,
} from "react-router-dom";
import { getFirebaseAuth } from "../lib/firebase";
import { queryClient } from "../lib/queryClient";

function breadcrumbItems(pathname: string): { title: ReactNode }[] {
	const items: { title: ReactNode }[] = [
		{
			title: pathname === "/" ? "Dashboard" : <Link to="/">Dashboard</Link>,
		},
	];
	if (pathname === "/contacts") return [...items, { title: "Pesan" }];
	if (pathname === "/profile") return [...items, { title: "Ubah profil" }];
	if (pathname === "/change-password")
		return [...items, { title: "Ubah password" }];
	if (!pathname.startsWith("/articles")) return items;

	items.push({
		title:
			pathname === "/articles" ? (
				"Artikel"
			) : (
				<Link to="/articles">Artikel</Link>
			),
	});
	if (pathname === "/articles/new") items.push({ title: "Artikel baru" });
	else if (matchPath("/articles/:articleId/edit", pathname))
		items.push({ title: "Edit artikel" });
	else if (matchPath("/articles/:articleId/preview", pathname))
		items.push({ title: "Preview artikel" });
	return items;
}

export function AdminLayout({
	children,
	accountName,
}: {
	children: ReactNode;
	accountName: string | null;
}) {
	const navigate = useNavigate();
	const { pathname } = useLocation();
	const accountLabel = accountName?.trim() || "Akun";
	const [signOutError, setSignOutError] = useState<string | null>(null);
	const handleSignOut = async () => {
		setSignOutError(null);
		try {
			await signOut(getFirebaseAuth());
			queryClient.clear();
			navigate("/login", { replace: true });
		} catch {
			setSignOutError("Gagal keluar. Periksa koneksi lalu coba lagi.");
		}
	};

	return (
		<div className="min-h-screen bg-paper text-ink">
			<header className="sticky top-0 z-40 border-b border-ink/20 bg-paper">
				<div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-x-6 gap-y-4 px-5 py-5 md:px-10">
					<Link
						to="/"
						className="flex items-center gap-3 font-mono text-xs font-semibold uppercase tracking-[0.16em]"
					>
						<span className="grid h-9 w-9 place-items-center bg-signal text-white">
							BP
						</span>
						<span>Portfolio admin</span>
					</Link>
					<nav
						aria-label="Navigasi admin"
						className="order-3 flex w-full gap-6 border-t border-ink/15 pt-3 font-mono text-xs font-semibold uppercase tracking-[0.12em] md:order-none md:w-auto md:border-0 md:pt-0"
					>
						<NavLink
							end
							to="/"
							className={({ isActive }) =>
								isActive ? "text-signal" : "hover:text-signal"
							}
						>
							Dashboard
						</NavLink>
						<NavLink
							to="/articles"
							className={({ isActive }) =>
								isActive ? "text-signal" : "hover:text-signal"
							}
						>
							Artikel
						</NavLink>
						<NavLink
							to="/contacts"
							className={({ isActive }) =>
								isActive ? "text-signal" : "hover:text-signal"
							}
						>
							Pesan
						</NavLink>
					</nav>
					<Dropdown
						trigger={["click"]}
						menu={{
							items: [
								{ key: "profile", label: "Ubah profil" },
								{ key: "password", label: "Ubah password" },
								{ type: "divider" },
								{ key: "logout", label: "Keluar" },
							],
							onClick: ({ key }) => {
								if (key === "profile") navigate("/profile");
								else if (key === "password") navigate("/change-password");
								else if (key === "logout") void handleSignOut();
							},
						}}
					>
						<Button type="text" icon={<UserRound size={16} />}>
							<span
								className="inline-block max-w-28 truncate align-middle sm:max-w-40 md:max-w-48"
								title={accountLabel}
							>
								{accountLabel}
							</span>
							<ChevronDown size={14} aria-hidden="true" />
						</Button>
					</Dropdown>
				</div>
			</header>
			{signOutError && (
				<Alert
					type="error"
					showIcon
					title={signOutError}
					className="mx-5 mt-5 md:mx-10"
				/>
			)}
			<div className="mx-auto max-w-[1440px] px-5 pt-6 md:px-10">
				<Breadcrumb
					aria-label="Breadcrumb admin"
					items={breadcrumbItems(pathname)}
				/>
			</div>
			{children}
		</div>
	);
}
