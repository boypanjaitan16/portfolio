import { portfolioTheme } from "@portfolio/config";
import { Alert, Card, Spin, Statistic } from "antd";
import { useArticles } from "../hooks/useArticles";
import { useContactMessages } from "../hooks/useContactMessages";

export function DashboardPage() {
	const { data, isLoading, error } = useArticles();
	const contacts = useContactMessages();
	const newMessages =
		contacts.data?.filter((item) => item.status === "NEW").length ?? 0;
	const inProgress =
		contacts.data?.filter((item) => item.status === "IN_PROGRESS").length ?? 0;
	const published =
		data?.filter((article) => article.status === "PUBLISHED").length ?? 0;
	const drafts =
		data?.filter((article) => article.status === "DRAFT").length ?? 0;

	return (
		<main className="mx-auto max-w-[1440px] px-5 pb-12 pt-8 md:px-10">
			<p className="section-kicker text-signal">Portal overview</p>
			<h1 className="mt-5 text-5xl font-semibold tracking-tight">Dashboard</h1>
			<p className="mt-3 text-muted">
				View the content and messages managed in the admin portal.
			</p>
			<div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
				<section aria-label="Articles">
					<Card title="Articles" className="h-full border-t-4 border-t-signal">
						{isLoading && !data && (
							<div
								role="status"
								className="grid min-h-40 place-content-center gap-4 text-center"
							>
								<Spin size="large" />
								<p>Loading article statistics…</p>
							</div>
						)}
						{error && (
							<Alert
								type="error"
								showIcon
								title="Could not load article statistics"
								description={error.message}
								className={data ? "mb-6" : undefined}
							/>
						)}
						{data && (
							<div className="grid gap-6 sm:grid-cols-2">
								<div>
									<Statistic
										title="Published"
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
				<section aria-label="Messages">
					<Card title="Messages" className="h-full border-t-4 border-t-signal">
						{contacts.isLoading && !contacts.data && (
							<div
								role="status"
								className="grid min-h-40 place-content-center gap-4 text-center"
							>
								<Spin size="large" />
								<p>Loading message statistics…</p>
							</div>
						)}
						{contacts.error && (
							<Alert
								type="error"
								showIcon
								title="Could not load message statistics"
								description={contacts.error.message}
								className={contacts.data ? "mb-6" : undefined}
							/>
						)}
						{contacts.data && (
							<div className="grid gap-6 sm:grid-cols-2">
								<Statistic
									title="New"
									value={newMessages}
									styles={{ content: { color: portfolioTheme.colors.primary } }}
								/>
								<Statistic title="In progress" value={inProgress} />
							</div>
						)}
					</Card>
				</section>
			</div>
		</main>
	);
}

export default DashboardPage;
