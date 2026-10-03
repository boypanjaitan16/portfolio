import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { ToolsLayout } from "./components/ToolsLayout";
import { ColorPickerPage } from "./pages/color-picker/ColorPickerPage";
import { ImageCompressorPage } from "./pages/image-compressor/ImageCompressorPage";
import { ImageEditorPage } from "./pages/image-editor/ImageEditorPage";
import { LegalPage } from "./pages/legal/LegalPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { PdfEditorPage } from "./pages/pdf-editor/PdfEditorPage";
import { QrCodeGeneratorPage } from "./pages/qr-code-generator/QrCodeGeneratorPage";
import { SpinningWheelPage } from "./pages/spinning-wheel/SpinningWheelPage";
import { ToolsPage } from "./pages/ToolsPage";
import { LocaleProvider, useToolsLocale } from "./toolsLocale";

// CodeMirror and the YAML parser load only when this tool is opened.
const DataFormatterPage = lazy(() =>
	import("./pages/data-formatter/DataFormatterPage").then((module) => ({
		default: module.DataFormatterPage,
	})),
);

const ImageToPdfPage = lazy(() =>
	import("./pages/image-to-pdf/ImageToPdfPage").then((module) => ({
		default: module.ImageToPdfPage,
	})),
);

export default function App() {
	return (
		<LocaleProvider>
			<Routes>
				<Route element={<ToolsLayout />}>
					<Route path="/" element={<ToolsPage />} />
					<Route path="/pdf-editor" element={<PdfEditorPage />} />
					<Route
						path="/image-to-pdf"
						element={
							<Suspense fallback={<LazyPageFallback />}>
								<ImageToPdfPage />
							</Suspense>
						}
					/>
					<Route path="/color-picker" element={<ColorPickerPage />} />
					<Route path="/qr-code-generator" element={<QrCodeGeneratorPage />} />
					<Route path="/spinning-wheel" element={<SpinningWheelPage />} />
					<Route path="/image-editor" element={<ImageEditorPage />} />
					<Route path="/image-compressor" element={<ImageCompressorPage />} />
					<Route
						path="/data-formatter"
						element={
							<Suspense fallback={<LazyPageFallback />}>
								<DataFormatterPage />
							</Suspense>
						}
					/>
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

function LazyPageFallback() {
	const { t } = useToolsLocale();
	return (
		<main className="mx-auto max-w-7xl px-5 pb-24 pt-10 md:px-10 md:pt-14">
			<p role="status" className="text-sm text-muted">
				{t.loading}
			</p>
		</main>
	);
}
