import { Route, Routes } from "react-router-dom";
import { ToolRoute } from "./components/ToolRoute";
import { ToolsLayout } from "./components/ToolsLayout";
import { LegalPage } from "./pages/legal/LegalPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ToolsPage } from "./pages/ToolsPage";
import { tools } from "./toolCatalog";
import { LocaleProvider } from "./toolsLocale";

export default function App() {
	return (
		<LocaleProvider>
			<Routes>
				<Route element={<ToolsLayout />}>
					<Route path="/" element={<ToolsPage />} />
					{/* Tool pages are lazy-loaded; see toolCatalog.ts. */}
					{tools.map((tool) => (
						<Route
							key={tool.slug}
							path={`/${tool.slug}`}
							element={<ToolRoute tool={tool} />}
						/>
					))}
					<Route
						path="/privacy-policy"
						element={<LegalPage kind="privacy" />}
					/>
					<Route
						path="/terms-of-service"
						element={<LegalPage kind="terms" />}
					/>
					<Route path="*" element={<NotFoundPage />} />
				</Route>
			</Routes>
		</LocaleProvider>
	);
}
