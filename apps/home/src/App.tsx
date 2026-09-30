import { Route, Routes } from "react-router-dom";
import { ScrollToTop } from "./components/ScrollToTop";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";
import { LocaleProvider } from "./i18n/LocaleProvider";
import { AboutPage } from "./pages/AboutPage";
import { ArticlePage } from "./pages/ArticlePage";
import { HomePage } from "./pages/HomePage";
import { NotesPage } from "./pages/NotesPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { WorkPage } from "./pages/WorkPage";

export default function App() {
	return (
		<LocaleProvider>
			<ScrollToTop />
			<div className="min-h-screen bg-paper text-ink">
				<SiteHeader />
				<Routes>
					<Route path="/" element={<HomePage />} />
					<Route path="/work" element={<WorkPage />} />
					<Route path="/about" element={<AboutPage />} />
					<Route path="/notes" element={<NotesPage />} />
					<Route path="/notes/:slug" element={<ArticlePage />} />
					<Route path="*" element={<NotFoundPage />} />
				</Routes>
				<SiteFooter />
			</div>
		</LocaleProvider>
	);
}
