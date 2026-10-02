import { Route, Routes } from "react-router-dom";
import { ToolsLayout } from "./components/ToolsLayout";
import { NotFoundPage } from "./pages/NotFoundPage";
import { PdfEditorPage } from "./pages/pdf-editor/PdfEditorPage";
import { ToolsPage } from "./pages/ToolsPage";
import { LocaleProvider } from "./toolsLocale";

export default function App() {
	return (
		<LocaleProvider>
			<Routes>
				<Route element={<ToolsLayout />}>
					<Route path="/" element={<ToolsPage />} />
					<Route path="/pdf-editor" element={<PdfEditorPage />} />
					<Route path="*" element={<NotFoundPage />} />
				</Route>
			</Routes>
		</LocaleProvider>
	);
}
