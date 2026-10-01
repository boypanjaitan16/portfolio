import { portfolioTheme } from "@portfolio/config";
import { Alert, Card, Spin, Statistic } from "antd";
import { useArticles } from "../hooks/useArticles";

export function DashboardPage() {
	const { data, isLoading, error } = useArticles();
	const published =
		data?.filter((article) => article.status === "PUBLISHED").length ?? 0;
	const drafts =
		data?.filter((article) => article.status === "DRAFT").length ?? 0;

	return (
		<main className="mx-auto max-w-[1440px] px-5 pb-12 pt-8 md:px-10">
			<p className="section-kicker text-signal">Ringkasan portal</p>
			<h1 className="mt-5 text-5xl font-semibold tracking-tight">Dashboard</h1>
			<p className="mt-3 text-muted">
				Lihat data yang dikelola di portal admin.
			</p>
			<div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
				<section aria-label="Artikel">
					<Card title="Artikel" className="h-full border-t-4 border-t-signal">
						{isLoading && !data && (
							<div
								role="status"
								className="grid min-h-40 place-content-center gap-4 text-center"
							>
								<Spin size="large" />
								<p>Memuat statistik artikel…</p>
							</div>
						)}
						{error && (
							<Alert
								type="error"
								showIcon
								title="Gagal memuat statistik artikel"
								description={error.message}
								className={data ? "mb-6" : undefined}
							/>
						)}
						{data && (
							<div className="grid gap-6 sm:grid-cols-2">
								<div>
									<Statistic
										title="Terbit"
										value={published}
										styles={{
											content: { color: portfolioTheme.colors.primary },
										}}
									/>
								</div>
								<div>
									<Statistic title="Draft" value={drafts} />
								</div>
							</div>
						)}
					</Card>
				</section>
			</div>
		</main>
	);
}

export default DashboardPage;
