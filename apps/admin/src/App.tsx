import { Alert, Spin } from "antd";
import { lazy, Suspense } from "react";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { AdminLayout } from "./components/AdminLayout";
import { useFirebaseSession } from "./hooks/useFirebaseSession";

const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const ArticleFormPage = lazy(() => import("./pages/articles/ArticleFormPage"));
const ArticlePreviewPage = lazy(
	() => import("./pages/articles/ArticlePreviewPage"),
);
const ArticlesPage = lazy(() => import("./pages/articles/ArticlesPage"));

import { LoginPage } from "./pages/LoginPage";

function Guard() {
	const location = useLocation();
	const { user, checking, error } = useFirebaseSession();
	if (checking)
		return (
			<div className="grid min-h-screen place-items-center">
				<Spin size="large" aria-label="Memeriksa sesi" />
			</div>
		);
	if (error)
		return <Alert type="error" showIcon title={error} className="m-10" />;
	if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
	return (
		<AdminLayout>
			<Outlet />
		</AdminLayout>
	);
}

export default function App() {
	return (
		<Suspense
			fallback={
				<div className="grid min-h-screen place-items-center">
					<Spin size="large" aria-label="Memuat halaman" />
				</div>
			}
		>
			<Routes>
				<Route path="/login" element={<LoginPage />} />
				<Route element={<Guard />}>
					<Route path="/" element={<DashboardPage />} />
					<Route path="/articles" element={<ArticlesPage />} />
					<Route path="/articles/new" element={<ArticleFormPage />} />
					<Route
						path="/articles/:articleId/edit"
						element={<ArticleFormPage />}
					/>
					<Route
						path="/articles/:articleId/preview"
						element={<ArticlePreviewPage />}
					/>
				</Route>
				<Route
					path="*"
					element={<p className="p-10">Halaman admin tidak ditemukan.</p>}
				/>
			</Routes>
		</Suspense>
	);
}
